'use client';

import { ClipboardList, ShoppingCart, User, MapPin } from 'lucide-react';

export default function OrdersPage() {
  const mockOrders = [
    { id: 1024, buyer: 'Budi Santoso', item: 'iPhone 15 Pro Max', date: 'Feb 25, 2026', status: 'Pending Approval', statusColor: 'bg-yellow-400' },
    { id: 1025, buyer: 'Siti Aminah', item: 'SK-II Facial Treatment', date: 'Feb 26, 2026', status: 'In Transit', statusColor: 'bg-cyan-400' },
    { id: 1026, buyer: 'Andi Rianto', item: 'Matcha Powder (Uji)', date: 'Feb 27, 2026', status: 'Delivered', statusColor: 'bg-green-400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black uppercase mb-4 text-purple-600">Jastip Orders</h1>
          <p className="text-xl font-bold border-l-8 border-purple-400 pl-4 bg-purple-50 py-2">
            Track and manage your active jastip orders from buyers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000]">
          <ShoppingCart className="mb-4 text-purple-600" size={40} />
          <h3 className="text-2xl font-black uppercase">Active Orders</h3>
          <p className="text-6xl font-black">2</p>
        </div>
        <div className="p-8 border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000]">
          <MapPin className="mb-4 text-cyan-500" size={40} />
          <h3 className="text-2xl font-black uppercase">On the Way</h3>
          <p className="text-6xl font-black">1</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-black uppercase underline decoration-purple-400 decoration-8 underline-offset-8">Recent Orders</h2>
        
        {mockOrders.map((order) => (
          <div key={order.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="bg-purple-100 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                <ClipboardList size={32} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase">Order #{order.id}</h3>
                <p className="font-bold text-gray-600">{order.item}</p>
                <div className="flex items-center gap-2 mt-1">
                  <User size={16} /> <span className="text-sm font-bold italic">{order.buyer}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:items-end w-full md:w-auto gap-4">
              <span className={`px-4 py-1 border-2 border-black font-black uppercase text-sm ${order.statusColor} shadow-[4px_4px_0px_0px_#000]`}>
                {order.status}
              </span>
              <button className="bg-black text-white px-6 py-2 font-black uppercase hover:bg-main hover:text-black transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                Update Status
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
