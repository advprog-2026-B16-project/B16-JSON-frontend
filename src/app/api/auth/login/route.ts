import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function maskLoginBody(bodyText: string) {
  try {
    const data = JSON.parse(bodyText);
    if (data && typeof data === 'object' && 'password' in data) {
      return JSON.stringify({ ...data, password: '***' });
    }
  } catch {
    return bodyText;
  }

  return bodyText;
}

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    let targetUrl = `${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/login`;
    targetUrl = targetUrl.replace('://localhost', '://127.0.0.1');
    
    // Read the body once
    const bodyText = await request.text();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Login] POST ${targetUrl} | Body: ${maskLoginBody(bodyText)}`);
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      const text = await response.text().catch(() => '');
      data = { detail: text || 'No response body from backend', message: text };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Login Response] ${response.status} | Data:`, data);
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Backend success - check if we have required fields
    if (!data.token) {
      console.error('[Login Error] Backend returned success but NO token.');
      return NextResponse.json({ detail: 'Authentication failed: No token received from server' }, { status: 500 });
    }

    const cookieStore = await cookies();
    
    cookieStore.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    cookieStore.set('user_role', data.role || 'USER', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('user_id', data.id || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ success: true, role: data.role, id: data.id });
  } catch (error) {
    console.error('[Login Error]:', error);
    if (error instanceof TypeError && error.message === 'fetch failed') {
      return NextResponse.json({
        detail: 'Backend authentication service is unavailable. Make sure the backend is running on port 8080.',
      }, { status: 503 });
    }

    return NextResponse.json({ detail: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}
