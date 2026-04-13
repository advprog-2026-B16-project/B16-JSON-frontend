import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(request, path);
}

async function proxyRequest(request: Request, pathSegments: string[]) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    
    let targetUrl = `${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/${path}${url.search}`;
    targetUrl = targetUrl.replace('://localhost', '://127.0.0.1');

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json;charset=UTF-8');
    headers.set('Accept', 'application/json');
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // DO NOT set Origin or Referer to avoid triggering CORS filters on the backend
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const options: RequestInit = {
      method: request.method,
      headers: headers,
      cache: 'no-store',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const bodyText = await request.text();
      if (bodyText) {
        options.body = bodyText;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Proxy] ${request.method} ${targetUrl} | Token: ${token ? 'Found' : 'Missing'}`);
    }

    const response = await fetch(targetUrl, options);
    const text = await response.text().catch(() => '');
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { detail: text || `Backend returned status ${response.status}`, status: response.status, url: targetUrl };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Proxy Error]:', error);
    return NextResponse.json({ 
      detail: `Proxy Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
