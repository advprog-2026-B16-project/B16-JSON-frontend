'use client';

import Link from 'next/link'; import { useEffect, useState } from 'react';
import Link from 'next/link'; import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link'; import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'; import {
  ShieldCheck,
  Users,
  ClipboardList,
  Activity,
  LayoutDashboard,
  Loader2,
  User as UserIcon,
  Trash2,
  ArrowDownCircle
} from 'lucide-react';
import Link from 'next/link'; import { apiFetch } from '@/lib/api';
import Link from 'next/link'; import { UpgradeRequestResponse } from '@/types/api';

interface UserData {
  id: string;
  username?: string;
  name?: string;
  email: string;
  role: string;
  status: string;
}

interface RawUpgradeRequest {
  id?: string;
  upgr_req_id?: string;
  requestId?: string;
  createdAt?: string;
  created_at?: string;
  requesterUserId?: string;
  requesterUsername?: string;
  requester_user?: string | { id: string; username: string };
  fullName?: string;
  full_name?: string;
  credential?: string; socialMediaUrl?: string;
  status?: string;
}

export default function AdminPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<UpgradeRequestResponse[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Users
      let usersRes = await apiFetch('/user/getUsers');
      if (!usersRes.ok) usersRes = await apiFetch('/user/all');

      if (usersRes.ok) {
        const userData = await usersRes.json();
        let extractedUsers = Array.isArray(userData) ? userData : (userData.content || userData.users || userData.data || []);

        if (Array.isArray(extractedUsers)) {
          extractedUsers = extractedUsers.filter((u: any) => (u.id || u.email) && !u.upgr_req_id && !u.requester_user);
        }

        setUsers(extractedUsers);
      }

      // 2. Fetch Upgrade Requests
      let requestsRes = await apiFetch('/upgrade-request/get-all');
      if (!requestsRes.ok) requestsRes = await apiFetch('/upgrade-request/get-requests');

      if (requestsRes.ok) {
        const rawData = await requestsRes.json();
        let extracted: RawUpgradeRequest[] = Array.isArray(rawData) ? rawData : (rawData.requests || rawData.data || rawData.content || []);
        
        const normalized = extracted.map((r: RawUpgradeRequest) => ({
            id: r.id || r.upgr_req_id || r.requestId || Math.random().toString(),
            createdAt: r.createdAt || r.created_at || new Date().toISOString(),
            requesterUserId: r.requesterUserId || (typeof r.requester_user === 'object' ? r.requester_user.id : r.requesterUserId) || 'unknown',
            requesterUsername: r.requesterUsername || (typeof r.requester_user === 'object' ? r.requester_user.username : (r.requester_user as string)) || 'unknown',
            fullName: r.fullName || r.full_name || 'No Name',
            credential: r.credential || r.credential || 'No Credential',
            status: r.status?.toUpperCase() || 'PENDING', socialMediaUrl: r.socialMediaUrl || 'None'
          }));
        setRequests(normalized);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleRequestAction = async (requestId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    const requestToUpdate = requests.find(r => r.id === requestId);
    if (!requestToUpdate) return;
    if (!confirm(`Are you sure you want to ${newStatus === 'ACCEPTED' ? 'APPROVE' : 'REJECT'} this request?`)) return;

    setIsActionLoading(true);
    try {
      const response = await apiFetch(`/upgrade-request/change-status/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ username: requestToUpdate.requesterUsername, newStatus: newStatus })
      });

      if (response.ok) {
        setNotification({ message: `Successfully ${newStatus === 'ACCEPTED' ? 'approved' : 'rejected'} request!`, type: 'success' });
        fetchData();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      setNotification({ message: 'Action failed. Please try again.', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUserBan = async (userId: string) => {
    if (!confirm('Are you sure you want to BAN this user?')) return;
    setIsActionLoading(true);
    try {
      const response = await apiFetch(`/user/${userId}/ban`, { method: 'PATCH' });
      if (response.ok) {
        setNotification({ message: 'User banned successfully!', type: 'success' });
        fetchData();
      }
    } catch {
      setNotification({ message: 'Failed to ban user', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUserDemote = async (userId: string) => {
    if (!confirm('Are you sure you want to DEMOTE this Jastiper to Titipers?')) return;
    setIsActionLoading(true);
    try {
      const response = await apiFetch(`/user/${userId}/demote`, { method: 'PATCH' });
      if (response.ok) {
        setNotification({ message: 'User demoted successfully!', type: 'success' });
        fetchData();
      }
    } catch {
      setNotification({ message: 'Failed to demote user', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'requests'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="p-8 max-w-7xl mx-auto text-black">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-purple-400 border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Admin Dashboard</h1>
        </div>
      </motion.div>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`mb-8 p-4 border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_#000] ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-pink-400'}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-4 mb-12">
        {['overview', 'users', 'requests'].map((id) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); router.push(`/dashboard/admin?tab=${id}`); }}
            className={`px-6 py-3 font-black uppercase italic border-4 border-black transition-all ${activeTab === id ? 'bg-purple-400 translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000]'}`}
          >
            {id === 'overview' ? <LayoutDashboard className="inline mr-2" size={20} /> : id === 'users' ? <Users className="inline mr-2" size={20} /> : <ClipboardList className="inline mr-2" size={20} />}
            {id === 'requests' ? `Upgrade Requests (${requests.length})` : id}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={64} className="animate-spin text-purple-500 mb-4" />
            <p className="font-black uppercase italic">Accessing Core...</p>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Total Users" value={users.length.toString()} icon={<Users />} color="bg-purple-100" />
                <StatCard label="Pending Requests" value={requests.length.toString()} icon={<ClipboardList />} color="bg-amber-100" />
                <StatCard label="System Health" value="100%" icon={<Activity />} color="bg-emerald-100" />
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_#000]">
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-black text-white uppercase italic font-black">
                    <tr>
                      <th className="p-4 border-b-4 border-black">Identity</th>
                      <th className="p-4 border-b-4 border-black">Role</th>
                      <th className="p-4 border-b-4 border-black">Status</th>
                      <th className="p-4 border-b-4 border-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold">
                    {users.map((user) => (
                      <tr key={user.id} className="border-b-4 border-black hover:bg-purple-50">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <Link href={`/dashboard/account/public/${user.username}`} className="text-xl font-black hover:underline">{user.username || user.name}</Link>
                            <span className="text-sm opacity-50">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 border-2 border-black text-xs uppercase font-black ${user.role === 'ADMIN' ? 'bg-purple-300' : 'bg-cyan-200'}`}>{user.role}</span>      
                        </td>
                        <td className="p-4 uppercase text-xs font-black">
                          <span className={user.status?.toUpperCase() === 'ACTIVE' ? 'text-emerald-600' : 'text-red-500'}>{user.status || 'ACTIVE'}</span>
                        </td>
                        <td className="p-4">
                            <div className="flex gap-2">
                                {user.role === 'JASTIPER' && (
                                    <button onClick={() => handleUserDemote(user.id)} className="p-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-yellow-400 transition-colors" title="Demote to Titipers"><ArrowDownCircle size={16} /></button>
                                )}
                                {user.role !== 'ADMIN' && user.status?.toUpperCase() !== 'BANNED' && (
                                    <button onClick={() => handleUserBan(user.id)} className="p-2 bg-red-400 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-red-500 text-white transition-colors" title="Ban Account"><Trash2 size={16} /></button>
                                )}
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {requests.length === 0 ? (
                  <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
                    <p className="text-2xl font-black uppercase italic text-gray-400">No pending upgrade requests</p>
                  </div>
                ) : requests.map((request) => (
                  <div key={request.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] relative">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Applicant</p>
                        <Link href={`/dashboard/account/public/${request.requesterUsername}`} className="font-black text-lg block hover:underline">{request.requesterUsername}</Link>
                        <span className="text-sm font-bold opacity-60">{request.fullName}</span>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Status</p>
                        <span className={`px-2 py-0.5 border-2 border-black font-black uppercase text-xs ${request.status?.toUpperCase().includes('ACCEPTED') ? 'bg-green-300' : 'bg-yellow-300'}`}>{request.status}</span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Credential</p>
                        <p className="font-bold italic border-l-4 border-black pl-3 bg-gray-50 break-all">{request.credential}</p>
                        <p className="text-xs uppercase font-black text-gray-500 mt-2 mb-1">Social Media</p>
                        <p className="font-bold italic border-l-4 border-black pl-3 bg-gray-50 break-all">{request.socialMediaUrl || "None"}</p>
                      </div>
                    </div>
                    {request.status === 'PENDING' && (
                        <div className="mt-6 pt-6 border-t-4 border-black flex justify-end gap-4">
                            <button disabled={isActionLoading} onClick={() => handleRequestAction(request.id, 'REJECTED')} className="bg-pink-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">REJECT</button>
                            <button disabled={isActionLoading} onClick={() => handleRequestAction(request.id, 'ACCEPTED')} className="bg-emerald-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">APPROVE</button>
                        </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) => {
  return (
    <div className={`${color} border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]`}>
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000] text-black">{icon}</div>
        <span className="text-4xl font-black">{value}</span>
      </div>
      <p className="text-lg font-black uppercase italic">{label}</p>
    </div>
  );
};
