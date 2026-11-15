import {
  analyzeSpeech,
  buildTrainingPlan,
  getLevelLabel,
  matchMandatoryWords,
} from './analyzer.js';
import { SpeechStudioRecorder } from './audio.js';
import { renderRadarChart } from './charts.js';
import {
  BASELINE_PARTS,
  DIMENSION_META,
  GEGENWIND_QUESTIONS,
  PLAYBOOK_PILLARS,
  SPONTAN_TOPICS,
  STYLE_DRILLS,
  TELEPROMPTER_SPEECHES,
  WORD_CHALLENGE_POOLS,
  WORD_CHALLENGE_TOPICS,
} from './data.js';
import { icon } from './icons.js';

const VIEW_HEADERS = {
  eingangstest: [
    'Eingangstest',
    'Standortbestimmung deiner aktuellen Rhetorik vor dem Start ins Training.',
  ],
  dashboard: [
    'Profil & Trainingsplan',
    'Entwicklung vom Eingangstest bis zur souveränen politischen Präsenz.',
  ],
  spontanrede: [
    'Spontanrede',
    'Freies Sprechen zu politischen Themen mit Fokus auf Struktur, Pausen und Klarheit.',
  ],
  teleprompter: [
    'Rede ablesen',
    'Trainiere das ruhige Tempo (115–135 WPM), gezielte Pausen und Stimmführung.',
  ],
  'wort-challenge': [
    'Pflichtwörter',
    'Verbinde ein zufälliges Thema spontan und organisch mit vorgegebenen Begriffen.',
  ],
  drills: [
    'Drills & Gegenwind',
    'Gezielte Kurzübungen für Pausen, Stilmittel, Biografie und Schlagfertigkeit.',
  ],
  playbook: [
    'Playbook',
    'Die 7 Säulen von Obamas Rhetorik und Charisma für deinen eigenen Stil.',
  ],
};

const appState = {
  baseline: null,
  baselineProgress: { stepIdx: 0, stepResults: [null, null, null] },
  sessions: [],
  customSpeeches: [],
  storyDraft: { self: '', us: '', now: '' },
  updatedAt: null,
};

function hydrateStaticIcons() {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.dataset.icon;
    const size = Number(el.dataset.size) || 16;
    el.innerHTML = icon(name, size);
  });
}

function setSyncStatus(text, isError = false) {
  const el = document.getElementById('syncStatusNote');
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#d93025' : '';
}

// --- Server-Only Persistence Helpers ---
async function loadState() {
  try {
    localStorage.removeItem('orator_backup_state');
  } catch {
    // ignore storage access issues
  }
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    appState.baseline = data.baseline || null;
    appState.baselineProgress = data.baselineProgress || { stepIdx: 0, stepResults: [null, null, null] };
    appState.sessions = Array.isArray(data.sessions) ? data.sessions : [];
    appState.customSpeeches = Array.isArray(data.customSpeeches) ? data.customSpeeches : [];
    appState.storyDraft = data.storyDraft || { self: '', us: '', now: '' };
    appState.updatedAt = data.updatedAt || null;
    setSyncStatus('Auf Server gespeichert · Synchronisiert');
    return true;
  } catch (err) {
    setSyncStatus('Server-Sync fehlgeschlagen – bitte neu laden', true);
    return false;
  }
}

async function apiPost(url, payload) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setSyncStatus('Speichern auf Server fehlgeschlagen', true);
      return null;
    }
    const data = await res.json();
    if (data?.updatedAt) appState.updatedAt = data.updatedAt;
    if (data?.state?.updatedAt) appState.updatedAt = data.state.updatedAt;
    setSyncStatus('Auf Server gespeichert · Synchronisiert');
    return data;
  } catch {
    setSyncStatus('Server nicht erreichbar – nicht gespeichert', true);
    return null;
  }
}

async function uploadAudioRecording(recResult) {
  if (!recResult?.blob || recResult.serverAudioUrl) {
    return recResult?.serverAudioUrl || recResult?.audioUrl || null;
  }
  try {
    const res = await fetch('/api/audio', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': recResult.blob.type || 'audio/webm' },
      body: recResult.blob,
    });
    if (!res.ok) return recResult.audioUrl || null;
    const data = await res.json();
    if (data?.ok && data.audioUrl) {
      recResult.serverAudioUrl = data.audioUrl;
      return data.audioUrl;
    }
  } catch {
    // Fallback to local object URL in current tab only if upload fails
  }
  return recResult.audioUrl || null;
}

async function saveSession(sessionObj) {
  const session = {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...sessionObj,
  };
  appState.sessions = [session, ...appState.sessions].slice(0, 200);
  const saved = await apiPost('/api/sessions', session);
  if (saved?.state) {
    appState.sessions = saved.state.sessions;
  }
  updateTopbarAndNav();
  renderDashboard();
  return session;
}

// --- Formatting & UI Helpers ---
function formatTime(sec) {
  const s = Math.max(0, Math.round(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatCuedSpeechHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[PAUSE([^\]]*)\]/gi, '<span class="cue-pause">PAUSE$1</span>')
    .replace(/\[CRESCENDO\]/gi, '<span class="cue-crescendo">CRESCENDO</span>')
    .replace(/\[BETONUNG\]\s*([\wäöüß-]+)/gi, '<span class="cue-emphasis">$1</span>')
    .replace(/\[RUHIGER\]/gi, '<span class="cue-calm">Ruhig und tief einsteigen</span>');
}

function updateAmpel(ampelEl, rms, activeSamples = []) {
  if (!ampelEl) return;
  const dotText = ampelEl.querySelector('.ampel-text');
  ampelEl.classList.remove('speaking', 'pause', 'rushing');
  if (rms < 0.015) {
    ampelEl.classList.add('pause');
    if (dotText) dotText.textContent = 'Stille / Wirkungspause';
  } else {
    const recent = activeSamples.slice(-38);
    const hasRecentPause = recent.some((s) => s.rms < 0.015);
    if (recent.length >= 35 && !hasRecentPause) {
      ampelEl.classList.add('rushing');
      if (dotText) dotText.textContent = 'Durchgehendes Sprechen – Pause setzen';
    } else {
      ampelEl.classList.add('speaking');
      if (dotText) dotText.textContent = 'Ruhiger Redefluss';
    }
  }
}

function renderAudioPlayback(container, audioUrl) {
  if (!container) return;
  if (!audioUrl) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  container.classList.remove('hidden');
  container.innerHTML = `<audio controls src="${audioUrl}"></audio>`;
}

async function autoTranscribeIfNeeded(
  recResult,
  { transcriptEl = null, noticeEl = null, onText = null, statusBtn = null } = {}
) {
  const existingText = transcriptEl
    ? transcriptEl.value.trim()
    : String(recResult?.transcript || '').trim();

  if (!recResult?.blob || recResult._transcribed || existingText) {
    return existingText;
  }
  recResult._transcribed = true;

  if (noticeEl) {
    noticeEl.textContent = 'Transkribiere Aufnahme über Server-Whisper...';
    noticeEl.classList.remove('hidden');
  }
  const prevBtnHtml = statusBtn ? statusBtn.innerHTML : null;
  if (statusBtn) {
    statusBtn.disabled = true;
    statusBtn.innerHTML = '<span>Transkribiere...</span>';
  }

  try {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': recResult.blob.type || 'audio/webm' },
      body: recResult.blob,
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      const text = String(data.text || '').trim();
      recResult.transcript = text;
      if (text) {
        if (transcriptEl) transcriptEl.value = text;
        if (onText) onText(text);
        if (noticeEl) noticeEl.classList.add('hidden');
      } else if (noticeEl) {
        noticeEl.textContent =
          'Keine Sprache erkannt – Audioanalyse wurde erstellt, Text bei Bedarf manuell ergänzen.';
        noticeEl.classList.remove('hidden');
      }
      return text;
    }

    if (noticeEl) {
      noticeEl.textContent = data.unavailable
        ? 'Server-Transkription hier nicht aktiv – Audioanalyse läuft, Text optional ergänzen.'
        : data.error || 'Transkription fehlgeschlagen – Audioanalyse läuft, Text optional ergänzen.';
      noticeEl.classList.remove('hidden');
    }
    return '';
  } catch {
    if (noticeEl) {
      noticeEl.textContent =
        'Server-Transkription nicht erreichbar – Audioanalyse läuft, Text optional ergänzen.';
      noticeEl.classList.remove('hidden');
    }
    return '';
  } finally {
    if (statusBtn) {
      statusBtn.disabled = false;
      if (prevBtnHtml !== null) statusBtn.innerHTML = prevBtnHtml;
    }
  }
}

