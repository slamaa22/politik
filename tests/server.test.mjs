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

    // 4. Save partial baseline progress & verify reload
    const progRes = await fetch(`${baseUrl}/api/baseline-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stepIdx: 1,
        stepResults: [{ partId: 'part1', transcript: 'Test', analysis: { obamaIndex: 70 } }, null, null],
      }),
    }).then((r) => r.json());
    assert.equal(progRes.baselineProgress.stepIdx, 1);
    assert.equal(progRes.baselineProgress.stepResults[0].partId, 'part1');

    // 5. Upload & stream audio file
    const audioUp = await fetch(`${baseUrl}/api/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'audio/webm' },
      body: Buffer.from('FAKE_WEBM_AUDIO_BYTES'),
    });
    assert.equal(audioUp.status, 201);
    const { audioUrl } = await audioUp.json();
    assert.ok(audioUrl.startsWith('/api/audio/rec_'));
    const audioGet = await fetch(`${baseUrl}${audioUrl}`);
    assert.equal(audioGet.status, 200);
    assert.equal(await audioGet.text(), 'FAKE_WEBM_AUDIO_BYTES');
    const audioRange = await fetch(`${baseUrl}${audioUrl}`, { headers: { Range: 'bytes=0-3' } });
    assert.equal(audioRange.status, 206);
    assert.equal(await audioRange.text(), 'FAKE');

    // 6. Save baseline
    const baseRes = await fetch(`${baseUrl}/api/baseline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obamaIndex: 64,
        dimensions: { tempo: 70, pausen: 55, dynamik: 60, stilmittel: 58, wirCharisma: 72, klarheit: 69 },
      }),
    }).then((r) => r.json());
    assert.equal(baseRes.baseline.obamaIndex, 64);

    // 7. Save session, verify DELETE cleans up session & audio, and test scope='sessions' reset preserves baseline
    const sessAudioUp = await fetch(`${baseUrl}/api/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'audio/webm' },
      body: Buffer.from('SESSION_AUDIO_BYTES'),
    }).then((r) => r.json());
    const sessRes = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'sess_del_test',
        type: 'teleprompter',
        title: 'Test-Ablesen',
        audioUrl: sessAudioUp.audioUrl,
        analysis: { obamaIndex: 82 },
      }),
    }).then((r) => r.json());
    assert.equal(sessRes.state.sessions.length, 1);

    const delRes = await fetch(`${baseUrl}/api/sessions/sess_del_test`, { method: 'DELETE' }).then((r) => r.json());
    assert.equal(delRes.sessions.length, 0);
    const deletedAudioGet = await fetch(`${baseUrl}${sessAudioUp.audioUrl}`);
    assert.equal(deletedAudioGet.status, 404);

    // Re-add session and reset only sessions -> baseline stays intact
    await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'sess_keep_base', type: 'spontanrede', analysis: { obamaIndex: 74 } }),
    });
    const resetSessRes = await fetch(`${baseUrl}/api/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'sessions' }),
    }).then((r) => r.json());
    assert.equal(resetSessRes.sessions.length, 0);
    assert.equal(resetSessRes.baseline.obamaIndex, 64);

    const speechRes = await fetch(`${baseUrl}/api/speeches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Testrede', text: 'Wir stehen heute hier.' }),
    }).then((r) => r.json());
    assert.equal(speechRes.speech.title, 'Testrede');

    // 8. Reset all
    const resetRes = await fetch(`${baseUrl}/api/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'all' }),
    }).then((r) => r.json());
    assert.equal(resetRes.baseline, null);
    assert.equal(resetRes.baselineProgress.stepIdx, 0);
    assert.equal(resetRes.sessions.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
