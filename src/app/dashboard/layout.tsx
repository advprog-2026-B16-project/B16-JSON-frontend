import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;

  const isJastiper = role === 'JASTIPER';
  const isAdmin = role === 'ADMIN';

  return (
    <DashboardClient isJastiper={isJastiper} isAdmin={isAdmin}>
      {children}
    </DashboardClient>
  );
}