function renderAnalysisCard(container, title, analysis) {
  if (!container) return;
  container.classList.remove('hidden');

  const dimRows = Object.entries(analysis.dimensions)
    .map(
      ([k, val]) => `
      <div class="metric-pill num">
        <strong>${DIMENSION_META[k].short}:</strong> ${val}/100
      </div>`
    )
    .join('');

  const mandatoryHtml =
    analysis.mandatoryCheck.length > 0
      ? `<div class="mandatory-chips">
          ${analysis.mandatoryCheck
            .map(
              (m) =>
                `<span class="word-chip ${m.matched ? 'matched' : ''}">${icon(
                  m.matched ? 'check' : 'x',
                  14
                )} <span>${m.word}</span></span>`
            )
            .join('')}
        </div>`
      : '';

  const strengthsHtml = analysis.feedback.strengths.length
    ? analysis.feedback.strengths.map((s) => `<li>${s}</li>`).join('')
    : '<li>Erste Daten erfasst – nutze längere Sätze für tiefere Musteranalyse.</li>';

  const improvementsHtml = analysis.feedback.improvements.length
    ? analysis.feedback.improvements.map((s) => `<li>${s}</li>`).join('')
    : '<li>Starke Runde. Steigere jetzt Tempo-Kontrolle und Pausenlänge.</li>';

  container.innerHTML = `
    <div class="card-header">
      <div>
        <span class="eyebrow">Rhetorik-Auswertung</span>
        <h2>${title}</h2>
        <div class="muted-text">${analysis.levelLabel}</div>
      </div>
      <div class="score-badge-lg num">${analysis.obamaIndex}</div>
    </div>

    <div class="metric-pills">
      <div class="metric-pill num"><strong>Wörter:</strong> ${analysis.wordCount}</div>
      <div class="metric-pill num"><strong>Tempo:</strong> ${analysis.wpm ? `${analysis.wpm} WPM` : '—'}</div>
      <div class="metric-pill num"><strong>Wirkungspausen:</strong> ${analysis.audio.hasAudio ? `${analysis.audio.strategicPauses} (${analysis.audio.pauseRatio}%)` : '—'}</div>
      <div class="metric-pill num"><strong>Lautstärke:</strong> ${analysis.audio.hasAudio ? `${analysis.audio.volumeLevel} (${analysis.audio.emphasisPeaks} Akzente)` : '—'}</div>
      <div class="metric-pill num"><strong>Tonfall:</strong> ${analysis.audio.hasPitch ? `${analysis.audio.pitchRangeSemitones} Halbtöne · ${analysis.audio.medianPitchHz} Hz` : '—'}</div>
      <div class="metric-pill num"><strong>Satzende:</strong> ${analysis.audio.authorityCadenceRatio !== null ? `${analysis.audio.authorityCadenceRatio}% sicher (${analysis.audio.downwardCadences} fallend)` : '—'}</div>
      <div class="metric-pill num"><strong>Wir / Ich:</strong> ${analysis.weCount} / ${analysis.iCount}</div>
      <div class="metric-pill num"><strong>Stilmittel:</strong> ${analysis.devices.totalDevices}</div>
      <div class="metric-pill num"><strong>Füllwörter:</strong> ${analysis.fillers.totalCount}</div>
    </div>

    <div class="metric-pills">${dimRows}</div>
    ${mandatoryHtml}

    <div class="grid-2">
      <div>
        <h4>Stärken</h4>
        <ul class="feedback-list">${strengthsHtml}</ul>
      </div>
      <div>
        <h4>Nächster Hebel</h4>
        <ul class="feedback-list">${improvementsHtml}</ul>
      </div>
    </div>

    <div class="callout callout-accent">
      <span><strong>Empfehlung:</strong> ${analysis.feedback.nextStep}</span>
    </div>
  `;
}

// --- Navigation & Global Topbar ---
function switchView(viewName) {
  document.querySelectorAll('.view').forEach((el) => el.classList.remove('active'));
  document.getElementById(`view-${viewName}`)?.classList.add('active');

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  const [title, sub] = VIEW_HEADERS[viewName] || ['ORATOR', ''];
  document.getElementById('viewTitle').textContent = title;
  document.getElementById('viewSubtitle').textContent = sub;

  if (viewName === 'dashboard') renderDashboard();
}

function updateTopbarAndNav() {
  const pill = document.getElementById('baselineStatusCard');
  const pillText = document.getElementById('baselineStatusText');
  const navBadge = document.getElementById('navBaselineBadge');
  const topIndex = document.getElementById('topIndexValue');

  if (appState.baseline) {
    pill.classList.remove('pending');
    pill.classList.add('done');
    pillText.textContent = `Baseline: ${appState.baseline.obamaIndex}/100`;
    navBadge.textContent = 'Fertig';
    navBadge.classList.remove('badge-neutral');
    navBadge.classList.add('badge-accent');
  } else {
    pill.classList.add('pending');
    pill.classList.remove('done');
    pillText.textContent = 'Eingangstest ausstehend';
    navBadge.textContent = 'Start';
    navBadge.classList.add('badge-neutral');
    navBadge.classList.remove('badge-accent');
  }

  const latest = appState.sessions[0]?.analysis || appState.baseline;
  topIndex.textContent = latest ? `${latest.obamaIndex}/100` : '—';
}

// ================= MODULE 0: EINGANGSTEST =================
const baselineState = {
  stepIdx: 0,
  recorder: null,
  stepResults: [null, null, null],
  lastRecording: null,
};

function renderBaselineResultCard(baselineObj) {
  const resultCard = document.getElementById('baseResultCard');
  const lockNotice = document.getElementById('baselineLockNotice');
  if (!baselineObj) {
    resultCard.classList.add('hidden');
    lockNotice.classList.remove('callout-accent');
    lockNotice.innerHTML =
      '<span><strong>Schritt 1 vor dem Training:</strong> Absolviere zuerst diese 3-teilige Diagnose, damit wir dein echtes Startniveau messen und deinen Trainingsplan exakt festlegen.</span>';
    return;
  }

  const { obamaIndex, levelLabel, dimensions, plan, parts = [] } = baselineObj;
  resultCard.classList.remove('hidden');
  document.getElementById('baseOverallScore').textContent = obamaIndex;
  document.getElementById('baseResultHeadline').textContent = `${obamaIndex}/100 — ${levelLabel}`;
  lockNotice.classList.add('callout-accent');
  lockNotice.innerHTML =
    '<span><strong>Eingangstest abgeschlossen.</strong> Dein Ausgangsprofil steht. Starte jetzt gezielt mit Priorität 1 deines Trainingsplans.</span>';

  renderRadarChart(document.getElementById('baseRadarContainer'), dimensions);

  const weakest = Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0];
  const strongest = Object.entries(dimensions).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('baseFeedbackContainer').innerHTML = `
    <h3>Diagnose im Überblick</h3>
    <ul class="feedback-list">
      <li><strong>Größte Stärke:</strong> ${DIMENSION_META[strongest[0]].label} (${strongest[1]}/100)</li>
      <li><strong>Größter Hebel:</strong> ${DIMENSION_META[weakest[0]].label} (${weakest[1]}/100)</li>
      <li><strong>Teil 1 (Spontan):</strong> ${parts[0]?.obamaIndex ?? '—'}/100</li>
      <li><strong>Teil 2 (Kadenz lesen):</strong> ${parts[1]?.obamaIndex ?? '—'}/100</li>
      <li><strong>Teil 3 (Brückenbau):</strong> ${parts[2]?.obamaIndex ?? '—'}/100</li>
    </ul>
    <div class="callout callout-accent">
      <span><strong>Fazit:</strong> Du hast jetzt deinen ehrlichen Ausgangswert. Mit gezieltem Pausen- und Dreiklang-Training steigt dieser Index rasch.</span>
    </div>
  `;

  document.getElementById('basePlanCards').innerHTML = (plan || [])
    .map(
      (p) => `
      <div class="plan-card">
        <span class="eyebrow">Priorität ${p.priority} · ${p.currentScore}/100</span>
        <h4>${p.title}</h4>
        <p>${p.why}</p>
        <p><strong>Ziel:</strong> ${p.goal}</p>
        <button class="btn btn-sm btn-primary" data-launch-module="${p.module}" data-subdrill="${p.subdrill || ''}">
          <span>Trainieren</span> ${icon('arrowRight', 14)}
        </button>
      </div>`
    )
    .join('');
}

