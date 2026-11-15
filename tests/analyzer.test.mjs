import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeAudioSamples,
  analyzeSpeech,
  buildTrainingPlan,
  detectFillers,
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
