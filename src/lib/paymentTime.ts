export function getPaymentTimeMs(value?: string | null) {
  if (!value) return 0;
  const hasTimeZone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimeZone ? value : `${value}Z`).getTime();
}

export function isPaymentExpired(expiresAt?: string | null, now = Date.now()) {
  const expiresAtMs = getPaymentTimeMs(expiresAt);
  return Boolean(expiresAtMs && now >= expiresAtMs);
}
