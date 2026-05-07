import { cookies } from 'next/headers';
import WalletClient from './WalletClient';

export default async function WalletPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value || '';

  return <WalletClient initialUserId={userId} />;
}
