'use client';

import { motion } from 'framer-motion';
import { Users, Search, Filter, Mail } from 'lucide-react';

export default function AllUsersPage() {
  // Mock users for UI demonstration
  const users = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'ADMIN', status: 'Active' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'JASTIPER', status: 'Active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'USER', status: 'Active' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'USER', status: 'Suspended' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-purple-400 border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000]">
            <Users size={32} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-black">All Users</h1>
        </div>
      </motion.div>

      {/* Toolbar */}
      <div className="bg-purple-50 border-4 border-black p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={20} />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full pl-10 pr-4 py-2 border-4 border-black font-bold focus:outline-none text-black"
          />
        </div>
        <button className="bg-white border-4 border-black px-6 py-2 font-black flex items-center gap-2 hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-black">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_#000]">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-black text-white uppercase italic font-black">
            <tr>
              <th className="p-4 border-b-4 border-black">User</th>
              <th className="p-4 border-b-4 border-black">Role</th>
              <th className="p-4 border-b-4 border-black">Status</th>
              <th className="p-4 border-b-4 border-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-bold text-black">
            {users.map((user) => (
              <tr key={user.id} className="border-b-4 border-black hover:bg-purple-50 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-black">{user.name}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail size={12} /> {user.email}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 border-2 border-black uppercase text-xs font-black ${
                    user.role === 'ADMIN' ? 'bg-purple-300' : user.role === 'JASTIPER' ? 'bg-yellow-300' : 'bg-cyan-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-2 ${user.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                    <div className={`w-3 h-3 border-2 border-black rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="bg-pink-300 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                    Manage
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
