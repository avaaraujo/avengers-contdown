export const hm = (min: number) => {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};
export const dec = (x: number, d = 1) => x.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
export const pad = (n: number) => String(n).padStart(2, '0');

export function countdownParts(target: number, now: number) {
  let ms = Math.max(0, target - now);
  const d = Math.floor(ms / 864e5); ms -= d * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const m = Math.floor(ms / 6e4);
  const s = Math.floor((ms - m * 6e4) / 1e3);
  return { d, h, m, s };
}

export const saga = (phase: number) => (phase <= 3 ? 'Saga do Infinito' : 'Saga do Multiverso');
