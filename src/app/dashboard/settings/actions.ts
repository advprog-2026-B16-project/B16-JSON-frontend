'use server';

import { cookies } from 'next/headers';
import { ProfileResponseDTO, ProblemDetail } from '@/types/api';

export type ActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function updateProfile(formData: FormData): Promise<ActionResponse<ProfileResponseDTO>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const fullName = formData.get('fullName') as string;
  const bio = formData.get('bio') as string;
  const location = formData.get('location') as string;
  const avatarUrl = formData.get('avatarUrl') as string;

  try {
    const response = await fetch(`${backendUrl}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, bio, location, avatarUrl }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: (data as ProblemDetail).detail || 'Failed to update profile' };
    }

    return getProfile();
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getProfile(): Promise<ActionResponse<ProfileResponseDTO>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const response = await fetch(`${backendUrl}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch profile' };
    }

    return { success: true, data: data as ProfileResponseDTO };
  } catch {
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getPublicProfile(username: string): Promise<ActionResponse<ProfileResponseDTO>> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  try {
    const response = await fetch(`${backendUrl}/user/profile/${username}`, {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch public profile' };
    }

    return { success: true, data: data as ProfileResponseDTO };
  } catch {
    return { success: false, error: 'Internal Server Error' };
  }
}
