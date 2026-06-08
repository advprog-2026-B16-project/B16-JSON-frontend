type BackendAuthResult = {
  data: Record<string, unknown>;
  status: number;
  ok: boolean;
};

export function buildAuthTarget(path: 'login' | 'register') {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  return `${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/${path}`.replace('://localhost', '://127.0.0.1');
}

export function maskAuthBody(bodyText: string) {
  try {
    const data = JSON.parse(bodyText);
    if (data && typeof data === 'object') {
      return JSON.stringify({ ...data, password: '***', confirmPassword: '***' });
    }
  } catch {
    return bodyText;
  }

  return bodyText;
}

export async function forwardAuthRequest(path: 'login' | 'register', bodyText: string): Promise<BackendAuthResult> {
  const targetUrl = buildAuthTarget(path);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${label(path)}] POST ${targetUrl} | Body: ${maskAuthBody(bodyText)}`);
  }

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyText,
  });
  const data = await readBackendData(response);

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${label(path)} Response] ${response.status} | Data:`, data);
  }

  return { data, status: response.status, ok: response.ok };
}

export function unavailableAuthResponse() {
  return {
    detail: 'Backend authentication service is unavailable. Make sure the backend is running on port 8080.',
  };
}

async function readBackendData(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json().catch(() => ({}));
  }

  const text = await response.text().catch(() => '');
  return { detail: text || 'No response body from backend', message: text };
}

function label(path: 'login' | 'register') {
  return path === 'login' ? 'Login' : 'Register';
}
