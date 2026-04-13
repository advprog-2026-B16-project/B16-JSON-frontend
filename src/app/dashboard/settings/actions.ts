'use server';

import { cookies } from 'next/headers';
import { ProfileResponseDTO, ProblemDetail } from '@/types/api';

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const fullName = formData.get('fullName') as string;
  const bio = formData.get('bio') as string;
  const location = formData.get('location') as string;

  try {
    const response = await fetch(`${backendUrl}/profile/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, bio, location }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: (data as ProblemDetail).detail || 'Failed to update profile' };
    }

    return { success: true, data: data as ProfileResponseDTO };
  } catch (error) {
    console.error('Update profile error:', error);
    return { error: 'Internal Server Error' };
  }
}

export async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!token) return { error: 'Not authenticated' };

  try {
    const response = await fetch(`${backendUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: 'Failed to fetch profile' };
    }

    return { success: true, data: data as ProfileResponseDTO };
  } catch (error) {
    return { error: 'Internal Server Error' };
  }
}
