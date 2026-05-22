export function formatShortId(value?: string | null, length = 5) {
  if (!value) return 'N/A';
  return value.length > length ? `${value.slice(0, length)}...` : value;
}
