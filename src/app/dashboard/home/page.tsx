'use client';

import { motion } from 'framer-motion';
import { 
  Plus,
  ArrowRight,
  TrendingUp,
  Package,
  Bell
} from 'lucide-react';

export default function DashboardHomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-5xl font-black uppercase mb-2">Welcome Back!</h1>
          <p className="text-xl font-bold border-l-8 border-main pl-4">Manage your requests and offers in one place.</p>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard title="Active Requests" value="12" icon={<Package />} color="bg-cyan-300" />
        <StatCard title="Total Transactions" value="Rp 4.2M" icon={<TrendingUp />} color="bg-green-400" />
        <StatCard title="Notifications" value="3" icon={<Bell />} color="bg-purple-300" />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h2 className="text-3xl font-black uppercase underline decoration-main decoration-8 underline-offset-8">Recent Activity</h2>
        <button className="neo-button flex items-center gap-2 text-xl">
          <Plus size={24} strokeWidth={3} /> Create New Request
        </button>
      </div>

      {/* Placeholder Table */}
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-4 font-black uppercase">Item</th>
                <th className="p-4 font-black uppercase">Status</th>
                <th className="p-4 font-black uppercase">Price</th>
                <th className="p-4 font-black uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              <TableRow item="iPhone 15 Pro Max (Jepang)" status="Active" price="Rp 21.000.000" statusColor="bg-green-400" />
              <TableRow item="Matcha Powder (Uji, Kyoto)" status="Pending" price="Rp 450.000" statusColor="bg-yellow-400" />
              <TableRow item="Vintage T-Shirt (Berlin)" status="Completed" price="Rp 1.200.000" statusColor="bg-cyan-400" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-6 border-4 border-black ${color} shadow-[8px_8px_0px_0px_#000]`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000]">
          {icon}
        </div>
        <span className="font-black text-xs uppercase tracking-widest bg-white/30 px-2 py-1 border border-black">Stat</span>
      </div>
      <h3 className="text-lg font-bold uppercase">{title}</h3>
      <p className="text-4xl font-black mt-2">{value}</p>
    </motion.div>
  );
}

function TableRow({ item, status, price, statusColor }: { item: string, status: string, price: string, statusColor: string }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4 font-bold">{item}</td>
      <td className="p-4">
        <span className={`px-3 py-1 border-2 border-black font-black uppercase text-xs ${statusColor} shadow-[2px_2px_0px_0px_#000]`}>
          {status}
        </span>
      </td>
      <td className="p-4 font-bold">{price}</td>
      <td className="p-4">
        <button className="flex items-center gap-1 font-black hover:underline decoration-2 underline-offset-4">
          Details <ArrowRight size={16} />
        </button>
      </td>
    </tr>
  );
}