function hydrateBaselineFromAppState() {
  const progress = appState.baselineProgress;
  if (Array.isArray(progress?.stepResults) && progress.stepResults.some(Boolean)) {
    baselineState.stepResults = progress.stepResults;
    const firstPending = progress.stepResults.findIndex((r) => !r);
    baselineState.stepIdx = Number.isInteger(progress.stepIdx)
      ? progress.stepIdx
      : firstPending >= 0
        ? firstPending
        : 0;
  } else if (Array.isArray(appState.baseline?.parts) && appState.baseline.parts.length === 3) {
    baselineState.stepResults = appState.baseline.parts.map((p) => ({
      partId: p.partId,
      transcript: p.transcript || '',
      durationSec: p.durationSec || 0,
      audioUrl: p.audioUrl || null,
      analysis: {
        obamaIndex: p.obamaIndex,
        wpm: p.wpm,
        wordCount: p.wordCount,
        audio: { strategicPauses: p.strategicPauses, hasAudio: false },
        dimensions: appState.baseline.dimensions,
      },
    }));
    baselineState.stepIdx = 0;
  } else {
    baselineState.stepResults = [null, null, null];
    baselineState.stepIdx = 0;
  }

  renderBaselineStep();
  renderBaselineResultCard(appState.baseline);
}

async function persistBaselineProgress() {
  appState.baselineProgress = {
    stepIdx: baselineState.stepIdx,
    stepResults: baselineState.stepResults,
  };
  await apiPost('/api/baseline-progress', appState.baselineProgress);
}

function renderBaselineStep() {
  const part = BASELINE_PARTS[baselineState.stepIdx];
  document.getElementById('basePartTitle').textContent = part.title;
  document.getElementById('basePromptText').textContent = part.prompt;
  document.getElementById('basePromptHint').textContent = part.hint;
  document.getElementById('baseTargetTime').textContent = `/ ${formatTime(part.durationSec)}`;
  document.getElementById('baseTimer').textContent = '00:00';

  const readWrap = document.getElementById('baseReadTextWrap');
  if (part.readText) {
    readWrap.classList.remove('hidden');
    readWrap.innerHTML = formatCuedSpeechHtml(part.readText);
  } else {
    readWrap.classList.add('hidden');
    readWrap.innerHTML = '';
  }

  const wordsWrap = document.getElementById('baseWordsWrap');
  if (part.mandatoryWords?.length) {
    wordsWrap.classList.remove('hidden');
    wordsWrap.innerHTML = part.mandatoryWords
      .map((w) => `<span class="word-chip" data-word="${w}">${icon('circle', 13)} <span>${w}</span></span>`)
      .join('');
  } else {
    wordsWrap.classList.add('hidden');
    wordsWrap.innerHTML = '';
  }

  document.querySelectorAll('#baseStepPills .step-pill').forEach((pill, i) => {
    pill.classList.toggle('active', i === baselineState.stepIdx);
    pill.classList.toggle('done', Boolean(baselineState.stepResults[i]));
  });

  const existing = baselineState.stepResults[baselineState.stepIdx];
  document.getElementById('baseTranscript').value = existing?.transcript || '';
  document.getElementById('baseSpeechNotice').classList.add('hidden');
  renderAudioPlayback(
    document.getElementById('baseAudioPlayback'),
    baselineState.lastRecording?.audioUrl || existing?.audioUrl || null
  );
  updateBaselineWordChips(existing?.transcript || '');
  document.getElementById('baseSavedSummary').textContent = existing
    ? `Ausgewertet: ${existing.analysis.obamaIndex}/100`
    : 'Noch nicht ausgewertet';

  updateBaselineButtons();
}

function updateBaselineButtons() {
  const hasCurrent = Boolean(baselineState.stepResults[baselineState.stepIdx]);
  const allDone = baselineState.stepResults.every(Boolean);
  const nextBtn = document.getElementById('baseNextStepBtn');
  const finishBtn = document.getElementById('baseFinishBtn');

  nextBtn.classList.toggle('hidden', !(hasCurrent && baselineState.stepIdx < 2));
  if (baselineState.stepIdx < 2) {
    nextBtn.innerHTML = `<span>Weiter zu Teil ${baselineState.stepIdx + 2}</span> ${icon('arrowRight', 15)}`;
  }
  finishBtn.classList.toggle('hidden', !allDone);
}

function updateBaselineWordChips(text) {
  const part = BASELINE_PARTS[baselineState.stepIdx];
  if (!part.mandatoryWords?.length) return;
  const check = matchMandatoryWords(text, part.mandatoryWords);
  document.querySelectorAll('#baseWordsWrap .word-chip').forEach((chip) => {
    const word = chip.dataset.word;
    const found = check.find((c) => c.word === word);
    const matched = Boolean(found?.matched);
    chip.classList.toggle('matched', matched);
    chip.innerHTML = `${icon(matched ? 'check' : 'circle', 13)} <span>${word}</span>`;
  });
}

async function evaluateBaselineStep() {
  const part = BASELINE_PARTS[baselineState.stepIdx];
  const transcriptEl = document.getElementById('baseTranscript');
  let text = transcriptEl.value.trim();

  const rec = baselineState.lastRecording;
  if (!text && part.readText && rec && rec.durationSec >= 5) {
    text = part.readText;
  }

  if (!text && (!rec || rec.durationSec < 3)) {
    alert('Bitte sprich mindestens ein paar Sekunden ins Mikrofon oder gib einen Text ein.');
    return;
  }

  const uploadedAudioUrl = rec ? await uploadAudioRecording(rec) : baselineState.stepResults[baselineState.stepIdx]?.audioUrl || null;
  if (uploadedAudioUrl) {
    renderAudioPlayback(document.getElementById('baseAudioPlayback'), uploadedAudioUrl);
  }

  const analysis = analyzeSpeech({
    text,
    durationSec: rec?.durationSec || 0,
    audioSamples: rec?.samples || [],
    mandatoryWords: part.mandatoryWords || [],
    mode: part.type,
  });

  baselineState.stepResults[baselineState.stepIdx] = {
    partId: part.id,
    transcript: text,
    durationSec: rec?.durationSec || 0,
    audioUrl: uploadedAudioUrl,
    analysis,
  };

  const audioHint = analysis.audio.hasAudio
    ? ` · ${analysis.audio.strategicPauses} Pausen · Pegel: ${analysis.audio.volumeLevel}${analysis.audio.hasPitch ? ` · Tonfall: ${analysis.audio.pitchRangeSemitones} HT` : ''}`
    : '';
  document.getElementById('baseSavedSummary').textContent =
    `Teil ${part.step} ausgewertet: ${analysis.obamaIndex}/100 (${analysis.wpm ? `${analysis.wpm} WPM` : `${analysis.wordCount} Wörter`}${audioHint})`;

  document.querySelectorAll('#baseStepPills .step-pill')[baselineState.stepIdx]?.classList.add('done');
  updateBaselineButtons();
  await persistBaselineProgress();
}

async function finishBaselineTest() {
  const completed = baselineState.stepResults.filter(Boolean);
  if (completed.length < 3) return;

  const avgDim = (key) =>
    Math.round(completed.reduce((sum, r) => sum + r.analysis.dimensions[key], 0) / completed.length);

  const dimensions = {
    tempo: avgDim('tempo'),
    pausen: avgDim('pausen'),
    dynamik: avgDim('dynamik'),
    stilmittel: avgDim('stilmittel'),
    wirCharisma: avgDim('wirCharisma'),
    klarheit: avgDim('klarheit'),
  };

  const obamaIndex = Math.round(
    completed.reduce((sum, r) => sum + r.analysis.obamaIndex, 0) / completed.length
  );
  const plan = buildTrainingPlan(dimensions);

  const baselineObj = {
    obamaIndex,
    levelLabel: getLevelLabel(obamaIndex),
    dimensions,
    plan,
    parts: completed.map((c) => ({
      partId: c.partId,
      obamaIndex: c.analysis.obamaIndex,
      wpm: c.analysis.wpm,
      wordCount: c.analysis.wordCount,
      strategicPauses: c.analysis.audio.strategicPauses,
      audioUrl: c.audioUrl || null,
      transcript: c.transcript,
    })),
    completedAt: new Date().toISOString(),
  };

  appState.baseline = baselineObj;
  await persistBaselineProgress();
  await apiPost('/api/baseline', baselineObj);
  updateTopbarAndNav();
  renderBaselineResultCard(baselineObj);
  document.getElementById('baseResultCard').scrollIntoView({ behavior: 'smooth' });
}

