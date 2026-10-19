const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** keeps Tab inside `root`: from the last control it wraps to the first, and Shift+Tab the other way */
export function trapTab(e: { key: string; shiftKey: boolean; preventDefault(): void }, root: HTMLElement) {
  if (e.key !== 'Tab') return;
  const stops = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(el => el.getClientRects().length > 0 && !el.closest('[inert], [hidden]'));
  if (!stops.length) return;
  const first = stops[0], last = stops[stops.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
