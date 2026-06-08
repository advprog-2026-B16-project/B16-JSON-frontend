import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    let targetUrl = `${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/register`;
    targetUrl = targetUrl.replace('://localhost', '://127.0.0.1');

    const bodyText = await request.text();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Register] POST ${targetUrl} | Body: ${bodyText}`);
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
      console.log(`[Register Response] ${response.status} | Data:`, data);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Register Error]:', error);
    return NextResponse.json({
      detail: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown'}`,
    }, { status: 500 });
  }
}
