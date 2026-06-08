'use server';

import { cookies } from 'next/headers';
import { readJson } from '@/lib/http';
import { ProfileResponseDTO, ProblemDetail } from '@/types/api';

type ProfileActionResult =
  | { success: true; data: ProfileResponseDTO }
  | { success: false; error: string };

function getBackendUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  return (backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl).replace('://localhost', '://127.0.0.1');
}

function getErrorMessage(data: ProblemDetail | null, fallback: string) {
  return data?.detail || data?.title || fallback;
}

async function fetchProfileFromBackend(backendUrl: string, token: string) {
  for (const endpoint of ['/user/profile', '/profile']) {
    const response = await fetch(`${backendUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (response.status !== 404 || endpoint === '/profile') {
      return response;
    }
  }

  throw new Error('Profile endpoint not found');
}

async function updateProfileOnBackend(backendUrl: string, token: string, body: string) {
  for (const endpoint of ['/user/profile', '/profile']) {
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body,
      cache: 'no-store',
    });

    if (response.status !== 404 || endpoint === '/profile') {
      return response;
    }
  }

  throw new Error('Profile endpoint not found');
}

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const backendUrl = getBackendUrl();

  const fullName = formData.get('fullName') as string;
  const bio = formData.get('bio') as string;
  const location = formData.get('location') as string;

  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const response = await updateProfileOnBackend(
      backendUrl,
      token,
      JSON.stringify({ fullName, bio, location })
    );

    const data = await readJson<ProblemDetail>(response).catch(() => null);

    if (!response.ok) {
      return { success: false, error: getErrorMessage(data, 'Failed to update profile') };
    }

    return getProfile();
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getProfile(): Promise<ProfileActionResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const backendUrl = getBackendUrl();

  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const response = await fetchProfileFromBackend(backendUrl, token);

    const data = await readJson<ProfileResponseDTO | ProblemDetail>(response).catch(() => null);

    if (!response.ok) {
      return { success: false, error: getErrorMessage(data as ProblemDetail | null, 'Failed to fetch profile') };
    }

    if (!data) {
      return { success: false, error: 'Profile response was empty' };
    }

    return { success: true, data: data as ProfileResponseDTO };
  } catch (error) {
    console.error('Fetch profile error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
