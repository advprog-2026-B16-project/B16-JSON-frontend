import { apiFetch } from '../api';

describe('apiFetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('prefixes endpoint and sets default headers', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'test' }),
    });

    await apiFetch('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/test-endpoint',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('handles relative endpoints without leading slash', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch('no-slash');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/proxy/no-slash',
      expect.any(Object)
    );
  });

  it('throws error on 429 status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    await expect(apiFetch('/limited')).rejects.toThrow('Blocked for 5 minutes (Rate Limited)');
  });

  it('passes through other options', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await apiFetch('/post', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      })
    );
  });
});
