import { GET } from '../[...path]/route';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const mockCookieStore = {
  get: jest.fn(),
};

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options })),
  },
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

describe('Proxy API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_URL = 'https://api.test.com';
  });

  it('proxies GET request with token', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'mock-token' });
    const mockRequest = {
      url: 'http://localhost/api/proxy/user/profile',
      method: 'GET',
      headers: new Headers(),
      clone: () => ({ arrayBuffer: async () => new ArrayBuffer(0) }),
    } as unknown as Request;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ name: 'Test User' }),
    });

    const response = await GET(mockRequest, { params: { path: ['user', 'profile'] } });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/user/profile',
      expect.any(Object)
    );
    // @ts-ignore
    expect(response.data).toEqual({ name: 'Test User' });
  });
});
