import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createAppServer } from '../server.mjs';

test('HTTP server serves static app and persists baseline, sessions, speeches, and reset', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'orator-test-'));
  const dataFile = path.join(tmpDir, 'state.json');
  const server = createAppServer({
    dataFile,
    workerScript: path.join(tmpDir, 'nonexistent_worker.py'),
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Health & HTML
    const health = await fetch(`${baseUrl}/api/health`).then((r) => r.json());
    assert.equal(health.ok, true);

    const htmlRes = await fetch(`${baseUrl}/`);
    assert.equal(htmlRes.status, 200);
    assert.equal(htmlRes.headers.get('cache-control'), 'no-cache, must-revalidate');
    const html = await htmlRes.text();
    assert.ok(html.includes('ORATOR — Rhetoriktrainer'));

    // 2. Transcribe validation & graceful unavailability
    const emptyTranscribe = await fetch(`${baseUrl}/api/transcribe`, {
      method: 'POST',
      body: Buffer.alloc(0),
    });
    assert.equal(emptyTranscribe.status, 400);

    const unavailTranscribe = await fetch(`${baseUrl}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'audio/webm' },
      body: Buffer.from('fake-webm-bytes'),
    });
    assert.equal(unavailTranscribe.status, 503);
    const unavailJson = await unavailTranscribe.json();
    assert.equal(unavailJson.ok, false);
    assert.equal(unavailJson.unavailable, true);

    // 3. Initial empty state
    const initialState = await fetch(`${baseUrl}/api/state`).then((r) => r.json());
    assert.equal(initialState.baseline, null);
    assert.deepEqual(initialState.sessions, []);

    // 4. Save baseline
    const baseRes = await fetch(`${baseUrl}/api/baseline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obamaIndex: 64,
        dimensions: { tempo: 70, pausen: 55, dynamik: 60, stilmittel: 58, wirCharisma: 72, klarheit: 69 },
      }),
    }).then((r) => r.json());
    assert.equal(baseRes.baseline.obamaIndex, 64);

    // 5. Save session & custom speech
    const sessRes = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'spontanrede', title: 'Test-Spontanrede', analysis: { obamaIndex: 72 } }),
    }).then((r) => r.json());
    assert.equal(sessRes.state.sessions.length, 1);

    const speechRes = await fetch(`${baseUrl}/api/speeches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Testrede', text: 'Wir stehen heute hier.' }),
    }).then((r) => r.json());
    assert.equal(speechRes.speech.title, 'Testrede');

    // 6. Reset all
    const resetRes = await fetch(`${baseUrl}/api/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'all' }),
    }).then((r) => r.json());
    assert.equal(resetRes.baseline, null);
    assert.equal(resetRes.sessions.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
