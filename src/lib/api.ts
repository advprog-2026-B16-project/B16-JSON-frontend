export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Use environment variable with a hardcoded fallback for local development reliability
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  
  // Use the Next.js API proxy to include the HttpOnly auth_token automatically
  const proxyEndpoint = `/api/proxy${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(proxyEndpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Ensure cookies are always sent to the proxy
    credentials: 'include',
  });

  if (response.status === 429) {
    throw new Error('Blocked for 5 minutes (Rate Limited)');
  }

  return response;
}
