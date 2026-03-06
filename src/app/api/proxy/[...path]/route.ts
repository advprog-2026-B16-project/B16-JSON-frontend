import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PUT(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PATCH(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function DELETE(request: Request, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

async function proxyRequest(request: Request, pathSegments: string[]) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';
    const path = pathSegments.join('/');
    
    const url = new URL(request.url);
    const targetUrl = `${backendUrl}/${path}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete('host'); // Let fetch set the correct host
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const options: RequestInit = {
      method: request.method,
      headers: headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      options.body = await request.clone().arrayBuffer();
    }

    const response = await fetch(targetUrl, options);
    
    if (response.status === 429) {
       return NextResponse.json({ message: 'Blocked for 5 minutes (Rate Limited)' }, { status: 429 });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
