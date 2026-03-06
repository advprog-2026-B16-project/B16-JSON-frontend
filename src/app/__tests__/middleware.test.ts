import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ type: 'next' })),
    redirect: jest.fn((url) => ({ type: 'redirect', url })),
  },
}));

describe('Middleware', () => {
  const mockUrl = 'http://localhost:3000';

  it('redirects to login if accessing dashboard without token', () => {
    const req = {
      nextUrl: new URL(`${mockUrl}/dashboard/home`),
      url: `${mockUrl}/dashboard/home`,
      cookies: {
        get: jest.fn().mockReturnValue(undefined),
      },
    } as unknown as NextRequest;

    const res = middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/login' }));
  });

  it('redirects non-admins away from admin panel', () => {
    const req = {
      nextUrl: new URL(`${mockUrl}/dashboard/admin`),
      url: `${mockUrl}/dashboard/admin`,
      cookies: {
        get: jest.fn().mockImplementation((name) => {
          if (name === 'auth_token') return { value: 'token' };
          if (name === 'user_role') return { value: 'USER' };
        }),
      },
    } as unknown as NextRequest;

    const res = middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/dashboard/home' }));
  });

  it('redirects logged-in users away from login/register', () => {
    const req = {
      nextUrl: new URL(`${mockUrl}/login`),
      url: `${mockUrl}/login`,
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'token' }),
      },
    } as unknown as NextRequest;

    const res = middleware(req);
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/dashboard/home' }));
  });

  it('allows access to dashboard with token', () => {
    const req = {
      nextUrl: new URL(`${mockUrl}/dashboard/home`),
      url: `${mockUrl}/dashboard/home`,
      cookies: {
        get: jest.fn().mockReturnValue({ value: 'token' }),
      },
    } as unknown as NextRequest;

    const res = middleware(req);
    expect(NextResponse.next).toHaveBeenCalled();
  });
});
