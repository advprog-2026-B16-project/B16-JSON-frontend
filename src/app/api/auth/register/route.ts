import { NextResponse } from 'next/server';
import { forwardAuthRequest, unavailableAuthResponse } from '../authRouteUtils';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const result = await forwardAuthRequest('register', bodyText);

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('[Register Error]:', error);
    if (error instanceof TypeError && error.message === 'fetch failed') {
      return NextResponse.json(unavailableAuthResponse(), { status: 503 });
    }

    return NextResponse.json({
      detail: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown'}`,
    }, { status: 500 });
  }
}
