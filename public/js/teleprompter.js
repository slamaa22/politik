// Teleprompter Cue Formatting, Pause Parsing & WPM-Calibrated Scroll Engine (Browser + Node compatible)

export function parsePauseSeconds(rawArg) {
  const m = String(rawArg || '').match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return 1.2;
  const val = Number(m[1].replace(',', '.'));
  if (!Number.isFinite(val) || val <= 0) return 1.2;
  return Math.min(10, Math.max(0.3, val));
}

export function countSpokenWords(text) {
  const cleaned = String(text || '')
    .replace(/\[BETONUNG\s*:\s*([^\]]+)\]/gi, ' $1 ')
    .replace(/\[(PAUSE|RUHIGER|CRESCENDO|BETONUNG)[^\]]*\]/gi, ' ')
    .replace(/[▲●◆]/g, ' ')
    .replace(/—\s*ruhiger\s*—/gi, ' ');
  const matches = cleaned.match(/[A-ZÄÖÜa-zäöüß0-9-]+/g);
  return matches ? matches.length : 0;
}

export function computeTeleprompterPxPerSec({
  wpm = 125,
  wordCount = 0,
  textHeightPx = 0,
  fontSizePx = 28,
}) {
  const safeWpm = Math.max(45, Math.min(240, Number(wpm) || 125));
  const safeFont = Math.max(16, Math.min(56, Number(fontSizePx) || 28));

  if (wordCount >= 5 && textHeightPx > 40) {
    const speakingSeconds = (wordCount / safeWpm) * 60;
    const rawPxPerSec = textHeightPx / speakingSeconds;
    return Math.max(8, Math.min(140, rawPxPerSec));
  }

  return (safeWpm / 125) * (safeFont * 0.72);
}

export function formatCuedSpeechHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\[PAUSE([^\]]*)\]/gi, (_, arg) => {
      const sec = parsePauseSeconds(arg);
      const raw = String(arg || '').trim();
      const label = raw ? `PAUSE ${raw}` : `PAUSE ${sec.toFixed(1)}s`;
      return `<span class="cue-pause" data-pause-sec="${sec}" data-pause-label="${label}">${label}</span>`;
    })
    .replace(/\[CRESCENDO\]/gi, '<span class="cue-crescendo">CRESCENDO</span>')
    .replace(/\[BETONUNG\s*:\s*([^\]]+)\]/gi, '<span class="cue-emphasis">$1</span>')
    .replace(/\[BETONUNG\]\s*([\wäöüß-]+)/gi, '<span class="cue-emphasis">$1</span>')
    .replace(/\[RUHIGER\]/gi, '<span class="cue-calm">Ruhig und tief einsteigen</span>');
}
