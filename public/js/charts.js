import { DIMENSION_META } from './data.js';

const KEYS = ['tempo', 'pausen', 'dynamik', 'stilmittel', 'wirCharisma', 'klarheit'];

export function renderRadarChart(container, currentDims, baselineDims = null) {
  if (!container) return;
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 112;
  const levels = [25, 50, 75, 100];

  const pointAt = (idx, value) => {
    const angle = (Math.PI * 2 * idx) / KEYS.length - Math.PI / 2;
    const r = (Math.max(0, Math.min(100, value)) / 100) * maxR;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };

  const polygonPoints = (dims) =>
    KEYS.map((k, i) => pointAt(i, dims?.[k] ?? 0).map((n) => n.toFixed(1)).join(',')).join(' ');

  const gridRings = levels
    .map((lvl) => {
      const pts = KEYS.map((_, i) => pointAt(i, lvl).map((n) => n.toFixed(1)).join(',')).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="#e6e8ec" stroke-width="1" />`;
    })
    .join('');

  const obamaTarget = {
    tempo: 85,
    pausen: 85,
    dynamik: 85,
    stilmittel: 85,
    wirCharisma: 85,
    klarheit: 85,
  };

  const axes = KEYS.map((key, i) => {
    const [x2, y2] = pointAt(i, 100);
    const [lx, ly] = pointAt(i, 124);
    const anchor = lx < cx - 12 ? 'end' : lx > cx + 12 ? 'start' : 'middle';
    const score = currentDims?.[key] ?? 0;
    return `
      <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#e6e8ec" stroke-width="1" />
      <text x="${lx.toFixed(1)}" y="${(ly - 2).toFixed(1)}" text-anchor="${anchor}" font-size="11.5" font-weight="600" fill="#0e0f12">${DIMENSION_META[key].short}</text>
      <text x="${lx.toFixed(1)}" y="${(ly + 12).toFixed(1)}" text-anchor="${anchor}" font-size="11" font-weight="600" fill="#68707c">${score}/100</text>
    `;
  }).join('');

  const baselinePolygon = baselineDims
    ? `<polygon points="${polygonPoints(baselineDims)}" fill="rgba(104, 112, 124, 0.08)" stroke="#8c939e" stroke-width="1.5" stroke-dasharray="4 3" />`
    : '';

  const currentPolygon = currentDims
    ? `<polygon points="${polygonPoints(currentDims)}" fill="rgba(14, 15, 18, 0.09)" stroke="#0e0f12" stroke-width="2.2" />`
    : '';

  const dots = currentDims
    ? KEYS.map((k, i) => {
        const [x, y] = pointAt(i, currentDims[k] ?? 0);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#ffffff" stroke="#0e0f12" stroke-width="2" />`;
      }).join('')
    : '';

  container.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" class="radar-svg" role="img" aria-label="Rhetorik-Kompetenzradar">
      ${gridRings}
      <polygon points="${polygonPoints(obamaTarget)}" fill="none" stroke="rgba(0, 168, 89, 0.45)" stroke-width="1.3" stroke-dasharray="3 3" />
      ${axes}
      ${baselinePolygon}
      ${currentPolygon}
      ${dots}
    </svg>
    <div class="radar-legend">
      <span><i class="dot dot-current"></i> Aktuell</span>
      ${baselineDims ? '<span><i class="dot dot-baseline"></i> Eingangstest</span>' : ''}
      <span><i class="dot dot-target"></i> Zielkorridor (85)</span>
    </div>
  `;
}
