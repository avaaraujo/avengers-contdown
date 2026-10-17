/** A comic sound-effect burst, drawn as SVG. Deterministic jitter so it never shimmers between renders. */
export function Burst({ points = 16, inner = 0.72, fill = '#f7c600', seed = 1 }: { points?: number; inner?: number; fill?: string; seed?: number }) {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const j = 1 + Math.sin(seed * 12.9 + i * 78.2) * 0.07;
    const r = (i % 2 ? inner : 1) * j;
    pts.push(`${(50 + Math.cos(a) * 50 * r).toFixed(1)},${(50 + Math.sin(a) * 50 * r).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={pts.join(' ')} fill={fill} stroke="#111" strokeWidth={2.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

export const ArrowLeft = () => (
  <svg viewBox="0 0 26 30" aria-hidden="true"><path d="M24 2 L2 15 L24 28 Z" fill="#111" /></svg>
);
export const ArrowRight = () => (
  <svg viewBox="0 0 26 30" aria-hidden="true"><path d="M2 2 L24 15 L2 28 Z" fill="#111" /></svg>
);
export const BackArrow = () => (
  <svg viewBox="0 0 30 18" aria-hidden="true"><path d="M29 9H4M10 2L3 9l7 7" fill="none" stroke="#111" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const Close = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
