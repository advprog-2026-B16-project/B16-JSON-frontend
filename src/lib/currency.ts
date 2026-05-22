export function formatDollar(value: number) {
  return `$${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function formatCompactDollar(value: number) {
  return `$${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)}`;
}
