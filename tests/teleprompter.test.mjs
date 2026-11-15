import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTeleprompterPxPerSec,
  countSpokenWords,
  formatCuedSpeechHtml,
  parsePauseSeconds,
} from '../public/js/teleprompter.js';

test('parsePauseSeconds parses dot, comma, and fallback durations accurately', () => {
  assert.equal(parsePauseSeconds(' 1.5s'), 1.5);
  assert.equal(parsePauseSeconds(' 0.8s'), 0.8);
  assert.equal(parsePauseSeconds(' 2,0s'), 2);
  assert.equal(parsePauseSeconds(''), 1.2);
  assert.equal(parsePauseSeconds(' 25s'), 10);
});

test('countSpokenWords excludes cue tags while keeping emphasized words', () => {
  const sample = `[RUHIGER]
    Man sagt uns heute oft: [PAUSE 1.5s]
    [CRESCENDO] Wir öffnen [BETONUNG] Türen und [BETONUNG: Herzen].`;
  // Words: Man sagt uns heute oft Wir öffnen Türen und Herzen (10 words)
  assert.equal(countSpokenWords(sample), 10);
});

test('computeTeleprompterPxPerSec calibrates scroll speed to text height and WPM', () => {
  // 120 words at 120 WPM = 60 seconds speaking time.
  // If rendered text height is 900px, exact scroll speed is 900 / 60 = 15 px/s.
  const desktopSpeed = computeTeleprompterPxPerSec({
    wpm: 120,
    wordCount: 120,
    textHeightPx: 900,
    fontSizePx: 28,
  });
  assert.equal(desktopSpeed, 15);

  // On a narrower mobile screen, the same 120 words wrap taller (e.g. 1800px), doubling px/s so timing stays exact.
  const mobileSpeed = computeTeleprompterPxPerSec({
    wpm: 120,
    wordCount: 120,
    textHeightPx: 1800,
    fontSizePx: 28,
  });
  assert.equal(mobileSpeed, 30);

  // Faster WPM scales linearly
  const fasterSpeed = computeTeleprompterPxPerSec({
    wpm: 150,
    wordCount: 120,
    textHeightPx: 900,
    fontSizePx: 28,
  });
  assert.ok(Math.abs(fasterSpeed - 18.75) < 0.001);
});

test('formatCuedSpeechHtml annotates pause durations safely and preserves emphasis syntax', () => {
  const html = formatCuedSpeechHtml('Hallo <Welt> [PAUSE 1.5s] [BETONUNG] Mut und [BETONUNG: Zuversicht]');
  assert.ok(html.includes('&lt;Welt&gt;'));
  assert.ok(html.includes('data-pause-sec="1.5"'));
  assert.ok(html.includes('<span class="cue-emphasis">Mut</span>'));
  assert.ok(html.includes('<span class="cue-emphasis">Zuversicht</span>'));
});