function initBaselineView() {
  const startBtn = document.getElementById('baseStartBtn');
  const stopBtn = document.getElementById('baseStopBtn');
  const transcriptEl = document.getElementById('baseTranscript');
  const noticeEl = document.getElementById('baseSpeechNotice');
  const ampelEl = document.getElementById('baseAmpel');

  document.querySelectorAll('#baseStepPills .step-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      if (baselineState.recorder?.isRecording) return;
      baselineState.stepIdx = Number(pill.dataset.step);
      baselineState.lastRecording = null;
      renderBaselineStep();
      persistBaselineProgress();
    });
  });

  transcriptEl.addEventListener('input', () => {
    updateBaselineWordChips(transcriptEl.value);
  });

  startBtn.addEventListener('click', async () => {
    noticeEl.classList.add('hidden');
    baselineState.lastRecording = null;
    const rec = new SpeechStudioRecorder({
      canvas: document.getElementById('baseCanvas'),
      onTranscript: (text) => {
        transcriptEl.value = text;
        updateBaselineWordChips(text);
      },
      onTick: ({ elapsed }) => {
        document.getElementById('baseTimer').textContent = formatTime(elapsed);
        const latestRms = rec.samples[rec.samples.length - 1]?.rms || 0;
        updateAmpel(ampelEl, latestRms, rec.samples);
      },
      onSpeechError: (msg) => {
        noticeEl.textContent = msg;
        noticeEl.classList.remove('hidden');
      },
    });

    try {
      await rec.start();
      baselineState.recorder = rec;
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
    } catch (err) {
      noticeEl.textContent = `${err.message} — Du kannst deinen Text auch direkt unten eingeben und auswerten.`;
      noticeEl.classList.remove('hidden');
    }
  });

  stopBtn.addEventListener('click', async () => {
    if (!baselineState.recorder) return;
    const result = await baselineState.recorder.stop();
    baselineState.lastRecording = result;
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    ampelEl.classList.remove('speaking', 'pause', 'rushing');
    ampelEl.querySelector('.ampel-text').textContent = 'Transkribiere & speichere...';
    renderAudioPlayback(document.getElementById('baseAudioPlayback'), result.audioUrl);

    await autoTranscribeIfNeeded(result, {
      transcriptEl,
      noticeEl,
      onText: updateBaselineWordChips,
      statusBtn: document.getElementById('baseAnalyzeStepBtn'),
    });

    ampelEl.querySelector('.ampel-text').textContent = 'Aufnahme beendet';
    await evaluateBaselineStep();
  });

  document.getElementById('baseAnalyzeStepBtn').addEventListener('click', evaluateBaselineStep);
  document.getElementById('baseNextStepBtn').addEventListener('click', () => {
    if (baselineState.stepIdx < 2) {
      baselineState.stepIdx++;
      baselineState.lastRecording = null;
      renderBaselineStep();
      persistBaselineProgress();
    }
  });
  document.getElementById('baseFinishBtn').addEventListener('click', finishBaselineTest);
  document.getElementById('goToDashboardBtn').addEventListener('click', () => switchView('dashboard'));

  hydrateBaselineFromAppState();
}

// ================= MODULE 1: DASHBOARD =================
function renderDashboard() {
  const noBase = document.getElementById('dashNoBaseline');
  noBase.classList.toggle('hidden', Boolean(appState.baseline));

  const latest = appState.sessions[0]?.analysis || appState.baseline;
  const baseline = appState.baseline;

  document.getElementById('dashCurrentScore').textContent = latest ? `${latest.obamaIndex}/100` : '—';
  document.getElementById('dashCurrentLevel').textContent = latest ? latest.levelLabel : 'Eingangstest starten';

  document.getElementById('dashBaselineScore').textContent = baseline ? `${baseline.obamaIndex}/100` : '—';
  if (baseline && appState.sessions[0]) {
    const delta = appState.sessions[0].analysis.obamaIndex - baseline.obamaIndex;
    document.getElementById('dashDeltaText').textContent =
      delta >= 0 ? `+${delta} Punkte seit Start` : `${delta} Punkte zum Start`;
  } else {
    document.getElementById('dashDeltaText').textContent = baseline ? 'Baseline erfasst' : 'Noch kein Test';
  }

  document.getElementById('dashSessionCount').textContent = String(appState.sessions.length);
  const wpmSessions = appState.sessions.filter((s) => s.analysis?.wpm);
  const avgWpm = wpmSessions.length
    ? Math.round(wpmSessions.reduce((a, s) => a + s.analysis.wpm, 0) / wpmSessions.length)
    : null;
  document.getElementById('dashAvgWpm').textContent = `Ø Tempo: ${avgWpm ? `${avgWpm} WPM` : '—'}`;

  if (latest?.dimensions) {
    const sorted = Object.entries(latest.dimensions).sort((a, b) => b[1] - a[1]);
    document.getElementById('dashBestWorst').textContent =
      `${DIMENSION_META[sorted[0][0]].short} (${sorted[0][1]}) / ${DIMENSION_META[sorted[sorted.length - 1][0]].short} (${sorted[sorted.length - 1][1]})`;
    renderRadarChart(
      document.getElementById('dashRadarContainer'),
      latest.dimensions,
      baseline && appState.sessions.length > 0 ? baseline.dimensions : null
    );
  } else {
    document.getElementById('dashRadarContainer').innerHTML =
      '<p class="muted-text">Schließe den Eingangstest oder eine erste Übung ab, um dein Radar zu sehen.</p>';
  }

  const plan = baseline?.plan || (latest?.dimensions ? buildTrainingPlan(latest.dimensions) : []);
  const planEl = document.getElementById('dashPlanList');
  planEl.innerHTML = plan.length
    ? plan
        .map(
          (p) => `
        <div class="plan-card">
          <div class="card-actions-between">
            <span class="eyebrow">Fokus ${p.priority} · ${p.currentScore}/100</span>
            <button class="btn btn-sm btn-primary" data-launch-module="${p.module}" data-subdrill="${p.subdrill || ''}">
              <span>Starten</span> ${icon('arrowRight', 13)}
            </button>
          </div>
          <h4>${p.title}</h4>
          <p>${p.goal}</p>
        </div>`
        )
        .join('')
    : '<p class="muted-text">Dein individueller Trainingsplan entsteht automatisch nach dem Eingangstest.</p>';

  const histEl = document.getElementById('dashHistoryList');
  if (!appState.sessions.length) {
    histEl.innerHTML = '<p class="muted-text">Noch keine Trainingseinheiten aufgezeichnet.</p>';
  } else {
    histEl.innerHTML = appState.sessions
      .slice(0, 25)
      .map((s) => {
        const date = new Date(s.createdAt).toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        return `
          <div class="history-row">
            <div>
              <strong>${s.title || s.type}</strong>
              <div class="muted-text num">${date} · ${s.analysis?.wordCount || 0} Wörter ${s.analysis?.wpm ? `· ${s.analysis.wpm} WPM` : ''}</div>
              ${s.audioUrl ? `<div class="audio-playback"><audio controls preload="none" src="${s.audioUrl}"></audio></div>` : ''}
            </div>
            <div class="btn-group">
              <span class="badge badge-neutral num">${s.analysis?.obamaIndex ?? '—'}/100</span>
            </div>
          </div>`;
      })
      .join('');
  }
}

// ================= MODULE 2: SPONTANREDE =================
let currentSpontanTopic = SPONTAN_TOPICS[0];
let spontanRecorder = null;
let spontanLastRec = null;
let spontanCountdownId = null;

function pickSpontanTopic() {
  const cat = document.getElementById('spontanCategory').value;
  const pool = cat === 'ALL' ? SPONTAN_TOPICS : SPONTAN_TOPICS.filter((t) => t.category === cat);
  const next = pool[Math.floor(Math.random() * pool.length)] || SPONTAN_TOPICS[0];
  currentSpontanTopic = next;
  document.getElementById('spontanCatBadge').textContent = next.category;
  document.getElementById('spontanTopicText').textContent = next.topic;
  document.getElementById('spontanAngleText').textContent = `Leitimpuls: ${next.angle}`;
}

