'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  ArrowRight,
  TrendingUp,
  Wallet,
  CreditCard,
  Clock
} from 'lucide-react';
import { useWallet } from '@/hooks/wallet/useWallet';
import { usePayments } from '@/hooks/payment/usePayments';
import { PaymentResponse } from '@/types/wallet';
import { formatCompactDollar } from '@/lib/currency';

function displayStatus(status: PaymentResponse['status']) {
  return status === 'PENDING' ? 'UNPAID' : status;
}

function statusColor(status: PaymentResponse['status']) {
  if (status === 'SUCCESS') return 'bg-green-400';
  if (status === 'PENDING') return 'bg-yellow-400';
  if (status === 'FAILED') return 'bg-red-400';
  if (status === 'CANCELLED') return 'bg-slate-300';
  return 'bg-gray-400';
}

export default function HomeClient({ initialUserId }: { initialUserId: string }) {
  const router = useRouter();
  
  // Real data hooks!
  const { balance, isLoading: walletLoading } = useWallet(initialUserId);
  const { payments, isLoading: paymentsLoading } = usePayments();

  const activePayments = payments.filter(p => p.status === 'PENDING').length;

  const totalSpent = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Combine top 5 recent activities (Wallet Txs + Payments)
  // Payments have expiresAt or paidAt. Wallet Txs don't have standard timestamp in our DTO yet?
  // Let's just list Payments as recent activities for now, or just show Wallet topups.
  const recentPurchases = [...payments]
    .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black">
      <header className="mb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-5xl font-black uppercase mb-2 text-main">Welcome Back!</h1>
          <p className="text-xl font-bold border-l-8 border-black pl-4 bg-yellow-50 py-2">
            Here is your financial and shopping proxy summary.
          </p>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard 
          title="Wallet Balance" 
          value={walletLoading ? '...' : formatCompactDollar(balance || 0)} 
          icon={<Wallet />} 
          color="bg-emerald-300" 
          onClick={() => router.push('/dashboard/wallet')}
        />
        <StatCard 
          title="Pending Payments" 
          value={paymentsLoading ? '...' : activePayments.toString()} 
          icon={<Clock />} 
          color="bg-yellow-300" 
          onClick={() => router.push('/dashboard/transactions')}
        />
        <StatCard 
          title="Total Spent" 
          value={paymentsLoading ? '...' : formatCompactDollar(totalSpent)} 
          icon={<TrendingUp />} 
          color="bg-cyan-300" 
          onClick={() => router.push('/dashboard/transactions')}
        />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h2 className="text-3xl font-black uppercase underline decoration-black decoration-8 underline-offset-8">Recent Purchases</h2>
        <div className="flex gap-4">
          <button onClick={() => router.push('/dashboard/wallet')} className="border-4 border-black bg-white px-6 py-3 font-black uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:bg-emerald-100 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <CreditCard size={20} /> Top Up
          </button>
          <button onClick={() => router.push('/dashboard/marketplace')} className="bg-black text-white border-4 border-black px-6 py-3 font-black uppercase flex items-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:bg-main hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <Plus size={20} /> Request Jastip
          </button>
        </div>
      </div>

      {/* Real Data Table */}
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 font-black uppercase">Order ID</th>
                <th className="p-4 font-black uppercase">Status</th>
                <th className="p-4 font-black uppercase">Amount</th>
                <th className="p-4 font-black uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {paymentsLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center font-bold italic text-gray-500">Loading your purchases...</td>
                </tr>
              ) : recentPurchases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center font-bold italic text-gray-500">No recent purchases found. Go make one!</td>
                </tr>
              ) : (
                recentPurchases.map((payment) => (
                  <TableRow 
                    key={payment.id}
                    item={`Order: ${payment.orderId}`} 
                    status={displayStatus(payment.status)} 
                    price={formatCompactDollar(payment.amount)} 
                    statusColor={statusColor(payment.status)} 
                    onAction={() => router.push('/dashboard/transactions')}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }: { title: string, value: string, icon: React.ReactNode, color: string, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className={`p-6 border-4 border-black ${color} shadow-[8px_8px_0px_0px_#000] cursor-pointer transition-transform`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000]">
          {icon}
        </div>
        <span className="font-black text-xs uppercase tracking-widest bg-white/30 px-2 py-1 border border-black">Stat</span>
      </div>
      <h3 className="text-lg font-bold uppercase">{title}</h3>
      <p className="mt-2 truncate text-4xl font-black" title={value}>{value}</p>
    </motion.div>
  );
}

function TableRow({ item, status, price, statusColor, onAction }: { item: string, status: string, price: string, statusColor: string, onAction: () => void }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="max-w-[220px] p-4 font-bold font-mono">
        <span className="block truncate" title={item}>{item}</span>
      </td>
      <td className="p-4">
        <span className={`px-3 py-1 border-2 border-black font-black uppercase text-xs ${statusColor} shadow-[2px_2px_0px_0px_#000]`}>
          {status}
        </span>
      </td>
      <td className="max-w-[160px] p-4 font-black">
        <span className="block truncate" title={price}>{price}</span>
      </td>
      <td className="p-4">
        <button onClick={onAction} className="flex items-center gap-1 font-black hover:text-main hover:underline decoration-2 underline-offset-4 transition-colors">
          View Details <ArrowRight size={16} />
        </button>
      </td>
    </tr>
  );
}
