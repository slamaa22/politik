// Pure German Rhetoric & Obama-Cadence Analyzer (Browser + Node compatible)

export const FILLER_WORDS = [
  'äh',
  'ähm',
  'hm',
  'öhm',
  'halt',
  'irgendwie',
  'sozusagen',
  'eigentlich',
  'quasi',
  'praktisch',
  'gewissermaßen',
  'im prinzip',
  'sag ich mal',
  'ich sag mal',
];

export const SOFT_FILLERS = ['also', 'genau', 'ja'];

export const WE_WORDS = new Set([
  'wir',
  'uns',
  'unser',
  'unsere',
  'unserer',
  'unseres',
  'unserem',
  'unseren',
  'gemeinsam',
  'zusammen',
  'miteinander',
  'gesellschaft',
  'nachbarschaft',
  'gemeinschaft',
]);

export const I_WORDS = new Set([
  'ich',
  'mir',
  'mich',
  'mein',
  'meine',
  'meiner',
  'meines',
  'meinem',
  'meinen',
]);

export const VALUES_VOCAB = new Set([
  'hoffnung',
  'zuversicht',
  'zukunft',
  'mut',
  'gerechtigkeit',
  'würde',
  'verantwortung',
  'chance',
  'chancen',
  'wandel',
  'veränderung',
  'zusammenhalt',
  'vertrauen',
  'freiheit',
  'respekt',
  'stärke',
  'demokratie',
  'heimat',
  'solidarität',
  'aufbruch',
  'perspektive',
  'generation',
  'generationen',
  'brücke',
  'brücken',
  'fairness',
  'faires',
  'glaube',
  'glauben',
  'versprechen',
]);

export function cleanTeleprompterCues(text) {
  return String(text || '')
    .replace(/\[(PAUSE|RUHIGER|CRESCENDO|BETONUNG)[^\]]*\]/gi, ' ')
    .replace(/[▲●◆]/g, ' ')
    .replace(/—\s*ruhiger\s*—/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeWords(text) {
  const cleaned = cleanTeleprompterCues(text).toLowerCase();
  const matches = cleaned.match(/[a-zäöüß]+/gi);
  return matches ? matches.map((w) => w.toLowerCase()) : [];
}

export function splitSentences(text) {
  const cleaned = cleanTeleprompterCues(text);
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => tokenizeWords(s).length > 0);
}

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

