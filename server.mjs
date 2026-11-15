import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const AUDIO_MIME_TYPES = {
  '.webm': 'audio/webm',
  '.ogg': 'audio/ogg',
  '.mp4': 'audio/mp4',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
};

const DEFAULT_STATE = {
  baseline: null,
  baselineProgress: {
    stepIdx: 0,
    stepResults: [null, null, null],
  },
  sessions: [],
  customSpeeches: [],
  storyDraft: {
    self: '',
    us: '',
    now: '',
  },
  completedLessons: {},
  updatedAt: null,
};

function createWhisperBridge(workerScript) {
  let proc = null;
  let readyPromise = null;
  let lineBuffer = '';
  const pending = [];

  function rejectAll(err) {
    while (pending.length) {
      const item = pending.shift();
      item.reject(err);
    }
  }

  function ensureStarted() {
    if (readyPromise) return readyPromise;
    readyPromise = new Promise((resolve, reject) => {
      const pyBin = process.env.PYTHON_BIN || 'python3';
      proc = spawn(pyBin, [workerScript], { stdio: ['pipe', 'pipe', 'pipe'] });

      let settled = false;
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', (chunk) => {
        lineBuffer += chunk;
        let idx;
        while ((idx = lineBuffer.indexOf('\n')) !== -1) {
          const line = lineBuffer.slice(0, idx).trim();
          lineBuffer = lineBuffer.slice(idx + 1);
          if (!line) continue;
          try {
            const msg = JSON.parse(line);
            if (!settled) {
              settled = true;
              if (msg.ready) resolve(true);
              else reject(new Error(msg.error || 'Whisper worker failed to initialize'));
            } else if (pending.length > 0) {
              const item = pending.shift();
              item.resolve(msg);
            }
          } catch (err) {
            if (!settled) {
              settled = true;
              reject(err);
            }
          }
        }
      });

      proc.on('error', (err) => {
        readyPromise = null;
        if (!settled) {
          settled = true;
          reject(err);
        }
        rejectAll(err);
      });

      proc.on('exit', (code) => {
        proc = null;
        readyPromise = null;
        const err = new Error(`Whisper worker exited with code ${code}`);
        if (!settled) {
          settled = true;
          reject(err);
        }
        rejectAll(err);
      });
    });
    return readyPromise;
  }

  let queue = Promise.resolve();
  async function transcribe(filePath, language = 'de') {
    await ensureStarted();
    const run = async () =>
      new Promise((resolve, reject) => {
        if (!proc || !proc.stdin.writable) {
          return reject(new Error('Whisper worker stdin unavailable'));
        }
        pending.push({ resolve, reject });
        proc.stdin.write(`${JSON.stringify({ path: filePath, language })}\n`);
      });

    const resultPromise = queue.then(run, run);
    queue = resultPromise.catch(() => {});
    return resultPromise;
  }

  function stop() {
    if (proc) {
      try {
        proc.kill();
      } catch {
        // ignore
      }
      proc = null;
      readyPromise = null;
    }
  }

  return { transcribe, stop };
}

async function ensureStateFile(dataFile) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
  }
}

async function readState(dataFile) {
  await ensureStateFile(dataFile);
  const raw = await fs.readFile(dataFile, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    const bp = parsed.baselineProgress || {};
    return {
      ...DEFAULT_STATE,
      ...parsed,
      baselineProgress: {
        stepIdx: Number.isInteger(bp.stepIdx) ? bp.stepIdx : 0,
        stepResults: Array.isArray(bp.stepResults) && bp.stepResults.length === 3
          ? bp.stepResults
          : [null, null, null],
      },
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      customSpeeches: Array.isArray(parsed.customSpeeches) ? parsed.customSpeeches : [],
      storyDraft: { ...DEFAULT_STATE.storyDraft, ...(parsed.storyDraft || {}) },
      completedLessons:
        parsed.completedLessons && typeof parsed.completedLessons === 'object' && !Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : {},
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

async function writeState(dataFile, nextState) {
  await ensureStateFile(dataFile);
  const payload = {
    ...nextState,
    updatedAt: new Date().toISOString(),
  };
  const tmpFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(payload, null, 2), 'utf8');
  await fs.rename(tmpFile, dataFile);
  return payload;
}

function sendJson(res, statusCode, body) {
  const data = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
  });
  res.end(data);
}

