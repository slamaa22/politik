import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeAudioSamples,
  analyzeSpeech,
  buildTrainingPlan,
  detectFillers,
  detectPitchHz,
  detectRhetoricalDevices,
  matchMandatoryWords,
} from '../public/js/analyzer.js';

test('detects Obama-style rhetorical devices in German text', () => {
  const speech = `
    Es geht nicht um parteipolitische Spielchen, sondern es geht um unsere gemeinsame Zukunft.
    Wir glauben an faire Löhne. Wir glauben an starke Schulen. Wir glauben an Zusammenhalt.
    Wir brauchen Mut, Vertrauen und Zuversicht. Das ändert sich heute.
  `;
  const devices = detectRhetoricalDevices(speech);
  assert.ok(devices.contrasts.length >= 1, 'should detect contrast/antithesis');
  assert.ok(devices.anaphoras.length >= 1, 'should detect anaphora');
  assert.ok(devices.tricolons.length >= 1, 'should detect tricolon');
});

test('detects German filler words accurately', () => {
  const fillers = detectFillers('Also ähm ich glaube halt irgendwie dass das quasi sozusagen passt.');
  assert.equal(fillers.found['ähm'], 1);
  assert.equal(fillers.found['halt'], 1);
  assert.equal(fillers.found['irgendwie'], 1);
  assert.equal(fillers.found['quasi'], 1);
  assert.equal(fillers.found['sozusagen'], 1);
  assert.ok(fillers.totalCount >= 5);
});

test('matches mandatory words including German inflections', () => {
  const text = 'Wir müssen wieder Brücken bauen und Vertrauen schaffen für ein besseres Morgen.';
  const res = matchMandatoryWords(text, ['Brücke', 'Vertrauen', 'Morgen', 'Kompass']);
  assert.equal(res.find((r) => r.word === 'Brücke').matched, true);
  assert.equal(res.find((r) => r.word === 'Vertrauen').matched, true);
  assert.equal(res.find((r) => r.word === 'Morgen').matched, true);
  assert.equal(res.find((r) => r.word === 'Kompass').matched, false);
});

test('analyzes audio samples for strategic pauses and crescendo', () => {
  const samples = [];
  // 0..2s speaking (moderate)
  for (let t = 0; t < 2.0; t += 0.1) samples.push({ t, rms: 0.08 });
  // 2..3.2s pause (1.2s)
  for (let t = 2.0; t < 3.2; t += 0.1) samples.push({ t, rms: 0.004 });
  // 3.2..5.2s speaking (moderate)
  for (let t = 3.2; t < 5.2; t += 0.1) samples.push({ t, rms: 0.07 });
  // 5.2..6.5s pause (1.3s)
  for (let t = 5.2; t < 6.5; t += 0.1) samples.push({ t, rms: 0.004 });
  // 6.5..9.0s speaking (crescendo louder!)
  for (let t = 6.5; t < 9.0; t += 0.1) samples.push({ t, rms: 0.14 });

  const audio = analyzeAudioSamples(samples, 9.0);
  assert.equal(audio.hasAudio, true);
  assert.equal(audio.strategicPauses, 2);
  assert.ok(audio.pauseRatio > 15 && audio.pauseRatio < 45);
  assert.ok(audio.crescendoDelta > 0.2, 'should detect crescendo at end');
  assert.equal(audio.volumeLevel, 'präsent');
});

test('detectPitchHz accurately extracts fundamental frequency from waveforms', () => {
  const sr = 44100;
  const makeSine = (hz, amp = 0.2) => {
    const buf = new Float32Array(2048);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = amp * Math.sin((2 * Math.PI * hz * i) / sr);
    }
    return buf;
  };
  const f120 = detectPitchHz(makeSine(120), sr);
  assert.ok(f120 >= 118 && f120 <= 122, `expected ~120 Hz, got ${f120}`);

  const f210 = detectPitchHz(makeSine(210), sr);
  assert.ok(f210 >= 207 && f210 <= 213, `expected ~210 Hz, got ${f210}`);

  assert.equal(detectPitchHz(makeSine(120, 0.002), sr), null, 'silence should return null');
});

test('analyzes pitch range, volume level, and downward authority cadence', () => {
  const samples = [];
  // Utterance 1: 0.0 - 1.2s, starts ~140 Hz and drops to ~110 Hz (downward authority)
  for (let i = 0; i < 12; i++) {
    samples.push({ t: i * 0.1, rms: i === 5 ? 0.15 : 0.07, pitchHz: i < 8 ? 140 : 108 });
  }
  // Pause 1.2 - 1.8s
  for (let i = 12; i < 18; i++) {
    samples.push({ t: i * 0.1, rms: 0.003, pitchHz: null });
  }
  // Utterance 2: 1.8 - 3.0s, starts ~155 Hz and drops to ~115 Hz (downward authority)
  for (let i = 18; i < 30; i++) {
    samples.push({ t: i * 0.1, rms: i === 24 ? 0.16 : 0.08, pitchHz: i < 26 ? 155 : 114 });
  }

  const audio = analyzeAudioSamples(samples, 3.0);
  assert.equal(audio.hasPitch, true);
  assert.ok(audio.pitchRangeSemitones >= 4.0, `expected >= 4 semitones, got ${audio.pitchRangeSemitones}`);
  assert.equal(audio.downwardCadences, 2);
  assert.equal(audio.uptalkCadences, 0);
  assert.equal(audio.authorityCadenceRatio, 100);
  assert.ok(audio.emphasisPeaks >= 2);
});

test('scores Obama-style speech higher than filler-heavy speech and generates 3-step plan', () => {
  const strong = analyzeSpeech({
    text: `Es geht nicht um Angst, sondern um Verantwortung.
      Wir stehen für Respekt, für Fairness und für Zusammenhalt.
      Wir hören zu. Wir handeln. Wir bauen gemeinsam eine Brücke in die Zukunft.
      Das zählt heute.`,
    durationSec: 18,
    mandatoryWords: ['Brücke', 'Zukunft'],
  });

  const weak = analyzeSpeech({
    text: 'Ähm ja also ich finde irgendwie halt dass ich das sozusagen eigentlich selbst machen muss.',
    durationSec: 5,
    mandatoryWords: ['Brücke', 'Zukunft'],
  });

  assert.ok(strong.obamaIndex > weak.obamaIndex, 'strong speech should outscore weak speech');
  assert.equal(strong.mandatoryMatchedCount, 2);

  const plan = buildTrainingPlan(weak.dimensions);
  assert.equal(plan.length, 3);
  assert.equal(plan[0].priority, 1);
});