export function detectFillers(text) {
  const cleaned = cleanTeleprompterCues(text).toLowerCase();
  const words = tokenizeWords(cleaned);
  const found = {};

  for (const filler of FILLER_WORDS) {
    if (filler.includes(' ')) {
      const re = new RegExp(`\\b${filler.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      const m = cleaned.match(re);
      if (m && m.length > 0) found[filler] = m.length;
    } else {
      const count = words.filter((w) => w === filler).length;
      if (count > 0) found[filler] = count;
    }
  }

  for (const soft of SOFT_FILLERS) {
    const count = words.filter((w) => w === soft).length;
    // Only flag soft fillers if overused relative to length
    const threshold = Math.max(2, Math.floor(words.length / 45));
    if (count > threshold) {
      found[`${soft} (gehäuft)`] = count;
    }
  }

  const totalCount = Object.values(found).reduce((a, b) => a + b, 0);
  const ratePer100 = words.length > 0 ? Number(((totalCount / words.length) * 100).toFixed(1)) : 0;
  return { found, totalCount, ratePer100 };
}

export function detectRhetoricalDevices(text) {
  const sentences = splitSentences(text);
  const cleaned = cleanTeleprompterCues(text);

  // 1. Contrasts / Antithesis
  const contrastPatterns = [
    /\bnicht\b[^.!?]{2,60}\bsondern\b/gi,
    /\bkein(?:e|en|em|er|es)?\b[^.!?]{2,60}\bsondern\b/gi,
    /\bes geht nicht um\b[^.!?]{2,70}\bes geht um\b/gi,
    /\bwährend\b[^.!?]{4,60},/gi,
    /\bstatt\b[^.!?]{3,50}\b(?:zu|werden|wollen|müssen)\b/gi,
  ];
  const contrastMatches = [];
  for (const re of contrastPatterns) {
    const m = cleaned.match(re);
    if (m) contrastMatches.push(...m.map((s) => s.trim()));
  }

  // 2. Anaphora (repeated 1-2 word openings in consecutive sentences or clauses)
  const anaphoraExamples = [];
  const clauses = cleaned
    .split(/[.!?;]+|\n+/)
    .map((c) => c.trim())
    .filter((c) => tokenizeWords(c).length >= 3);

  for (let i = 0; i < clauses.length - 1; i++) {
    const w1 = tokenizeWords(clauses[i]);
    const w2 = tokenizeWords(clauses[i + 1]);
    if (w1.length >= 2 && w2.length >= 2) {
      const twoWordMatch = w1[0] === w2[0] && w1[1] === w2[1];
      const oneWordStrong =
        w1[0] === w2[0] &&
        ['wir', 'nicht', 'kein', 'keine', 'jeder', 'jede', 'heute', 'morgen', 'hier', 'es', 'das', 'wenn'].includes(w1[0]);
      if (twoWordMatch || oneWordStrong) {
        const prefix = twoWordMatch ? `${w1[0]} ${w1[1]}…` : `${w1[0]}…`;
        if (!anaphoraExamples.includes(prefix)) {
          anaphoraExamples.push(prefix);
        }
      }
    }
  }

  // 3. Tricolon / Dreiklang
  const tricolonMatches = [];
  // Pattern: "A, B und C" inside a sentence
  const listRe = /\b[\wäöüß-]{2,}(?:\s+[\wäöüß-]{2,}){0,3},\s+[\wäöüß-]{2,}(?:\s+[\wäöüß-]{2,}){0,3}\s+(?:und|oder)\s+[\wäöüß-]{2,}(?:\s+[\wäöüß-]{2,}){0,3}/gi;
  const listHits = cleaned.match(listRe);
  if (listHits) {
    tricolonMatches.push(...listHits.map((s) => s.trim()));
  }
  // Pattern: "nicht X, nicht Y, sondern Z"
  const notNotButRe = /\bnicht\b[^,.!?]{2,40},\s*\bnicht\b[^,.!?]{2,40},\s*\bsondern\b[^.!?]{2,50}/gi;
  const nnbHits = cleaned.match(notNotButRe);
  if (nnbHits) {
    tricolonMatches.push(...nnbHits.map((s) => s.trim()));
  }
  // Pattern: 3 consecutive clauses with same starting word
  for (let i = 0; i < clauses.length - 2; i++) {
    const a = tokenizeWords(clauses[i])[0];
    const b = tokenizeWords(clauses[i + 1])[0];
    const c = tokenizeWords(clauses[i + 2])[0];
    if (a && a === b && b === c) {
      tricolonMatches.push(`3× „${a}…“`);
    }
  }

  // Deduplicate nicely
  const uniqueTricolons = [...new Set(tricolonMatches)];
  const uniqueContrasts = [...new Set(contrastMatches)];

  return {
    tricolons: uniqueTricolons,
    anaphoras: anaphoraExamples,
    contrasts: uniqueContrasts,
    totalDevices: uniqueTricolons.length + anaphoraExamples.length + uniqueContrasts.length,
    sentenceCount: sentences.length,
  };
}

export function detectPitchHz(buffer, sampleRate = 44100) {
  if (!buffer || buffer.length < 512 || !sampleRate) return null;

  const half = Math.floor(buffer.length / 2);
  let rmsSum = 0;
  for (let i = 0; i < buffer.length; i++) {
    rmsSum += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(rmsSum / buffer.length);
  if (rms < 0.014) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / 360)); // 360 Hz ceiling
  const maxLag = Math.min(half - 2, Math.ceil(sampleRate / 70)); // 70 Hz floor
  if (maxLag <= minLag) return null;

  const diff = new Float32Array(maxLag + 1);
  for (let tau = 1; tau <= maxLag; tau++) {
    let sum = 0;
    for (let j = 0; j < half; j++) {
      const delta = buffer[j] - buffer[j + tau];
      sum += delta * delta;
    }
    diff[tau] = sum;
  }

  // Cumulative mean normalized difference function (YIN)
  const cmndf = new Float32Array(maxLag + 1);
  cmndf[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau <= maxLag; tau++) {
    runningSum += diff[tau];
    cmndf[tau] = runningSum > 0 ? (diff[tau] * tau) / runningSum : 1;
  }

  let bestTau = -1;
  for (let tau = minLag; tau <= maxLag - 1; tau++) {
    if (cmndf[tau] < 0.18) {
      while (tau + 1 <= maxLag - 1 && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      bestTau = tau;
      break;
    }
  }

  if (bestTau === -1) {
    let minVal = 1;
    for (let tau = minLag; tau <= maxLag - 1; tau++) {
      if (cmndf[tau] < minVal) {
        minVal = cmndf[tau];
        bestTau = tau;
      }
    }
    if (minVal > 0.28) return null;
  }

  if (bestTau <= 0) return null;

  // Parabolic interpolation for sub-sample frequency accuracy
  const prev = cmndf[bestTau - 1] ?? cmndf[bestTau];
  const curr = cmndf[bestTau];
  const next = cmndf[bestTau + 1] ?? cmndf[bestTau];
  const denom = 2 * (2 * curr - prev - next);
  const refinedTau = denom !== 0 ? bestTau + (next - prev) / denom : bestTau;
  if (refinedTau <= 0) return null;

  const hz = sampleRate / refinedTau;
  if (hz < 70 || hz > 360 || !Number.isFinite(hz)) return null;
  return Number(hz.toFixed(1));
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

export function analyzeAudioSamples(samples = [], durationSec = 0) {
  const emptyAudio = {
    hasAudio: false,
    durationSec: Number(durationSec || 0),
    strategicPauses: 0,
    pauseRatio: 0,
    avgPauseSec: 0,
    dynamicRange: 0,
    crescendoDelta: 0,
    activeSpeechRatio: 0,
    meanSpeakingRms: 0,
    volumeLevel: 'unbekannt',
    emphasisPeaks: 0,
    clippedRatio: 0,
    hasPitch: false,
    medianPitchHz: 0,
    pitchRangeSemitones: 0,
    downwardCadences: 0,
    uptalkCadences: 0,
    authorityCadenceRatio: null,
  };

  if (!Array.isArray(samples) || samples.length < 5 || durationSec <= 0.5) {
    return emptyAudio;
  }

  const rmsValues = samples.map((s) => Number(s.rms || 0));
  const sorted = [...rmsValues].sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(sorted.length * 0.15)] || 0.005;
  const peak = sorted[Math.floor(sorted.length * 0.95)] || 0.05;
  const speechThreshold = Math.max(0.012, noiseFloor * 2.2, peak * 0.16);

  // Trim leading and trailing silence for fair pause ratio
  const firstActive = samples.findIndex((s) => s.rms >= speechThreshold);
  let lastActive = -1;
  for (let i = samples.length - 1; i >= 0; i--) {
    if (samples[i].rms >= speechThreshold) {
      lastActive = i;
      break;
    }
  }

  if (firstActive === -1 || lastActive <= firstActive) {
    return {
      ...emptyAudio,
      hasAudio: true,
      durationSec: Number(durationSec.toFixed(1)),
      volumeLevel: 'zu leise',
    };
  }

  const activeSlice = samples.slice(firstActive, lastActive + 1);
  const pauseDurations = [];
  let silenceStart = null;
  let silentSamples = 0;

  for (let i = 0; i < activeSlice.length; i++) {
    const sample = activeSlice[i];
    if (sample.rms < speechThreshold) {
      silentSamples++;
      if (silenceStart === null) silenceStart = sample.t;
    } else if (silenceStart !== null) {
      const pauseLen = sample.t - silenceStart;
      if (pauseLen >= 0.45 && pauseLen <= 4.0) {
        pauseDurations.push(pauseLen);
      }
      silenceStart = null;
    }
  }

  const pauseRatio = activeSlice.length > 0 ? silentSamples / activeSlice.length : 0;
  const strategicPauses = pauseDurations.length;
  const avgPauseSec =
    strategicPauses > 0
      ? Number((pauseDurations.reduce((a, b) => a + b, 0) / strategicPauses).toFixed(2))
      : 0;

  // Volume presence & dynamic range on speaking frames
  const speakingFrames = activeSlice.filter((s) => s.rms >= speechThreshold);
  const speakingRms = speakingFrames.map((s) => s.rms);
  const meanRms =
    speakingRms.length > 0 ? speakingRms.reduce((a, b) => a + b, 0) / speakingRms.length : 0;
  const variance =
    speakingRms.length > 0
      ? speakingRms.reduce((acc, v) => acc + (v - meanRms) ** 2, 0) / speakingRms.length
      : 0;
  const stdDev = Math.sqrt(variance);
  const dynamicRange = meanRms > 0 ? Number((stdDev / meanRms).toFixed(2)) : 0;

  const clippedCount = speakingFrames.filter((s) => s.clipped).length;
  const clippedRatio =
    speakingFrames.length > 0 ? Number(((clippedCount / speakingFrames.length) * 100).toFixed(1)) : 0;

  let volumeLevel = 'präsent';
  if (meanRms < 0.022) volumeLevel = 'zu leise';
  else if (meanRms > 0.36 || clippedRatio > 8) volumeLevel = 'übersteuert';

  // Count distinct emphasis volume peaks separated by >= 0.8s
  let emphasisPeaks = 0;
  let lastPeakTime = -10;
  for (const s of speakingFrames) {
    if (s.rms >= meanRms * 1.42 && s.t - lastPeakTime >= 0.8) {
      emphasisPeaks++;
      lastPeakTime = s.t;
    }
  }

  // Crescendo: compare last 25% of speaking frames vs middle 50%
  const q1 = Math.floor(speakingRms.length * 0.25);
  const q3 = Math.floor(speakingRms.length * 0.75);
  const mid = speakingRms.slice(q1, q3);
  const end = speakingRms.slice(q3);
  const midAvg = mid.length > 0 ? mid.reduce((a, b) => a + b, 0) / mid.length : meanRms;
  const endAvg = end.length > 0 ? end.reduce((a, b) => a + b, 0) / end.length : meanRms;
  const crescendoDelta = midAvg > 0 ? Number(((endAvg - midAvg) / midAvg).toFixed(2)) : 0;

  // Pitch / Tonfall analysis
  const validPitches = speakingFrames
    .map((s) => Number(s.pitchHz))
    .filter((hz) => Number.isFinite(hz) && hz >= 70 && hz <= 360);

  let hasPitch = false;
  let medianPitchHz = 0;
  let pitchRangeSemitones = 0;
  let downwardCadences = 0;
  let uptalkCadences = 0;
  let authorityCadenceRatio = null;

  if (validPitches.length >= 6) {
    hasPitch = true;
    const sortedP = [...validPitches].sort((a, b) => a - b);
    const p10 = sortedP[Math.floor(sortedP.length * 0.1)];
    const p90 = sortedP[Math.floor(sortedP.length * 0.9)];
    medianPitchHz = Number(median(sortedP).toFixed(1));
    if (p10 > 0 && p90 > p10) {
      pitchRangeSemitones = Number((12 * Math.log2(p90 / p10)).toFixed(1));
    }

    // Segment into utterances separated by >= 0.35s silence to measure sentence-ending inflection
    const utterances = [];
    let currentUtt = [];
    let gapStart = null;
    for (const sample of activeSlice) {
      if (sample.rms >= speechThreshold) {
        if (gapStart !== null && sample.t - gapStart >= 0.35 && currentUtt.length > 0) {
          utterances.push(currentUtt);
          currentUtt = [];
        }
        gapStart = null;
        if (sample.pitchHz >= 70 && sample.pitchHz <= 360) {
          currentUtt.push(sample.pitchHz);
        }
      } else if (gapStart === null) {
        gapStart = sample.t;
      }
    }
    if (currentUtt.length > 0) utterances.push(currentUtt);

    let evaluatedUtt = 0;
    for (const utt of utterances) {
      if (utt.length < 6) continue;
      evaluatedUtt++;
      const splitIdx = Math.max(3, Math.floor(utt.length * 0.65));
      const bodyMed = median(utt.slice(0, splitIdx));
      const endMed = median(utt.slice(splitIdx));
      if (bodyMed > 0 && endMed > 0) {
        const diffSt = 12 * Math.log2(endMed / bodyMed);
        if (diffSt <= -0.6) downwardCadences++;
        else if (diffSt >= 0.8) uptalkCadences++;
      }
    }
    if (evaluatedUtt > 0) {
      authorityCadenceRatio = Math.round(((evaluatedUtt - uptalkCadences) / evaluatedUtt) * 100);
    }
  }

  return {
    hasAudio: true,
    durationSec: Number(durationSec.toFixed(1)),
    strategicPauses,
    pauseRatio: Number((pauseRatio * 100).toFixed(1)),
    avgPauseSec,
    dynamicRange,
    crescendoDelta,
    activeSpeechRatio: Number(((1 - pauseRatio) * 100).toFixed(1)),
    meanSpeakingRms: Number(meanRms.toFixed(3)),
    volumeLevel,
    emphasisPeaks,
    clippedRatio,
    hasPitch,
    medianPitchHz,
    pitchRangeSemitones,
    downwardCadences,
    uptalkCadences,
    authorityCadenceRatio,
  };
}

export function matchMandatoryWords(text, mandatoryWords = []) {
  const words = tokenizeWords(text);
  const normalizedText = cleanTeleprompterCues(text).toLowerCase();

  return mandatoryWords.map((target) => {
    const t = String(target).toLowerCase().trim();
    if (!t) return { word: target, matched: false };

    // Exact or stem-like match (German inflections: Brücke -> Brücken, bauen -> gebaut/baut)
    const stem = t.length >= 5 ? t.slice(0, t.length - 1) : t;
    const altStem = t.length >= 6 ? t.slice(0, t.length - 2) : stem;
    const matched =
      normalizedText.includes(t) ||
      words.some((w) => w === t || w.startsWith(stem) || (altStem.length >= 4 && w.includes(altStem)));

    return { word: target, matched };
  });
}

export function analyzeSpeech({
  text = '',
  durationSec = 0,
  audioSamples = [],
  mandatoryWords = [],
  mode = 'general',
} = {}) {
  const words = tokenizeWords(text);
  const wordCount = words.length;
  const sentences = splitSentences(text);
  const sentenceLengths = sentences.map((s) => tokenizeWords(s).length);

  const avgSentenceLen =
    sentenceLengths.length > 0
      ? Number((sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length).toFixed(1))
      : 0;

  const sentStdDev =
    sentenceLengths.length > 1
      ? Math.sqrt(
          sentenceLengths.reduce((acc, l) => acc + (l - avgSentenceLen) ** 2, 0) /
            sentenceLengths.length
        )
      : 0;
  const hasShortPunch = sentenceLengths.some((l) => l >= 2 && l <= 6);
  const hasLongBuild = sentenceLengths.some((l) => l >= 13);

  // Fillers
  const fillers = detectFillers(text);

  // Rhetorical devices
  const devices = detectRhetoricalDevices(text);

  // We vs I framing
  let weCount = 0;
  let iCount = 0;
  const valuesHits = new Set();
  for (const w of words) {
    if (WE_WORDS.has(w)) weCount++;
    if (I_WORDS.has(w)) iCount++;
    if (VALUES_VOCAB.has(w)) valuesHits.add(w);
  }
  const weRatio =
    weCount + iCount > 0 ? Number(((weCount / (weCount + iCount)) * 100).toFixed(1)) : 50;

  // Audio metrics
  const audio = analyzeAudioSamples(audioSamples, durationSec);

  // WPM calculation
  let wpm = null;
  if (durationSec >= 5 && wordCount >= 8) {
    wpm = Math.round((wordCount / durationSec) * 60);
  }

  // --- Dimension Scores (0 - 100) ---

  // 1. Tempo & Gelassenheit (Obama Sweetspot: 112 - 138 WPM)
  let tempoScore = 62;
  if (wpm !== null) {
    if (wpm >= 112 && wpm <= 138) {
      tempoScore = 94 - Math.round(Math.abs(wpm - 125) * 0.4);
    } else if (wpm > 138) {
      tempoScore = clamp(92 - (wpm - 138) * 1.15, 25, 90);
    } else {
      tempoScore = clamp(90 - (112 - wpm) * 1.0, 30, 88);
    }
  } else if (wordCount >= 20) {
    // Text-only fallback uses sentence pacing balance
    tempoScore = clamp(58 + (hasShortPunch ? 12 : 0) + (avgSentenceLen >= 10 && avgSentenceLen <= 18 ? 10 : 0));
  }

  // 2. Strategische Pausen
  let pausenScore = 55;
  if (audio.hasAudio && audio.durationSec >= 8) {
    const idealPauseBonus =
      audio.strategicPauses >= 3 ? 30 : audio.strategicPauses * 9;
    // Ideal pause ratio 14% - 28%
    let ratioScore = 25;
    if (audio.pauseRatio >= 14 && audio.pauseRatio <= 28) ratioScore = 45;
    else if (audio.pauseRatio >= 8 && audio.pauseRatio <= 35) ratioScore = 34;
    else if (audio.pauseRatio < 5) ratioScore = 12;
    const lenBonus = audio.avgPauseSec >= 0.7 && audio.avgPauseSec <= 2.2 ? 20 : audio.avgPauseSec > 0.4 ? 10 : 0;
    pausenScore = clamp(10 + idealPauseBonus + ratioScore + lenBonus);
  } else if (wordCount >= 15) {
    const pauseCues = (String(text).match(/[.!?—…]/g) || []).length;
    pausenScore = clamp(45 + Math.min(35, pauseCues * 5));
  }

  // 3. Stimm-Dynamik, Lautstärke-Präsenz & Tonfall (Pitch)
  let dynamikScore = 58;
  if (audio.hasAudio && audio.durationSec >= 8) {
    const rangePts = clamp(audio.dynamicRange * 75, 6, 32);
    const crescPts = audio.crescendoDelta > 0.05 ? 16 : audio.crescendoDelta > -0.05 ? 9 : 3;
    const volPts = audio.volumeLevel === 'präsent' ? 16 : audio.volumeLevel === 'zu leise' ? 4 : 9;

    let pitchPts = 14;
    if (audio.hasPitch) {
      if (audio.pitchRangeSemitones >= 4.0 && audio.pitchRangeSemitones <= 10.0) pitchPts = 22;
      else if (audio.pitchRangeSemitones >= 2.5) pitchPts = 14;
      else pitchPts = 6; // monotonous

      if (audio.authorityCadenceRatio !== null) {
        pitchPts += audio.authorityCadenceRatio >= 75 ? 10 : audio.authorityCadenceRatio >= 50 ? 6 : 2;
      } else {
        pitchPts += 6;
      }
    }
    dynamikScore = clamp(rangePts + crescPts + volPts + pitchPts);
  } else if (wordCount >= 15) {
    const exclam = (String(text).match(/[!?]/g) || []).length;
    dynamikScore = clamp(50 + Math.min(25, sentStdDev * 3.5) + Math.min(15, exclam * 5));
  }

  // 4. Obama-Stilmittel (Dreiklang, Anapher, Kontrast)
  const devicePoints =
    devices.tricolons.length * 18 +
    devices.anaphoras.length * 20 +
    devices.contrasts.length * 18;
  const stilmittelScore = wordCount > 0 ? clamp(28 + Math.min(72, devicePoints)) : 20;

  // 5. Wir-Charisma & Werte-Framing
  const wePoints = weCount > 0 ? clamp((weRatio / 100) * 45, 5, 45) : 10;
  const valuesPoints = Math.min(35, valuesHits.size * 9);
  const directAddressBonus = words.some((w) => ['ihr', 'euch', 'eure', 'sie', 'ihnen'].includes(w)) ? 12 : 0;
  const wirCharismaScore = wordCount > 0 ? clamp(15 + wePoints + valuesPoints + directAddressBonus) : 20;

  // 6. Klarheit & Kadenz
  const fillerPenalty = fillers.ratePer100 * 8;
  const rhythmBonus = (hasShortPunch ? 16 : 0) + (hasLongBuild ? 14 : 0) + Math.min(16, sentStdDev * 2.5);
  const klarheitScore = wordCount > 0 ? clamp(62 + rhythmBonus - fillerPenalty) : 25;

  const dimensions = {
    tempo: tempoScore,
    pausen: pausenScore,
    dynamik: dynamikScore,
    stilmittel: stilmittelScore,
    wirCharisma: wirCharismaScore,
    klarheit: klarheitScore,
  };

  // Weighted Obama-Index
  const obamaIndex = clamp(
    tempoScore * 0.16 +
      pausenScore * 0.2 +
      dynamikScore * 0.14 +
      stilmittelScore * 0.18 +
      wirCharismaScore * 0.18 +
      klarheitScore * 0.14
  );

  // Mandatory words evaluation
  const mandatoryCheck = matchMandatoryWords(text, mandatoryWords);
  const mandatoryMatchedCount = mandatoryCheck.filter((m) => m.matched).length;

  // Coaching feedback (concrete, motivating, Obama-focused)
  const feedback = buildCoachingFeedback({
    wordCount,
    wpm,
    audio,
    fillers,
    devices,
    weCount,
    iCount,
    weRatio,
    valuesHits: [...valuesHits],
    hasShortPunch,
    hasLongBuild,
    dimensions,
    mandatoryCheck,
    mode,
  });

  return {
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLen,
    wpm,
    audio,
    fillers,
    devices,
    weCount,
    iCount,
    weRatio,
    valuesHits: [...valuesHits],
    hasShortPunch,
    hasLongBuild,
    dimensions,
    obamaIndex,
    levelLabel: getLevelLabel(obamaIndex),
    mandatoryCheck,
    mandatoryMatchedCount,
    feedback,
  };
}

export function getLevelLabel(score) {
  if (score >= 85) return 'Staatsmann-Niveau (Obama-Kadenz)';
  if (score >= 70) return 'Kampagnenreif (Starkes Charisma)';
  if (score >= 52) return 'Aufsteiger (Gutes Fundament)';
  return 'Rohdiamant (Hohes Potenzial)';
}

function buildCoachingFeedback({
  wordCount,
  wpm,
  audio,
  fillers,
  devices,
  weCount,
  iCount,
  weRatio,
  valuesHits,
  hasShortPunch,
  hasLongBuild,
  dimensions,
  mandatoryCheck,
}) {
  const strengths = [];
  const improvements = [];

  if (wpm !== null) {
    if (wpm >= 112 && wpm <= 138) {
      strengths.push(`Souveränes Tempo (${wpm} WPM) — genau im Obama-Sweetspot (115–135 WPM).`);
    } else if (wpm > 145) {
      improvements.push(
        `Du sprichst mit ${wpm} WPM noch zu gehetzt. Obama bremst bewusst vor Kernaussagen ab — ziele auf ~125 WPM.`
      );
    } else if (wpm < 105) {
      improvements.push(`Mit ${wpm} WPM wirkst du etwas stockend. Halte den Fluss zwischen den Pausen stabil.`);
    }
  }

  if (audio.hasAudio) {
    if (audio.strategicPauses >= 3 && audio.pauseRatio >= 12) {
      strengths.push(
        `Starke Pausenarbeit: ${audio.strategicPauses} bewusste Wirkungspausen (Ø ${audio.avgPauseSec}s). Das erzeugt Autorität.`
      );
    } else {
      improvements.push(
        `Zu wenige Wirkungspausen (${audio.strategicPauses} erkannt). Nach einem starken Satz innerlich bis „21“ zählen, bevor du weiterredest.`
      );
    }

    if (audio.volumeLevel === 'zu leise') {
      improvements.push(
        'Lautstärke zu zurückhaltend: Sprich spürbar aus dem Bauch/Brustraum, damit deine Stimme den Raum trägt.'
      );
    } else if (audio.volumeLevel === 'übersteuert') {
      improvements.push(
        'Mikrofon-Pegel sehr hoch/übersteuert: Etwas mehr Abstand zum Mikrofon halten, damit Dynamik sauber hörbar bleibt.'
      );
    } else if (audio.emphasisPeaks >= 2) {
      strengths.push(`Klare Lautstärke-Präsenz mit ${audio.emphasisPeaks} hörbaren Betonungs-Akzenten.`);
    }

    if (audio.crescendoDelta > 0.05) {
      strengths.push('Schönes Finale-Crescendo: Deine Stimmenergie steigt zum Schluss hin an.');
    } else {
      improvements.push('Stimm-Dynamik ausbauen: Starte ruhiger und baue zum letzten Absatz spürbar Energie auf.');
    }

    if (audio.hasPitch) {
      if (audio.pitchRangeSemitones >= 4.0) {
        strengths.push(
          `Lebendiger Tonfall (${audio.pitchRangeSemitones} Halbtöne Stimmumfang, Ø ${audio.medianPitchHz} Hz) — nicht monoton.`
        );
      } else {
        improvements.push(
          `Tonfall noch etwas flach (${audio.pitchRangeSemitones} Halbtöne Umfang). Variiere gezielt zwischen ruhiger Tiefe und wacher Betonung.`
        );
      }
      if (audio.uptalkCadences >= 2 && audio.authorityCadenceRatio !== null && audio.authorityCadenceRatio < 70) {
        improvements.push(
          `Satzenden gehen öfter nach oben (${audio.uptalkCadences}× Uptalk). Senke die Stimme am Satzpunkt ruhig ab — das wirkt sofort staatsmännischer.`
        );
      } else if (audio.downwardCadences >= 2) {
        strengths.push(`Souveräne Satzend-Kadenz: Du schließt Aussagen ruhig nach unten ab (${audio.downwardCadences}×).`);
      }
    }
  }

  if (devices.tricolons.length > 0) {
    strengths.push(`Dreiklang genutzt (${devices.tricolons.slice(0, 2).join(' | ')}) — klassisches Obama-Muster.`);
  } else {
    improvements.push('Dreiklang einbauen: Fasse Argumente in 3 steigenden Punkten zusammen („nicht nur X, nicht nur Y, sondern Z“).');
  }

  if (devices.contrasts.length > 0) {
    strengths.push(`Starke Antithese/Kontrast-Brücke erkannt (${devices.contrasts.length}×).`);
  } else {
    improvements.push('Kontrast-Brücke nutzen: „Es geht nicht um [altes Problem], es geht um [gemeinsame Zukunft].“');
  }

  if (devices.anaphoras.length > 0) {
    strengths.push(`Mitreißende Anapher-Wiederholung (${devices.anaphoras.join(', ')}).`);
  }

  if (weCount >= 3 && weRatio >= 60) {
    strengths.push(`Starkes „Wir“-Charisma (${weCount}× Wir/Uns vs. ${iCount}× Ich) — du nimmst das Publikum mit.`);
  } else if (iCount > weCount && wordCount > 25) {
    improvements.push(`Zu viel „Ich“ (${iCount}×) statt „Wir“ (${weCount}×). Verwandle persönliche Punkte in gemeinsame Anliegen.`);
  }

  if (valuesHits.length >= 2) {
    strengths.push(`Werte-Anker gesetzt (${valuesHits.slice(0, 4).join(', ')}).`);
  } else {
    improvements.push('Mehr Werte-Sprache einweben (z. B. Vertrauen, Verantwortung, Zuversicht, Zusammenhalt, Fairness).');
  }

  if (fillers.totalCount > 0) {
    const topFillers = Object.entries(fillers.found)
      .map(([k, v]) => `„${k}“ (${v}×)`)
      .join(', ');
    improvements.push(`Füllwörter reduzieren: ${topFillers}. Ersetze jedes „ähm/halt“ durch eine stille Pause!`);
  } else if (wordCount >= 20) {
    strengths.push('Saubere Sprache ohne erkennbare Füllwörter!');
  }

  if (!hasShortPunch && wordCount >= 25) {
    improvements.push('Rhythmus schärfen: Setze nach einem längeren Gedanken einen ganz kurzen 3- bis 5-Wort-Satz als Pointe.');
  } else if (hasShortPunch && hasLongBuild) {
    strengths.push('Gute Obama-Kadenz aus langen Aufbau-Sätzen und kurzen Pointen.');
  }

  if (mandatoryCheck.length > 0) {
    const missed = mandatoryCheck.filter((m) => !m.matched).map((m) => m.word);
    if (missed.length === 0) {
      strengths.push('Alle Pflichtwörter erfolgreich in die Rede integriert!');
    } else {
      improvements.push(`Nicht erkannte Pflichtwörter: ${missed.join(', ')}.`);
    }
  }

  if (wordCount < 12 && !audio.hasAudio) {
    improvements.unshift('Sprich mindestens 30–60 Sekunden (oder füge das Transkript ein), um eine präzise Diagnose zu erhalten.');
  }

  // Pick single highest-impact next action
  const sortedDims = Object.entries(dimensions).sort((a, b) => a[1] - b[1]);
  const weakest = sortedDims[0]?.[0];
  const nextStepMap = {
    pausen: 'Nächster Schritt: 3 Minuten „Obama-Sekunde“ (Pausen-Drill), bis du Pausen als Stärke genießt.',
    tempo: 'Nächster Schritt: Teleprompter bei 125 WPM ablesen, um das ruhige Staatsmann-Tempo zu verankern.',
    stilmittel: 'Nächster Schritt: Im Stilmittel-Labor 2 Runden Dreiklang & Kontrast-Pivot trainieren.',
    wirCharisma: 'Nächster Schritt: Im Storytelling-Builder deine eigene Geschichte in „Story of Self → Us → Now“ übersetzen.',
    dynamik: 'Nächster Schritt: Eine Teleprompter-Rede mit ruhigem Einstieg, tiefem Satzende und Crescendo am Schluss aufnehmen.',
    klarheit: 'Nächster Schritt: Spontanrede mit Fokus auf kurze Schluss-Pointen ohne Füllwörter.',
  };

  return {
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
    nextStep: nextStepMap[weakest] || nextStepMap.pausen,
  };
}

export function buildTrainingPlan(dimensions) {
  const catalog = {
    pausen: {
      module: 'drills',
      subdrill: 'pausen',
      title: 'Die Obama-Sekunde & Pausenmut',
      why: 'Pausen signalisieren innere Ruhe und geben dem Publikum Zeit zum Mitfühlen.',
      goal: 'Mindestens 15–22 % bewusste Pausenanteil & 0 Füllwörter',
    },
    tempo: {
      module: 'teleprompter',
      title: 'Kadenz-Training am Teleprompter (125 WPM)',
      why: 'Wer ruhig spricht, wirkt souveräner als jemand, der seine Sätze herunterrattert.',
      goal: 'Stabiler Korridor zwischen 115 und 135 Wörtern pro Minute',
    },
    stilmittel: {
      module: 'drills',
      subdrill: 'stilmittel',
      title: 'Stilmittel-Labor: Dreiklang, Anapher & Kontrast',
      why: 'Obamas Reden bleiben im Kopf, weil sie Gedanken rhythmisch in Dreiergruppen und Gegensätzen bauen.',
      goal: 'In jeder 60-Sekunden-Rede mindestens 1 Dreiklang + 1 Kontrast-Brücke',
    },
    wirCharisma: {
      module: 'drills',
      subdrill: 'story',
      title: 'Story of Self → Story of Us → Story of Now',
      why: 'Du brauchst nicht Obamas Herkunft — deine eigene, echte Geschichte wird zur Brücke für alle.',
      goal: 'Über 65 % „Wir“-Framing und klare Werte-Verankerung',
    },
    dynamik: {
      module: 'teleprompter',
      title: 'Stimm-Crescendo & Betonungs-Kontrolle',
      why: 'Charisma entsteht durch den Kontrast zwischen ruhigem Einstieg und kraftvollem Finale.',
      goal: 'Spürbarer Energieanstieg (+10 %) im Schlussdrittel der Rede',
    },
    klarheit: {
      module: 'wort-challenge',
      title: 'Wort-Challenge & Pointen-Schärfe',
      why: 'Unter Druck klar zu bleiben und spontane Begriffe elegant einzubauen, macht politische Spitzenredner aus.',
      goal: 'Alle Pflichtwörter organisch einweben + kurze 4-Wort-Schlusspointe',
    },
  };

  return Object.entries(dimensions)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([key, score], idx) => ({
      priority: idx + 1,
      dimension: key,
      currentScore: score,
      ...catalog[key],
    }));
}
