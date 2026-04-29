/** Format E.164 digits (no +) as local Ghana 0XX… for display */

export function formatGhLocalDigits(e164Digits: string): string {
  const d = e164Digits.replace(/\D/g, "");
  if (d.startsWith("233") && d.length >= 12) return `0${d.slice(3)}`;
  return d;
}

export function formatGhSpaced(e164Digits: string): string {
  const local = formatGhLocalDigits(e164Digits);
  if (local.length >= 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return local;
}