function initSpontanView() {
  const catSelect = document.getElementById('spontanCategory');
  const categories = [...new Set(SPONTAN_TOPICS.map((t) => t.category))];
  categories.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    catSelect.appendChild(opt);
  });

  pickSpontanTopic();
  document.getElementById('spontanNewTopicBtn').addEventListener('click', pickSpontanTopic);
  catSelect.addEventListener('change', pickSpontanTopic);

  const guideCheck = document.getElementById('spontanShowGuide');
  guideCheck.addEventListener('change', () => {
    document.getElementById('spontanGuideBox').classList.toggle('hidden', !guideCheck.checked);
  });

  const startBtn = document.getElementById('spontanStartBtn');
  const skipPrepBtn = document.getElementById('spontanSkipPrepBtn');
  const stopBtn = document.getElementById('spontanStopBtn');
  const timerEl = document.getElementById('spontanTimer');
  const phaseEl = document.getElementById('spontanPhaseLabel');
  const noticeEl = document.getElementById('spontanSpeechNotice');
  const transcriptEl = document.getElementById('spontanTranscript');
  const ampelEl = document.getElementById('spontanAmpel');

  const beginSpeechRecording = async () => {
    clearInterval(spontanCountdownId);
    skipPrepBtn.classList.add('hidden');
    phaseEl.textContent = 'Rede läuft';
    const targetSec = Number(document.getElementById('spontanDurationSec').value);
    spontanLastRec = null;

    const rec = new SpeechStudioRecorder({
      canvas: document.getElementById('spontanCanvas'),
      onTranscript: (text) => {
        transcriptEl.value = text;
      },
      onTick: ({ elapsed }) => {
        const rem = Math.max(0, targetSec - elapsed);
        timerEl.textContent = formatTime(rem);
        const rms = rec.samples[rec.samples.length - 1]?.rms || 0;
        updateAmpel(ampelEl, rms, rec.samples);
      },
      onSpeechError: (msg) => {
        noticeEl.textContent = msg;
        noticeEl.classList.remove('hidden');
      },
    });

    try {
      await rec.start();
      spontanRecorder = rec;
      stopBtn.classList.remove('hidden');
    } catch (err) {
      noticeEl.textContent = `${err.message} — Du kannst unten auch deinen Text eintippen und auswerten.`;
      noticeEl.classList.remove('hidden');
      startBtn.classList.remove('hidden');
    }
  };

  startBtn.addEventListener('click', () => {
    noticeEl.classList.add('hidden');
    startBtn.classList.add('hidden');
    let prepLeft = Number(document.getElementById('spontanPrepSec').value);
    if (prepLeft <= 0) {
      beginSpeechRecording();
      return;
    }

    phaseEl.textContent = 'Vorbereitung';
    timerEl.textContent = formatTime(prepLeft);
    skipPrepBtn.classList.remove('hidden');
    spontanCountdownId = setInterval(() => {
      prepLeft--;
      timerEl.textContent = formatTime(prepLeft);
      if (prepLeft <= 0) {
        beginSpeechRecording();
      }
    }, 1000);
  });

  skipPrepBtn.addEventListener('click', beginSpeechRecording);

  const finishSpontan = async () => {
    clearInterval(spontanCountdownId);
    if (spontanRecorder?.isRecording) {
      spontanLastRec = await spontanRecorder.stop();
      renderAudioPlayback(document.getElementById('spontanAudioPlayback'), spontanLastRec.audioUrl);
    }
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    skipPrepBtn.classList.add('hidden');

    if (spontanLastRec) {
      phaseEl.textContent = 'Transkribiere...';
      await autoTranscribeIfNeeded(spontanLastRec, {
        transcriptEl,
        noticeEl,
        statusBtn: document.getElementById('spontanAnalyzeBtn'),
      });
    }
    phaseEl.textContent = 'Ausgewertet';

    const text = transcriptEl.value.trim();
    if (!text && (!spontanLastRec || spontanLastRec.durationSec < 3)) return;

    const analysis = analyzeSpeech({
      text,
      durationSec: spontanLastRec?.durationSec || 0,
      audioSamples: spontanLastRec?.samples || [],
      mode: 'spontan',
    });

    renderAnalysisCard(
      document.getElementById('spontanResultCard'),
      `Spontanrede: ${currentSpontanTopic.category}`,
      analysis
    );

    const audioUrl = spontanLastRec ? await uploadAudioRecording(spontanLastRec) : null;
    if (audioUrl) {
      renderAudioPlayback(document.getElementById('spontanAudioPlayback'), audioUrl);
    }

    await saveSession({
      type: 'spontanrede',
      title: `Spontanrede: ${currentSpontanTopic.topic.slice(0, 52)}...`,
      analysis,
      audioUrl,
      transcript: text,
    });
  };

  stopBtn.addEventListener('click', finishSpontan);
  document.getElementById('spontanAnalyzeBtn').addEventListener('click', finishSpontan);
}

// ================= MODULE 3: TELEPROMPTER =================
let tpScrollRaf = null;
let tpIsScrolling = false;
let tpRecorder = null;
let tpLastTimestamp = 0;
let tpScrollPos = 0;

function getAllSpeeches() {
  return [...appState.customSpeeches, ...TELEPROMPTER_SPEECHES];
}

function getSelectedSpeech() {
  const id = document.getElementById('tpSpeechSelect').value;
  return getAllSpeeches().find((s) => s.id === id) || TELEPROMPTER_SPEECHES[0];
}

function populateSpeechSelect(selectedId = null) {
  const select = document.getElementById('tpSpeechSelect');
  const all = getAllSpeeches();
  select.innerHTML = all
    .map((s) => `<option value="${s.id}">${s.custom ? 'Eigene: ' : ''}${s.title} (${s.category})</option>`)
    .join('');
  if (selectedId && all.some((s) => s.id === selectedId)) {
    select.value = selectedId;
  }
  loadSelectedSpeechIntoPrompter();
}

function loadSelectedSpeechIntoPrompter() {
  const speech = getSelectedSpeech();
  document.getElementById('tpTechniqueBadge').textContent = speech.technique;
  document.getElementById('tpScrollContent').innerHTML = formatCuedSpeechHtml(speech.text);
  tpScrollPos = 0;
  document.getElementById('tpScrollContent').scrollTop = 0;
  if (speech.targetWpm) {
    document.getElementById('tpWpmSlider').value = speech.targetWpm;
    document.getElementById('tpWpmLabel').textContent = speech.targetWpm;
  }
}

function stepTeleprompterScroll(ts) {
  if (!tpIsScrolling) return;
  const content = document.getElementById('tpScrollContent');
  if (!tpLastTimestamp) tpLastTimestamp = ts;
  const dt = Math.min(0.1, (ts - tpLastTimestamp) / 1000);
  tpLastTimestamp = ts;

  const wpm = Number(document.getElementById('tpWpmSlider').value);
  const fontSize = Number(document.getElementById('tpFontSlider').value);
  const pxPerSec = (wpm / 125) * (fontSize * 1.15);
  tpScrollPos += pxPerSec * dt;
  content.scrollTop = tpScrollPos;

  if (content.scrollTop + content.clientHeight < content.scrollHeight - 2) {
    tpScrollRaf = requestAnimationFrame(stepTeleprompterScroll);
  } else {
    tpIsScrolling = false;
  }
}

