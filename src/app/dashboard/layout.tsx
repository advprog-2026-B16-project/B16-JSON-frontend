import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value;

  const normalizedRole = role?.toUpperCase() || '';
  const isJastiper = normalizedRole.includes('JASTIPER');
  const isAdmin = normalizedRole.includes('ADMIN');

  return (
    <DashboardClient isJastiper={isJastiper} isAdmin={isAdmin}>
      {children}
    </DashboardClient>
  );
}
