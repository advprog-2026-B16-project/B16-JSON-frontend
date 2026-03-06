'use client';

import { Plus, Package, ShoppingCart, Tag } from 'lucide-react';

export default function CataloguePage() {
  const mockCatalogue = [
    { id: 1, name: 'iPhone 15 Pro Max', price: 'Rp 21.000.000', sales: 12, status: 'Active' },
    { id: 2, name: 'Matcha Powder (Uji)', price: 'Rp 450.000', sales: 45, status: 'Active' },
    { id: 3, name: 'Vintage Adidas Jacket', price: 'Rp 1.200.000', sales: 3, status: 'Inactive' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black uppercase mb-4 text-yellow-600">Your Catalogue</h1>
          <p className="text-xl font-bold border-l-8 border-yellow-400 pl-4 bg-yellow-50 py-2">
            Manage the items you are offering to jastip for others.
          </p>
        </div>
        <button className="neo-button flex items-center gap-2 text-xl bg-yellow-400 text-black">
          <Plus size={24} strokeWidth={3} /> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 border-4 border-black bg-cyan-100 shadow-[8px_8px_0px_0px_#000]">
          <Package className="mb-4 text-black" size={32} />
          <h3 className="text-xl font-black uppercase">Total Items</h3>
          <p className="text-4xl font-black">12</p>
        </div>
        <div className="p-6 border-4 border-black bg-pink-100 shadow-[8px_8px_0px_0px_#000]">
          <ShoppingCart className="mb-4 text-black" size={32} />
          <h3 className="text-xl font-black uppercase">Total Sales</h3>
          <p className="text-4xl font-black">60</p>
        </div>
        <div className="p-6 border-4 border-black bg-green-100 shadow-[8px_8px_0px_0px_#000]">
          <Tag className="mb-4 text-black" size={32} />
          <h3 className="text-xl font-black uppercase">Active Offers</h3>
          <p className="text-4xl font-black">8</p>
        </div>
      </div>

      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-yellow-400 text-black border-b-4 border-black">
              <th className="p-4 font-black uppercase">Product Name</th>
              <th className="p-4 font-black uppercase">Base Price</th>
              <th className="p-4 font-black uppercase">Sales</th>
              <th className="p-4 font-black uppercase">Status</th>
              <th className="p-4 font-black uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-black">
            {mockCatalogue.map((item) => (
              <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                <td className="p-4 font-black">{item.name}</td>
                <td className="p-4 font-bold">{item.price}</td>
                <td className="p-4 font-bold">{item.sales}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 border-2 border-black font-black uppercase text-xs ${item.status === 'Active' ? 'bg-green-400' : 'bg-gray-300'} shadow-[2px_2px_0px_0px_#000] text-black`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="bg-black text-white px-4 py-2 font-black uppercase text-xs hover:bg-yellow-400 hover:text-black transition-colors border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
