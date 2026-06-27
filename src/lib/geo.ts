/**
 * Extract a short, searchable area name from a Google reverse-geocoder label.
 * e.g. "Jl. Kemang Raya No.1, Bangka, Kec. Mampang Prpt., Jakarta Selatan, ..."
 *   → "Bangka Jakarta Selatan"
 */
export function extractAreaName(label: string): string {
  const skip = new Set([
    'indonesia', 'dki jakarta', 'jawa barat', 'jawa tengah', 'jawa timur',
    'banten', 'bali', 'yogyakarta', 'jawa',
  ]);
  const postalRe = /^\d{5}$/;

  const parts = label
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !skip.has(s.toLowerCase()) && !postalRe.test(s) && s.length < 50);

  // Skip the very first part if it looks like a street/road
  const isStreet = (s: string) => /^(Jl\.|Jalan|No\.|Gang|Gg\.|Kp\.|Kampung)/i.test(s);
  const start = parts[0] && isStreet(parts[0]) ? 1 : 0;

  return parts.slice(start, start + 2).join(' ') || 'Jakarta';
}