async function readRawBody(req, maxBytes = 20 * 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error('Payload too large');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function parseJsonBody(req) {
  const buf = await readRawBody(req, 5 * 1024 * 1024);
  const text = buf.toString('utf8').trim();
  if (!text) return {};
  return JSON.parse(text);
}

function getAudioExt(contentType = '') {
  const ct = String(contentType).toLowerCase();
  if (ct.includes('ogg')) return '.ogg';
  if (ct.includes('mp4') || ct.includes('m4a')) return '.mp4';
  if (ct.includes('wav')) return '.wav';
  return '.webm';
}

export function createAppServer({
  publicDir = path.join(__dirname, 'public'),
  dataFile = path.join(__dirname, 'data', 'trainer-state.json'),
  workerScript = path.join(__dirname, 'transcribe_worker.py'),
} = {}) {
  const resolvedPublic = path.resolve(publicDir);
  const audioDir = path.join(path.dirname(dataFile), 'audio');
  const whisper = createWhisperBridge(workerScript);

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = decodeURIComponent(url.pathname);

      if (pathname === '/api/health' && req.method === 'GET') {
        return sendJson(res, 200, { ok: true, service: 'obama-rhetoriktrainer' });
      }

      if (pathname === '/api/state' && req.method === 'GET') {
        const state = await readState(dataFile);
        return sendJson(res, 200, state);
      }

      if (pathname === '/api/audio' && req.method === 'POST') {
        const audioBuf = await readRawBody(req, 20 * 1024 * 1024);
        if (!audioBuf.length) {
          return sendJson(res, 400, { ok: false, error: 'Leere Audiodatei.' });
        }
        await fs.mkdir(audioDir, { recursive: true });
        const ext = getAudioExt(req.headers['content-type']);
        const fileName = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
        await fs.writeFile(path.join(audioDir, fileName), audioBuf);
        return sendJson(res, 201, { ok: true, audioUrl: `/api/audio/${fileName}` });
      }

      if (pathname.startsWith('/api/audio/') && req.method === 'GET') {
        const rawName = path.basename(pathname.slice('/api/audio/'.length));
        if (!/^rec_[a-z0-9_]+\.(webm|ogg|mp4|m4a|wav)$/i.test(rawName)) {
          return sendJson(res, 400, { error: 'Ungültiger Dateiname.' });
        }
        const filePath = path.join(audioDir, rawName);
        let stat;
        try {
          stat = await fs.stat(filePath);
        } catch {
          return sendJson(res, 404, { error: 'Audiodatei nicht gefunden.' });
        }
        const ext = path.extname(rawName).toLowerCase();
        const contentType = AUDIO_MIME_TYPES[ext] || 'audio/webm';
        const data = await fs.readFile(filePath);
        const range = req.headers.range;
        if (range) {
          const match = /bytes=(\d*)-(\d*)/.exec(range);
          const start = match && match[1] ? Number(match[1]) : 0;
          const end = match && match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
          if (start >= stat.size || start > end) {
            res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
            return res.end();
          }
          const slice = data.subarray(start, end + 1);
          res.writeHead(206, {
            'Content-Type': contentType,
            'Content-Length': slice.length,
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
          });
          return res.end(slice);
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': data.length,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
        });
        return res.end(data);
      }

      if (pathname === '/api/transcribe' && req.method === 'POST') {
        const audioBuf = await readRawBody(req, 20 * 1024 * 1024);
        if (!audioBuf.length) {
          return sendJson(res, 400, { ok: false, error: 'Leere Audiodatei.' });
        }
        const ext = getAudioExt(req.headers['content-type']);
        const tmpFile = path.join(os.tmpdir(), `orator_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`);
        try {
          await fs.writeFile(tmpFile, audioBuf);
          const result = await whisper.transcribe(tmpFile, 'de');
          if (!result.ok) {
            return sendJson(res, 500, { ok: false, error: result.error || 'Transkription fehlgeschlagen' });
          }
          return sendJson(res, 200, { ok: true, text: result.text || '', language: result.language || 'de' });
        } catch (err) {
          return sendJson(res, 503, {
            ok: false,
            unavailable: true,
            error: err.message || 'Server-Transkription nicht verfügbar',
          });
        } finally {
          await fs.rm(tmpFile, { force: true }).catch(() => {});
        }
      }

      if (pathname === '/api/baseline-progress' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const state = await readState(dataFile);
        const stepIdx = Number.isInteger(body.stepIdx)
          ? Math.max(0, Math.min(2, body.stepIdx))
          : state.baselineProgress.stepIdx;
        const stepResults = Array.isArray(body.stepResults) && body.stepResults.length === 3
          ? body.stepResults
          : state.baselineProgress.stepResults;
        state.baselineProgress = { stepIdx, stepResults };
        const saved = await writeState(dataFile, state);
        return sendJson(res, 200, saved);
      }

      if (pathname === '/api/baseline' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const state = await readState(dataFile);
        state.baseline = {
          ...body,
          completedAt: body.completedAt || new Date().toISOString(),
        };
        const saved = await writeState(dataFile, state);
        return sendJson(res, 200, saved);
      }

      if (pathname === '/api/sessions' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const state = await readState(dataFile);
        const session = {
          id: body.id || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: body.createdAt || new Date().toISOString(),
          ...body,
        };
        state.sessions = [session, ...state.sessions].slice(0, 200);
        const saved = await writeState(dataFile, state);
        return sendJson(res, 201, { session, state: saved });
      }

      if (pathname.startsWith('/api/sessions/') && req.method === 'DELETE') {
        const id = decodeURIComponent(pathname.slice('/api/sessions/'.length));
        const state = await readState(dataFile);
        const target = state.sessions.find((s) => s.id === id);
        if (target?.audioUrl && target.audioUrl.startsWith('/api/audio/')) {
          const rawName = path.basename(target.audioUrl.slice('/api/audio/'.length));
          if (/^rec_[a-z0-9_]+\.(webm|ogg|mp4|m4a|wav)$/i.test(rawName)) {
            await fs.rm(path.join(audioDir, rawName), { force: true }).catch(() => {});
          }
        }
        state.sessions = state.sessions.filter((s) => s.id !== id);
        const saved = await writeState(dataFile, state);
        return sendJson(res, 200, saved);
      }

      if (pathname === '/api/speeches' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.title || !body.text) {
          return sendJson(res, 400, { error: 'Titel und Text sind erforderlich.' });
        }
        const state = await readState(dataFile);
        const speech = {
          id: `custom_${Date.now()}`,
          title: String(body.title).trim(),
          category: String(body.category || 'Eigene Rede').trim(),
          technique: String(body.technique || 'Freier Stil').trim(),
          targetWpm: Number(body.targetWpm) || 125,
          text: String(body.text).trim(),
          custom: true,
        };
        state.customSpeeches = [speech, ...state.customSpeeches];
        const saved = await writeState(dataFile, state);
        return sendJson(res, 201, { speech, state: saved });
      }

      if (pathname === '/api/story-draft' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const state = await readState(dataFile);
        state.storyDraft = {
          self: String(body.self ?? state.storyDraft.self ?? ''),
          us: String(body.us ?? state.storyDraft.us ?? ''),
          now: String(body.now ?? state.storyDraft.now ?? ''),
        };
        const saved = await writeState(dataFile, state);
        return sendJson(res, 200, saved);
      }

      if (pathname === '/api/lessons' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const lessonId = String(body.lessonId || '').trim();
        if (!lessonId) {
          return sendJson(res, 400, { error: 'lessonId ist erforderlich.' });
        }
        const state = await readState(dataFile);
        const prev = state.completedLessons?.[lessonId];
        const score = Number(body.score || 0);
        state.completedLessons = {
          ...(state.completedLessons || {}),
          [lessonId]: {
            lessonId,
            title: String(body.title || prev?.title || lessonId),
            passed: Boolean(prev?.passed) || body.passed !== false,
            bestScore: Math.max(Number(prev?.bestScore || 0), score),
            lastScore: score,
            completedAt: prev?.completedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
        const saved = await writeState(dataFile, state);
        return sendJson(res, 200, saved);
      }

      if (pathname === '/api/reset' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const state = await readState(dataFile);
        if (body.scope === 'all') {
          await fs.rm(audioDir, { recursive: true, force: true }).catch(() => {});
          const saved = await writeState(dataFile, structuredClone(DEFAULT_STATE));
          return sendJson(res, 200, saved);
        }
        if (body.scope === 'sessions') {
          for (const s of state.sessions) {
            if (s?.audioUrl && s.audioUrl.startsWith('/api/audio/')) {
              const rawName = path.basename(s.audioUrl.slice('/api/audio/'.length));
              if (/^rec_[a-z0-9_]+\.(webm|ogg|mp4|m4a|wav)$/i.test(rawName)) {
                await fs.rm(path.join(audioDir, rawName), { force: true }).catch(() => {});
              }
            }
          }
          state.sessions = [];
          const saved = await writeState(dataFile, state);
          return sendJson(res, 200, saved);
        }
        state.baseline = null;
        state.baselineProgress = { stepIdx: 0, stepResults: [null, null, null] };
        const saved = await writeState(dataFile, state);
        return sendJson(res, 200, saved);
      }

      if (pathname.startsWith('/api/')) {
        return sendJson(res, 404, { error: 'API endpoint not found' });
      }

      // Static file serving with no-cache so deployments reflect immediately
      const relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const targetPath = path.resolve(resolvedPublic, relPath);
      if (!targetPath.startsWith(resolvedPublic + path.sep) && targetPath !== resolvedPublic) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      let filePath = targetPath;
      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
      } catch {
        filePath = path.join(resolvedPublic, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = await fs.readFile(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, must-revalidate',
      });
      res.end(content);
    } catch (err) {
      console.error('Server error:', err);
      if (!res.headersSent) {
        sendJson(res, 500, { error: err.message || 'Internal Server Error' });
      }
    }
  });

  server.on('close', () => whisper.stop());
  return server;
}

if (process.argv[1] === __filename) {
  const port = Number(process.env.PORT) || 3456;
  const host = process.env.HOST || '0.0.0.0';
  const server = createAppServer();
  server.listen(port, host, () => {
    console.log(`\n  ORATOR // Rhetoriktrainer läuft auf http://${host}:${port}\n`);
  });
}
