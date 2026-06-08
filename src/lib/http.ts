type ErrorPayload = {
  detail?: string;
  message?: string;
  error?: string;
  title?: string;
};

export async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

export async function getErrorMessage(response: Response, fallback: string) {
  const data = await readJson<ErrorPayload>(response).catch(() => null);
  return data?.detail || data?.message || data?.error || data?.title || fallback;
}

export async function expectJson<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback));
  }

  const data = await readJson<T>(response);
  if (!data) throw new Error('Backend returned an empty response');
  return data;
}
