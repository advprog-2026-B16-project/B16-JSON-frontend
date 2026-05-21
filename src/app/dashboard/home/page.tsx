import { cookies } from 'next/headers';
import HomeClient from './HomeClient';

export default async function DashboardHomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value || '';

  return <HomeClient initialUserId={userId} />;
}
