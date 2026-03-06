'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  ClipboardList, 
  Activity, 
  Search, 
  Filter, 
  Mail, 
  User, 
  Calendar, 
  ExternalLink,
  CheckCircle,
  XCircle,
  LayoutDashboard
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface UserData {
  id: number | string;
  name?: string;
  username?: string;
  email: string;
  role: string;
  status: string;
}

interface UpgradeRequest {
  id: string;
  name?: string;
  fullName?: string;
  date?: string;
  reason?: string;
  experience?: string;
  status: string;
}

export default function AdminPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);

  const fetchData = async () => {
    try {
      const usersRes = await apiFetch('/user/getUsers');
      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData || []);
      }
      const requestsRes = await apiFetch('/upgrade-request/get-requests');
      if (requestsRes.ok) {
        const requestData = await requestsRes.json();
        setRequests(requestData || []);
      }
    } catch (err) {
      console.error('API Error, using fallback:', err);
      setUsers([
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'ADMIN', status: 'Active' },
        { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'JASTIPER', status: 'Active' },
      ]);
      setRequests([
        { id: 'REQ-001', name: 'John Doe', date: '2024-02-27', reason: 'I travel often.', status: 'Pending' },
      ]);
    }
  };

  const handleRequestAction = async (requestId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setIsActionLoading(true);
    try {
      const response = await apiFetch(`/upgrade-request/change-status/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Action failed');
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'requests'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const stats = [
    { label: 'Total Users', value: (users || []).length.toString(), icon: <Users className="text-purple-600" />, color: 'bg-purple-100' },
    { label: 'Pending Requests', value: (requests || []).length.toString(), icon: <ClipboardList className="text-amber-600" />, color: 'bg-amber-100' },
    { label: 'System Health', value: '98%', icon: <Activity className="text-emerald-600" />, color: 'bg-emerald-100' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto text-black">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-purple-400 border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Admin Command Center</h1>
        </div>
        <p className="text-xl font-bold text-gray-600">Centralized platform oversight and management.</p>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-4 mb-12">
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
          { id: 'users', label: 'User Management', icon: <Users size={20} /> },
          { id: 'requests', label: 'Upgrade Requests', icon: <ClipboardList size={20} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              router.push(`/dashboard/admin?tab=${tab.id}`);
            }}
            className={`flex items-center gap-2 px-6 py-3 font-black uppercase italic border-4 border-black transition-all ${
              activeTab === tab.id 
                ? 'bg-purple-400 translate-x-1 translate-y-1 shadow-none' 
                : 'bg-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className={`${stat.color} border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000]">{stat.icon}</div>
                    <span className="text-4xl font-black">{stat.value}</span>
                  </div>
                  <p className="text-lg font-black uppercase italic">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="bg-purple-50 border-4 border-black p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-[4px_4px_0px_0px_#000]">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={20} />
                <input type="text" placeholder="Search users by name or email..." className="w-full pl-10 pr-4 py-2 border-4 border-black font-bold focus:outline-none text-black" />
              </div>
              <button className="bg-white border-4 border-black px-6 py-2 font-black flex items-center gap-2 hover:bg-gray-100 shadow-[4px_4px_0px_0px_#000] transition-all text-black">
                <Filter size={20} /> Filter
              </button>
            </div>

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
                  {(users || []).map((user) => (
                    <tr key={user.id} className="border-b-4 border-black hover:bg-purple-50 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xl font-black">{user.name || user.username}</span>
                          <span className="text-sm text-gray-500 flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 border-2 border-black uppercase text-xs font-black ${user.role === 'ADMIN' ? 'bg-purple-300' : user.role === 'JASTIPER' ? 'bg-yellow-300' : 'bg-cyan-300'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-2 ${user.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                          <div className={`w-3 h-3 border-2 border-black rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="bg-pink-300 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div key="requests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            {(requests || []).map((request) => (
              <div key={request.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden text-black">
                <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black italic">{request.id}</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Applicant</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-cyan-200 border-2 border-black p-1"><User size={20} /></div>
                      <span className="font-black text-lg">{request.name || request.fullName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Date</p>
                    <div className="flex items-center gap-2"><Calendar size={18} /><span className="font-bold">{request.date || 'Recent'}</span></div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Reason</p>
                    <p className="font-bold italic text-black">&quot;{request.reason || request.experience}&quot;</p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t-4 border-black flex flex-wrap justify-between items-center gap-4">
                  <button className="flex items-center gap-2 bg-main border-4 border-black px-4 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-black">View Profile <ExternalLink size={16} /></button>
                  <div className="flex gap-4">
                    <button 
                      disabled={isActionLoading}
                      onClick={() => handleRequestAction(request.id, 'REJECTED')}
                      className="flex items-center gap-2 bg-pink-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 text-black"
                    >
                      <XCircle size={20} /> REJECT
                    </button>
                    <button 
                      disabled={isActionLoading}
                      onClick={() => handleRequestAction(request.id, 'ACCEPTED')}
                      className="flex items-center gap-2 bg-emerald-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 text-black"
                    >
                      <CheckCircle size={20} /> APPROVE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