function initTeleprompterView() {
  populateSpeechSelect();

  document.getElementById('tpSpeechSelect').addEventListener('change', loadSelectedSpeechIntoPrompter);
  document.getElementById('tpRandomBtn').addEventListener('click', () => {
    const all = getAllSpeeches();
    const current = getSelectedSpeech().id;
    const candidates = all.length > 1 ? all.filter((s) => s.id !== current) : all;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    populateSpeechSelect(pick.id);
  });

  const wpmSlider = document.getElementById('tpWpmSlider');
  wpmSlider.addEventListener('input', () => {
    document.getElementById('tpWpmLabel').textContent = wpmSlider.value;
  });

  const fontSlider = document.getElementById('tpFontSlider');
  fontSlider.addEventListener('input', () => {
    document.getElementById('tpFontLabel').textContent = fontSlider.value;
    document.getElementById('tpScrollContent').style.fontSize = `${fontSlider.value}px`;
  });

  document.getElementById('tpMirrorCheck').addEventListener('change', (e) => {
    document.getElementById('tpStage').classList.toggle('mirrored', e.target.checked);
  });

  document.getElementById('tpFullscreenBtn').addEventListener('click', () => {
    const stage = document.getElementById('tpStage');
    if (document.fullscreenElement) document.exitFullscreen();
    else stage.requestFullscreen?.();
  });

  document.getElementById('tpCustomToggleBtn').addEventListener('click', () => {
    document.getElementById('tpCustomForm').classList.toggle('hidden');
  });

  document.getElementById('tpSaveCustomBtn').addEventListener('click', async () => {
    const title = document.getElementById('tpCustomTitle').value.trim();
    const category = document.getElementById('tpCustomCategory').value.trim() || 'Eigene Rede';
    const text = document.getElementById('tpCustomText').value.trim();
    if (!title || !text) {
      alert('Bitte Titel und Redetext eingeben.');
      return;
    }
    const speech = {
      id: `custom_${Date.now()}`,
      title,
      category,
      technique: 'Eigener Entwurf',
      targetWpm: 125,
      text,
      custom: true,
    };
    appState.customSpeeches = [speech, ...appState.customSpeeches];
    await apiPost('/api/speeches', speech);
    populateSpeechSelect(speech.id);
    document.getElementById('tpCustomForm').classList.add('hidden');
    document.getElementById('tpCustomTitle').value = '';
    document.getElementById('tpCustomText').value = '';
  });

  const playBtn = document.getElementById('tpPlayScrollBtn');
  const pauseBtn = document.getElementById('tpPauseScrollBtn');
  const stopBtn = document.getElementById('tpStopRecBtn');
  const tpNoticeEl = document.getElementById('tpSpeechNotice');

  playBtn.addEventListener('click', async () => {
    tpNoticeEl.classList.add('hidden');
    tpScrollPos = document.getElementById('tpScrollContent').scrollTop;
    tpIsScrolling = true;
    tpLastTimestamp = 0;
    tpScrollRaf = requestAnimationFrame(stepTeleprompterScroll);
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    stopBtn.classList.remove('hidden');

    if (!tpRecorder?.isRecording) {
      const rec = new SpeechStudioRecorder({
        canvas: document.getElementById('tpCanvas'),
        onTick: ({ elapsed }) => {
          document.getElementById('tpTimer').textContent = formatTime(elapsed);
        },
        onSpeechError: (msg) => {
          tpNoticeEl.textContent = msg;
          tpNoticeEl.classList.remove('hidden');
        },
      });
      try {
        await rec.start();
        tpRecorder = rec;
      } catch (err) {
        tpRecorder = null;
        tpNoticeEl.textContent = `${err.message} (Teleprompter scrollt zum Üben trotzdem weiter.)`;
        tpNoticeEl.classList.remove('hidden');
      }
    }
  });

  pauseBtn.addEventListener('click', () => {
    tpIsScrolling = false;
    cancelAnimationFrame(tpScrollRaf);
    playBtn.classList.remove('hidden');
    playBtn.innerHTML = `${icon('play', 15)} <span>Weiter scrollen</span>`;
    pauseBtn.classList.add('hidden');
  });

  document.getElementById('tpResetScrollBtn').addEventListener('click', () => {
    tpIsScrolling = false;
    cancelAnimationFrame(tpScrollRaf);
    tpScrollPos = 0;
    document.getElementById('tpScrollContent').scrollTop = 0;
    playBtn.classList.remove('hidden');
    playBtn.innerHTML = `${icon('play', 15)} <span>Prompter + Aufnahme starten</span>`;
    pauseBtn.classList.add('hidden');
  });

  stopBtn.addEventListener('click', async () => {
    tpIsScrolling = false;
    cancelAnimationFrame(tpScrollRaf);
    playBtn.classList.remove('hidden');
    playBtn.innerHTML = `${icon('play', 15)} <span>Prompter + Aufnahme starten</span>`;
    pauseBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');

    const speech = getSelectedSpeech();
    let recResult = { durationSec: 0, samples: [], audioUrl: null, transcript: '' };
    if (tpRecorder?.isRecording) {
      recResult = await tpRecorder.stop();
      renderAudioPlayback(document.getElementById('tpAudioPlayback'), recResult.audioUrl);
      await autoTranscribeIfNeeded(recResult, { noticeEl: tpNoticeEl, statusBtn: playBtn });
    }

    if (recResult.durationSec < 2 && !recResult.transcript) {
      tpNoticeEl.textContent = 'Keine Mikrofonaufnahme erfasst – bitte Mikrofon/HTTPS prüfen.';
      tpNoticeEl.classList.remove('hidden');
      return;
    }

    const analysis = analyzeSpeech({
      text: recResult.transcript || speech.text,
      durationSec: recResult.durationSec,
      audioSamples: recResult.samples,
      mode: 'teleprompter',
    });

    renderAnalysisCard(
      document.getElementById('tpResultCard'),
      `Teleprompter: ${speech.title}`,
      analysis
    );

    const audioUrl = recResult.blob ? await uploadAudioRecording(recResult) : null;
    if (audioUrl) {
      renderAudioPlayback(document.getElementById('tpAudioPlayback'), audioUrl);
    }

    await saveSession({
      type: 'teleprompter',
      title: `Ablesen: ${speech.title}`,
      analysis,
      audioUrl,
      transcript: recResult.transcript || '(Teleprompter-Text)',
    });
  });
}

// ================= MODULE 4: WORT-CHALLENGE =================
const wcState = {
  topic: '',
  words: [],
  manualChecked: new Set(),
  recorder: null,
  lastRec: null,
};

function rollWordChallenge() {
  const diff = document.getElementById('wcDifficulty').value;
  const count = Number(document.getElementById('wcCount').value);
  wcState.topic = WORD_CHALLENGE_TOPICS[Math.floor(Math.random() * WORD_CHALLENGE_TOPICS.length)];
  const pool = [...WORD_CHALLENGE_POOLS[diff]];
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  wcState.words = picked;
  wcState.manualChecked.clear();

  document.getElementById('wcTopicText').textContent = wcState.topic;
  renderWcChips();
}

function renderWcChips() {
  const text = document.getElementById('wcTranscript').value;
  const autoMatches = matchMandatoryWords(text, wcState.words);
  const container = document.getElementById('wcWordsContainer');

  container.innerHTML = wcState.words
    .map((w) => {
      const isAuto = autoMatches.find((m) => m.word === w)?.matched;
      const isManual = wcState.manualChecked.has(w);
      const active = isAuto || isManual;
      return `<button type="button" class="word-chip ${active ? 'matched' : ''}" data-wc-word="${w}">
        ${icon(active ? 'check' : 'circle', 13)} <span>${w}</span>
      </button>`;
    })
    .join('');

  container.querySelectorAll('[data-wc-word]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const w = btn.dataset.wcWord;
      if (wcState.manualChecked.has(w)) wcState.manualChecked.delete(w);
      else wcState.manualChecked.add(w);
      renderWcChips();
    });
  });
}

function initWordChallengeView() {
  rollWordChallenge();
  document.getElementById('wcRollBtn').addEventListener('click', rollWordChallenge);
  document.getElementById('wcDifficulty').addEventListener('change', rollWordChallenge);
  document.getElementById('wcCount').addEventListener('change', rollWordChallenge);

  const transcriptEl = document.getElementById('wcTranscript');
  transcriptEl.addEventListener('input', renderWcChips);

  const startBtn = document.getElementById('wcStartBtn');
  const stopBtn = document.getElementById('wcStopBtn');
  const noticeEl = document.getElementById('wcSpeechNotice');
  const ampelEl = document.getElementById('wcAmpel');

  startBtn.addEventListener('click', async () => {
    noticeEl.classList.add('hidden');
    wcState.lastRec = null;
    const rec = new SpeechStudioRecorder({
      canvas: document.getElementById('wcCanvas'),
      onTranscript: (text) => {
        transcriptEl.value = text;
        renderWcChips();
      },
      onTick: ({ elapsed }) => {
        document.getElementById('wcTimer').textContent = formatTime(elapsed);
        const rms = rec.samples[rec.samples.length - 1]?.rms || 0;
        updateAmpel(ampelEl, rms, rec.samples);
      },
      onSpeechError: (msg) => {
        noticeEl.textContent = msg;
        noticeEl.classList.remove('hidden');
      },
    });

    try {
      await rec.start();
      wcState.recorder = rec;
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
    } catch (err) {
      noticeEl.textContent = `${err.message} — Schreibe deinen Entwurf ins Textfeld unten.`;
      noticeEl.classList.remove('hidden');
    }
  });

  const evaluateWc = async () => {
    if (wcState.recorder?.isRecording) {
      wcState.lastRec = await wcState.recorder.stop();
      renderAudioPlayback(document.getElementById('wcAudioPlayback'), wcState.lastRec.audioUrl);
    }
    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');

    if (wcState.lastRec) {
      ampelEl.querySelector('.ampel-text').textContent = 'Transkribiere Aufnahme...';
      await autoTranscribeIfNeeded(wcState.lastRec, {
        transcriptEl,
        noticeEl,
        onText: renderWcChips,
        statusBtn: document.getElementById('wcAnalyzeBtn'),
      });
      ampelEl.querySelector('.ampel-text').textContent = 'Aufnahme beendet';
    }

    const text = transcriptEl.value.trim();
    if (!text && (!wcState.lastRec || wcState.lastRec.durationSec < 3)) return;

    const analysis = analyzeSpeech({
      text,
      durationSec: wcState.lastRec?.durationSec || 0,
      audioSamples: wcState.lastRec?.samples || [],
      mandatoryWords: wcState.words,
      mode: 'wort-challenge',
    });

    analysis.mandatoryCheck = analysis.mandatoryCheck.map((m) => ({
      ...m,
      matched: m.matched || wcState.manualChecked.has(m.word),
    }));
    analysis.mandatoryMatchedCount = analysis.mandatoryCheck.filter((m) => m.matched).length;

    renderAnalysisCard(
      document.getElementById('wcResultCard'),
      `Wort-Challenge (${analysis.mandatoryMatchedCount}/${wcState.words.length} Wörter)`,
      analysis
    );

    const audioUrl = wcState.lastRec ? await uploadAudioRecording(wcState.lastRec) : null;
    if (audioUrl) {
      renderAudioPlayback(document.getElementById('wcAudioPlayback'), audioUrl);
    }

    await saveSession({
      type: 'wort-challenge',
      title: `Wort-Challenge: ${wcState.words.join(', ')}`,
      analysis,
      audioUrl,
      transcript: text,
    });
  };

  stopBtn.addEventListener('click', evaluateWc);
  document.getElementById('wcAnalyzeBtn').addEventListener('click', evaluateWc);
}

