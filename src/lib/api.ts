export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Use the Next.js API proxy to include the HttpOnly auth_token automatically
  const proxyEndpoint = `/api/proxy${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(proxyEndpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 429) {
    throw new Error('Blocked for 5 minutes (Rate Limited)');
  }

  return response;
}
