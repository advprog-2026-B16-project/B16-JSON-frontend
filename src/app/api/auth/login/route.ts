import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { forwardAuthRequest, unavailableAuthResponse } from '../authRouteUtils';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const result = await forwardAuthRequest('login', bodyText);

    if (!result.ok) {
      return NextResponse.json(result.data, { status: result.status });
    }

    const token = typeof result.data.token === 'string' ? result.data.token : '';
    const role = typeof result.data.role === 'string' ? result.data.role : 'USER';
    const id = typeof result.data.id === 'string' ? result.data.id : '';

    if (!token) {
      console.error('[Login Error] Backend returned success but NO token.');
      return NextResponse.json({ detail: 'Authentication failed: No token received from server' }, { status: 500 });
    }

    const cookieStore = await cookies();
    
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    cookieStore.set('user_role', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('user_id', id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json(id ? { success: true, role, id } : { success: true, role });
  } catch (error) {
    console.error('[Login Error]:', error);
    if (error instanceof TypeError && error.message === 'fetch failed') {
      return NextResponse.json(unavailableAuthResponse(), { status: 503 });
    }

    return NextResponse.json({ detail: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}
