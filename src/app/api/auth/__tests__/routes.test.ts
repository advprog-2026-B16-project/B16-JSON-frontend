import { POST as loginPOST } from '../login/route';
import { POST as logoutPOST } from '../logout/route';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const mockCookieStore = {
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options })),
  },
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Login Route', () => {
    it('successfully logs in and sets cookies', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ email: 'test@test.com', password: 'password' }),
      } as unknown as Request;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-token', role: 'USER' }),
      });

      const response = await loginPOST(mockRequest);

      expect(mockCookieStore.set).toHaveBeenCalledWith('auth_token', 'mock-token', expect.any(Object));
      // @ts-ignore
      expect(response.data).toEqual({ success: true, role: 'USER' });
    });
  });

  describe('Logout Route', () => {
    it('deletes cookies on logout', async () => {
      await logoutPOST();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_token');
    });
  });
});