// ================= MODULE 5: OBAMA DRILLS =================
function switchSubdrill(name) {
  document.querySelectorAll('.subtab').forEach((t) => {
    t.classList.toggle('active', t.dataset.subdrill === name);
  });
  document.querySelectorAll('.subdrill-panel').forEach((p) => {
    p.classList.toggle('active', p.id === `subdrill-${name}`);
  });
}

function initDrillsView() {
  document.querySelectorAll('.subtab').forEach((tab) => {
    tab.addEventListener('click', () => switchSubdrill(tab.dataset.subdrill));
  });

  // A) Pause Drill
  let pauseRec = null;
  let silentFrames = 0;
  let pauseCount = 0;
  let countedCurrentPause = false;

  const pStart = document.getElementById('pauseDrillStartBtn');
  const pStop = document.getElementById('pauseDrillStopBtn');
  const pBox = document.getElementById('pauseLiveIndicator');

  const finishPauseDrill = async () => {
    if (!pauseRec?.isRecording) return;
    const result = await pauseRec.stop();
    pStart.classList.remove('hidden');
    pStop.classList.add('hidden');
    pBox.classList.remove('in-pause');
    document.getElementById('pauseStateText').textContent = 'Transkribiere...';

    await autoTranscribeIfNeeded(result, { statusBtn: pStart });
    document.getElementById('pauseStateText').textContent = 'Beendet';

    const analysis = analyzeSpeech({
      text: result.transcript,
      durationSec: result.durationSec,
      audioSamples: result.samples,
      mode: 'pause-drill',
    });

    const resBox = document.getElementById('pauseDrillResult');
    resBox.classList.remove('hidden');
    resBox.innerHTML = `
      <div><strong>Ergebnis Pausen-Drill (${result.durationSec}s):</strong>
      ${analysis.audio.strategicPauses} strategische Pausen ·
      Pausenanteil: <strong>${analysis.audio.pauseRatio}%</strong> (Ziel: 15–25%) ·
      Ø Länge: <strong>${analysis.audio.avgPauseSec}s</strong></div>
    `;

    const audioUrl = await uploadAudioRecording(result);

    await saveSession({
      type: 'pausen-drill',
      title: `Pausen-Drill (${analysis.audio.strategicPauses} Pausen)`,
      analysis,
      audioUrl,
      transcript: result.transcript,
    });
  };

  pStart.addEventListener('click', async () => {
    silentFrames = 0;
    pauseCount = 0;
    countedCurrentPause = false;
    document.getElementById('pauseLiveCount').textContent = '0';
    document.getElementById('pauseDrillResult').classList.add('hidden');

    const rec = new SpeechStudioRecorder({
      canvas: document.getElementById('pauseCanvas'),
      onTick: ({ elapsed, rms }) => {
        const rem = Math.max(0, 45 - elapsed);
        document.getElementById('pauseDrillTimer').textContent = formatTime(rem);

        if (rms < 0.015) {
          silentFrames++;
          const silentSec = silentFrames * 0.08;
          document.getElementById('pauseSilentStreak').textContent = `${silentSec.toFixed(1)} s`;
          pBox.classList.add('in-pause');
          document.getElementById('pauseStateText').textContent = silentSec >= 0.8 ? 'Wirkungspause' : 'Pause...';
          if (silentSec >= 0.8 && !countedCurrentPause && rec.samples.some((s) => s.rms >= 0.02)) {
            pauseCount++;
            countedCurrentPause = true;
            document.getElementById('pauseLiveCount').textContent = String(pauseCount);
          }
        } else {
          silentFrames = 0;
          countedCurrentPause = false;
          pBox.classList.remove('in-pause');
          document.getElementById('pauseSilentStreak').textContent = '0.0 s';
          document.getElementById('pauseStateText').textContent = 'Sprechen';
        }

        if (elapsed >= 45) {
          finishPauseDrill();
        }
      },
    });

    try {
      await rec.start();
      pauseRec = rec;
      pStart.classList.add('hidden');
      pStop.classList.remove('hidden');
    } catch (err) {
      alert(err.message);
    }
  });

  pStop.addEventListener('click', finishPauseDrill);

  // B) Stilmittel-Labor
  document.getElementById('styleDrillCards').innerHTML = STYLE_DRILLS.map(
    (d) => `
    <div class="style-card">
      <h4>${d.title}</h4>
      <div><strong>Formel:</strong> ${d.formula}</div>
      <div class="example-before">Vorher: „${d.exampleBefore}“</div>
      <div class="example-after">Ziel: „${d.exampleAfter}“</div>
    </div>`
  ).join('');

  const allPrompts = STYLE_DRILLS.flatMap((d) => d.prompts);
  let stylePromptIdx = 0;
  let styleRec = null;
  let styleLastRec = null;
  document.getElementById('styleActivePrompt').textContent = allPrompts[0];

  document.getElementById('styleNextPromptBtn').addEventListener('click', () => {
    stylePromptIdx = (stylePromptIdx + 1) % allPrompts.length;
    document.getElementById('styleActivePrompt').textContent = allPrompts[stylePromptIdx];
    document.getElementById('styleTranscript').value = '';
    document.getElementById('styleResultBox').classList.add('hidden');
  });

  document.getElementById('styleRecStartBtn').addEventListener('click', async () => {
    styleLastRec = null;
    const rec = new SpeechStudioRecorder({
      canvas: document.getElementById('styleCanvas'),
      onTranscript: (text) => {
        document.getElementById('styleTranscript').value = text;
      },
    });
    try {
      await rec.start();
      styleRec = rec;
      document.getElementById('styleRecStartBtn').classList.add('hidden');
      document.getElementById('styleRecStopBtn').classList.remove('hidden');
    } catch (err) {
      alert(err.message);
    }
  });

  const checkStyle = async () => {
    if (styleRec?.isRecording) {
      styleLastRec = await styleRec.stop();
    }
    document.getElementById('styleRecStartBtn').classList.remove('hidden');
    document.getElementById('styleRecStopBtn').classList.add('hidden');

    const transcriptEl = document.getElementById('styleTranscript');
    if (styleLastRec) {
      await autoTranscribeIfNeeded(styleLastRec, {
        transcriptEl,
        statusBtn: document.getElementById('styleCheckBtn'),
      });
    }

    const text = transcriptEl.value.trim();
    if (!text) return;
    const analysis = analyzeSpeech({
      text,
      durationSec: styleLastRec?.durationSec || 0,
      audioSamples: styleLastRec?.samples || [],
      mode: 'stilmittel',
    });

    const box = document.getElementById('styleResultBox');
    box.classList.remove('hidden');
    box.innerHTML = `
      <div><strong>Erkannte Stilmittel:</strong>
      Dreiklang: <strong>${analysis.devices.tricolons.length}</strong> ·
      Anapher: <strong>${analysis.devices.anaphoras.length}</strong> ·
      Kontrast: <strong>${analysis.devices.contrasts.length}</strong> ·
      Score: <strong>${analysis.dimensions.stilmittel}/100</strong></div>
    `;

    const audioUrl = styleLastRec ? await uploadAudioRecording(styleLastRec) : null;

    await saveSession({
      type: 'stilmittel',
      title: `Stilmittel-Drill (${analysis.devices.totalDevices} Figuren)`,
      analysis,
      audioUrl,
      transcript: text,
    });
  };

  document.getElementById('styleRecStopBtn').addEventListener('click', checkStyle);
  document.getElementById('styleCheckBtn').addEventListener('click', checkStyle);

  // C) Story of Self -> Us -> Now
  const selfInput = document.getElementById('storySelfInput');
  const usInput = document.getElementById('storyUsInput');
  const nowInput = document.getElementById('storyNowInput');
  selfInput.value = appState.storyDraft.self || '';
  usInput.value = appState.storyDraft.us || '';
  nowInput.value = appState.storyDraft.now || '';

  const saveStoryDraft = async () => {
    appState.storyDraft = {
      self: selfInput.value,
      us: usInput.value,
      now: nowInput.value,
    };
    await apiPost('/api/story-draft', appState.storyDraft);
  };

  let storyDebounceId = null;
  [selfInput, usInput, nowInput].forEach((inputEl) => {
    inputEl.addEventListener('input', () => {
      clearTimeout(storyDebounceId);
      storyDebounceId = setTimeout(saveStoryDraft, 600);
    });
  });

  document.getElementById('storySaveBtn').addEventListener('click', async () => {
    await saveStoryDraft();
    const box = document.getElementById('storyResultBox');
    box.classList.remove('hidden');
    box.textContent = 'Entwurf auf Server gespeichert.';
  });

  document.getElementById('storyCombineAnalyzeBtn').addEventListener('click', async () => {
    await saveStoryDraft();
    const full = [selfInput.value.trim(), usInput.value.trim(), nowInput.value.trim()]
      .filter(Boolean)
      .join(' ');
    if (!full) return;
    const analysis = analyzeSpeech({ text: full, mode: 'storytelling' });
    renderAnalysisCard(document.getElementById('storyResultBox'), 'Story of Self · Us · Now', analysis);
    document.getElementById('storyResultBox').classList.remove('hidden');
  });

  document.getElementById('storySendToTpBtn').addEventListener('click', async () => {
    await saveStoryDraft();
    const fullText = [
      '[RUHIGER]',
      selfInput.value.trim(),
      '[PAUSE 1.5s]',
      usInput.value.trim(),
      '[PAUSE 1.2s]',
      `[CRESCENDO] ${nowInput.value.trim()}`,
    ]
      .filter((x) => x && x !== '[CRESCENDO] ')
      .join('\n\n');
    const speech = {
      id: `custom_story_${Date.now()}`,
      title: 'Meine eigene Story (Self · Us · Now)',
      category: 'Authentische Biografie',
      technique: 'Marshall-Ganz / Obama-Story-Arc',
      targetWpm: 122,
      text: fullText,
      custom: true,
    };
    appState.customSpeeches = [speech, ...appState.customSpeeches];
    await apiPost('/api/speeches', speech);
    populateSpeechSelect(speech.id);
    switchView('teleprompter');
  });

  // D) Gegenwind / Townhall
  let gwIdx = 0;
  let gwRec = null;
  let gwLastRec = null;

  const renderGwQuestion = () => {
    const q = GEGENWIND_QUESTIONS[gwIdx];
    document.getElementById('gwTagBadge').textContent = q.tag;
    document.getElementById('gwQuestionText').textContent = q.question;
    document.getElementById('gwTipText').textContent = `Strategie: ${q.tip}`;
  };
  renderGwQuestion();

  document.getElementById('gwNextBtn').addEventListener('click', () => {
    gwIdx = (gwIdx + 1) % GEGENWIND_QUESTIONS.length;
    renderGwQuestion();
    document.getElementById('gwTranscript').value = '';
    document.getElementById('gwResultBox').classList.add('hidden');
  });

  document.getElementById('gwStartBtn').addEventListener('click', async () => {
    gwLastRec = null;
    const rec = new SpeechStudioRecorder({
      canvas: document.getElementById('gwCanvas'),
      onTranscript: (text) => {
        document.getElementById('gwTranscript').value = text;
      },
      onTick: ({ elapsed }) => {
        document.getElementById('gwTimer').textContent = formatTime(elapsed);
      },
    });
    try {
      await rec.start();
      gwRec = rec;
      document.getElementById('gwStartBtn').classList.add('hidden');
      document.getElementById('gwStopBtn').classList.remove('hidden');
    } catch (err) {
      alert(err.message);
    }
  });

  const finishGegenwind = async () => {
    if (gwRec?.isRecording) {
      gwLastRec = await gwRec.stop();
      renderAudioPlayback(document.getElementById('gwAudioPlayback'), gwLastRec.audioUrl);
    }
    document.getElementById('gwStartBtn').classList.remove('hidden');
    document.getElementById('gwStopBtn').classList.add('hidden');

    const transcriptEl = document.getElementById('gwTranscript');
    if (gwLastRec) {
      await autoTranscribeIfNeeded(gwLastRec, {
        transcriptEl,
        statusBtn: document.getElementById('gwAnalyzeBtn'),
      });
    }

    const text = transcriptEl.value.trim();
    if (!text && (!gwLastRec || gwLastRec.durationSec < 3)) return;

    const analysis = analyzeSpeech({
      text,
      durationSec: gwLastRec?.durationSec || 0,
      audioSamples: gwLastRec?.samples || [],
      mode: 'gegenwind',
    });

    const box = document.getElementById('gwResultBox');
    box.classList.remove('hidden');
    renderAnalysisCard(box, `Townhall-Antwort (${GEGENWIND_QUESTIONS[gwIdx].tag})`, analysis);

    const audioUrl = gwLastRec ? await uploadAudioRecording(gwLastRec) : null;
    if (audioUrl) {
      renderAudioPlayback(document.getElementById('gwAudioPlayback'), audioUrl);
    }

    await saveSession({
      type: 'gegenwind',
      title: `Gegenwind: ${GEGENWIND_QUESTIONS[gwIdx].tag}`,
      analysis,
      audioUrl,
      transcript: text,
    });
  };

  document.getElementById('gwStopBtn').addEventListener('click', finishGegenwind);
  document.getElementById('gwAnalyzeBtn').addEventListener('click', finishGegenwind);
}

