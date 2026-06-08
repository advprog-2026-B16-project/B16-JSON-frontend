import { POST as loginPOST } from '../login/route';
import { POST as logoutPOST } from '../logout/route';
import { POST as registerPOST } from '../register/route';

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
        text: jest.fn().mockResolvedValue(JSON.stringify({ email: 'test@test.com', password: 'password' })),
      } as unknown as Request;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({ token: 'mock-token', role: 'USER' }),
      });

      const response = await loginPOST(mockRequest);

      expect(mockCookieStore.set).toHaveBeenCalledWith('auth_token', 'mock-token', expect.any(Object));
      // @ts-expect-error - response.data property is from mocked NextResponse
      expect(response.data).toEqual({ success: true, role: 'USER' });
    });
  });

  describe('Logout Route', () => {
    it('deletes cookies on logout', async () => {
      await logoutPOST();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Register Route', () => {
    it('forwards registration to backend', async () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080/api';
      const mockRequest = {
        text: jest.fn().mockResolvedValue(JSON.stringify({
          username: 'testuser',
          email: 'test@test.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        })),
      } as unknown as Request;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 201,
        ok: true,
        headers: {
          get: (name: string) => name === 'content-type' ? 'application/json' : null,
        },
        json: async () => ({ message: 'User registered successfully' }),
      });

      const response = await registerPOST(mockRequest);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:8080/api/register',
        expect.objectContaining({ method: 'POST' })
      );
      // @ts-expect-error - response.data property is from mocked NextResponse
      expect(response.data).toEqual({ message: 'User registered successfully' });
    });
  });
});