// ================= MODULE 6: PLAYBOOK =================
function renderPlaybook() {
  document.getElementById('playbookGrid').innerHTML = PLAYBOOK_PILLARS.map(
    (p) => `
    <div class="playbook-card">
      <div class="playbook-num num">SÄULE ${p.num}</div>
      <h3>${p.title}</h3>
      <p class="muted-text">${p.summary}</p>
      <ul class="feedback-list">
        ${p.phrases.map((ph) => `<li>${ph}</li>`).join('')}
      </ul>
    </div>`
  ).join('');
}

// ================= EXPORT COACHING REPORT =================
function initExportReport() {
  document.getElementById('exportCoachReportBtn').addEventListener('click', async () => {
    const base = appState.baseline;
    const latest = appState.sessions[0];
    const lines = [
      '# ORATOR — Rhetorik-Coaching-Report',
      '',
      base
        ? `## Eingangstest (Baseline)\n- Obama-Index: ${base.obamaIndex}/100 (${base.levelLabel})\n- Dimensionen: ${Object.entries(base.dimensions).map(([k, v]) => `${DIMENSION_META[k].short}: ${v}`).join(' | ')}`
        : '## Eingangstest: Noch nicht abgeschlossen',
      '',
      latest
        ? `## Letzte Übung (${latest.title})\n- Obama-Index: ${latest.analysis.obamaIndex}/100\n- Tempo: ${latest.analysis.wpm || '—'} WPM\n- Transkript:\n> ${latest.transcript || '(kein Transkript)'}`
        : '',
    ];
    const report = lines.filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(report);
      alert('Coaching-Report in die Zwischenablage kopiert.');
    } catch {
      prompt('Kopiere diesen Report:', report);
    }
  });
}

function isAnyRecordingActive() {
  return Boolean(
    baselineState.recorder?.isRecording ||
      spontanRecorder?.isRecording ||
      tpRecorder?.isRecording ||
      wcState.recorder?.isRecording
  );
}

async function syncFromServer() {
  if (isAnyRecordingActive()) return;
  const prevUpdated = appState.updatedAt;
  const ok = await loadState();
  if (!ok || appState.updatedAt === prevUpdated) return;

  hydrateBaselineFromAppState();
  populateSpeechSelect(document.getElementById('tpSpeechSelect')?.value || null);
  const selfInput = document.getElementById('storySelfInput');
  const usInput = document.getElementById('storyUsInput');
  const nowInput = document.getElementById('storyNowInput');
  if (selfInput && document.activeElement !== selfInput) selfInput.value = appState.storyDraft.self || '';
  if (usInput && document.activeElement !== usInput) usInput.value = appState.storyDraft.us || '';
  if (nowInput && document.activeElement !== nowInput) nowInput.value = appState.storyDraft.now || '';
  updateTopbarAndNav();
  renderDashboard();
}

// ================= BOOTSTRAP =================
async function bootstrap() {
  hydrateStaticIcons();
  await loadState();

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.body.addEventListener('click', (e) => {
    const jump = e.target.closest('[data-jump]');
    if (jump) switchView(jump.dataset.jump);

    const launch = e.target.closest('[data-launch-module]');
    if (launch) {
      switchView(launch.dataset.launchModule);
      if (launch.dataset.subdrill) {
        switchSubdrill(launch.dataset.subdrill);
      }
    }
  });

  document.getElementById('retestBaselineBtn').addEventListener('click', async () => {
    baselineState.stepIdx = 0;
    baselineState.stepResults = [null, null, null];
    baselineState.lastRecording = null;
    renderBaselineResultCard(null);
    renderBaselineStep();
    await persistBaselineProgress();
    switchView('eingangstest');
  });

  document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
    if (!confirm('Trainingsverlauf wirklich zurücksetzen?')) return;
    appState.sessions = [];
    appState.baseline = null;
    appState.baselineProgress = { stepIdx: 0, stepResults: [null, null, null] };
    await apiPost('/api/reset', { scope: 'all' });
    hydrateBaselineFromAppState();
    updateTopbarAndNav();
    renderDashboard();
  });

  initBaselineView();
  initSpontanView();
  initTeleprompterView();
  initWordChallengeView();
  initDrillsView();
  renderPlaybook();
  initExportReport();
  updateTopbarAndNav();
  renderDashboard();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncFromServer();
  });
  window.addEventListener('focus', syncFromServer);

  if (appState.baseline) {
    switchView('dashboard');
  } else {
    switchView('eingangstest');
  }
}

bootstrap();
