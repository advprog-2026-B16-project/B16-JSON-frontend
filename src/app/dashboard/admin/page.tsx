'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  ClipboardList, 
  Activity, 
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatDollar } from '@/lib/currency';
import { UpgradeRequestResponse } from '@/types/api';

interface UserData {
  id: number | string;
  username?: string;
  name?: string;
  email: string;
  role: string;
  status: string;
}

interface TopUpData {
  id?: string;
  transactionId?: string;
  userId?: string;
  amount?: number;
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
  credential?: string;
  status?: string;
  upgradeRequests?: RawUpgradeRequest[];
}

function isPendingRequest(status?: string) {
  const normalized = status?.toUpperCase() || 'PENDING';
  return normalized === 'PENDING' || normalized === 'WAITING' || normalized === 'SUBMITTED';
}

export default function AdminPortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [requests, setRequests] = useState<UpgradeRequestResponse[]>([]);
  const [pendingTopUps, setPendingTopUps] = useState<TopUpData[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmStyle?: string;
  } | null>(null);

  const confirmAction = (title: string, message: string, onConfirm: () => void, confirmText = 'CONFIRM', confirmStyle = 'bg-red-400 hover:bg-red-500 text-white') => {
    setModalConfig({ title, message, onConfirm, confirmText, confirmStyle });
    setModalOpen(true);
  };

  const fetchData = async () => {
    setIsLoading(true);

    // 1. Fetch Users
    try {
      const usersRes = await apiFetch('/admin/users');
      if (usersRes.ok) {
        const userData = await usersRes.json().catch(() => null);
        console.log('[Admin] Users raw data:', userData);
        if (userData) {
          let extractedUsers = Array.isArray(userData) ? userData : (userData.content || userData.users || userData.data || []);
          
          if (Array.isArray(extractedUsers)) {
            extractedUsers = extractedUsers.filter((u: UserData & { upgr_req_id?: string; requester_user?: unknown }) => 
              (u.id || u.email) && !u.upgr_req_id && !u.requester_user && u.role?.toUpperCase() !== 'ADMIN'
            );
          }
          console.log('[Admin] Users extracted:', extractedUsers.length);
          setUsers(extractedUsers || []);
        } else {
          setUsers([]);
        }
      } else {
        console.warn('[Admin] Users fetch returned not OK:', usersRes.status);
        setUsers([]);
      }
    } catch (e) {
      console.error('[Admin] Users fetch error:', e);
      setUsers([]);
    }

    // 2. Fetch Upgrade Requests
    try {
      const requestsRes = await apiFetch('/admin/upgrade-requests');
      if (requestsRes.ok) {
        const rawData = await requestsRes.json().catch(() => null);
        console.log('[Admin] Requests raw data:', rawData);
        
        if (rawData) {
          let extracted: RawUpgradeRequest[] = [];
          if (Array.isArray(rawData)) {
            extracted = rawData;
          } else if (typeof rawData === 'object') {
            extracted = rawData.requests || rawData.data || rawData.content || rawData.upgradeRequests || [];
            if (extracted.length === 0 && (rawData.id || rawData.upgr_req_id)) extracted = [rawData];
          }
          
          const normalized = extracted
            .filter((r: RawUpgradeRequest) => r.id || r.upgr_req_id || r.requestId || r.requesterUsername)
            .map((r: RawUpgradeRequest) => ({
              id: r.id || r.upgr_req_id || r.requestId || Math.random().toString(),
              createdAt: r.createdAt || r.created_at || new Date().toISOString(),
              requesterUserId: r.requesterUserId || (typeof r.requester_user === 'object' ? r.requester_user.id : r.requesterUserId) || 'unknown',
              requesterUsername: r.requesterUsername || (typeof r.requester_user === 'object' ? r.requester_user.username : (r.requester_user as string)) || 'unknown',
              fullName: r.fullName || r.full_name || 'No Name',
              credential: r.credential || 'No Credential',
              status: r.status?.toUpperCase() || 'PENDING'
            }))
            .filter((r: UpgradeRequestResponse) => isPendingRequest(r.status));

          setRequests(normalized);
        } else {
          setRequests([]);
        }
      } else {
        console.warn('[Admin] Requests fetch returned not OK:', requestsRes.status);
        setRequests([]);
      }
    } catch (e) {
      console.error('[Admin] Requests fetch error:', e);
      setRequests([]);
    }

    // 3. Fetch Pending Top-Ups
    try {
      const topupRes = await apiFetch('/admin/topups'); 
      if (topupRes.ok) {
        const pending = await topupRes.json().catch(() => null);
        console.log('[Admin] Topups raw data:', pending);
        setPendingTopUps(Array.isArray(pending) ? pending : []);
      } else {
        console.warn('[Admin] Topups fetch returned not OK:', topupRes.status);
        setPendingTopUps([]);
      }
    } catch (e) {
      console.error('[Admin] Topups fetch error:', e);
      setPendingTopUps([]);
    }

    setIsLoading(false);
  };

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleRequestAction = async (requestId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    const requestToUpdate = requests.find(r => r.id === requestId);
    if (!requestToUpdate) return;

    setIsActionLoading(true);
    setNotification(null);
    
    // Store original state for rollback
    const originalRequests = [...requests];
    // Optimistic UI update
    setRequests(prev => prev.filter(req => req.id !== requestId));
    
    try {
      console.log(`[Admin] Attempting ${newStatus} for request ${requestId} (User: ${requestToUpdate.requesterUsername})`);
      
      const endpoint = newStatus === 'ACCEPTED'
        ? `/admin/upgrade-requests/${requestId}/accept`
        : `/admin/upgrade-requests/${requestId}/reject`;

      let response = await apiFetch(endpoint, {
        method: 'PATCH',
      });

      if (!response.ok && [404, 405].includes(response.status)) {
        response = await apiFetch(`/upgrade-request/change-status/${requestId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            username: requestToUpdate.requesterUsername,
            newStatus,
          }),
        });
      }
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error(`[Admin] Action failed: ${response.status}`, data);
        throw new Error(data.detail || data.message || `Server returned ${response.status}`);
      }

      setNotification({ message: `Successfully ${newStatus === 'ACCEPTED' ? 'approved' : 'rejected'} request!`, type: 'success' });
      // Refresh to ensure sync
      setTimeout(fetchData, 2000);
    } catch (err) {
      setNotification({ 
        message: err instanceof Error ? err.message : 'Action failed. Please try again.', 
        type: 'error' 
      });
      // Rollback optimistic update
      setRequests(originalRequests);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmTopUp = async (transactionId: string) => {
    setIsActionLoading(true);
    setNotification(null);
    try {
      const response = await apiFetch(`/admin/topups/${transactionId}/confirm`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Top-up confirmation failed');
      
      setNotification({ message: 'Successfully confirmed top up!', type: 'success' });
      setPendingTopUps(prev => prev.filter(tx => (tx.id || tx.transactionId) !== transactionId));
    } catch (err) {
      setNotification({ 
        message: err instanceof Error ? err.message : 'Action failed.', 
        type: 'error' 
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectTopUp = async (transactionId: string) => {
    setIsActionLoading(true);
    setNotification(null);
    try {
      // The backend method is in WalletTransactionController which maps to /api/wallet
      const response = await apiFetch(`/wallet/topup/reject/${transactionId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Top-up rejection failed');
      }
      
      setNotification({ message: 'Successfully rejected top up!', type: 'success' });
      setPendingTopUps(prev => prev.filter(tx => (tx.id || tx.transactionId) !== transactionId));
    } catch (err) {
      setNotification({ 
        message: err instanceof Error ? err.message : 'Action failed.', 
        type: 'error' 
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUserAction = async (userId: string | number, action: 'unban' | 'ban' | 'demote' | 'delete') => {
    setIsActionLoading(true);
    setNotification(null);
    try {
      const endpoint = action === 'delete' 
        ? `/admin/users/${userId}` 
        : `/admin/users/${userId}/${action}`;
      
      const method = action === 'delete' ? 'DELETE' : 'PATCH';
      
      const response = await apiFetch(endpoint, { method });
      if (!response.ok) throw new Error(`User action ${action} failed`);
      
      setNotification({ message: `Successfully performed ${action} on user!`, type: 'success' });
      setTimeout(fetchData, 1000);
    } catch (err) {
      setNotification({ message: err instanceof Error ? err.message : 'Action failed.', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'requests', 'topups'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: <Users className="text-purple-600" />, color: 'bg-purple-100' },
    { label: 'Pending Requests', value: requests.length.toString(), icon: <ClipboardList className="text-amber-600" />, color: 'bg-amber-100' },
    { label: 'Pending Top-Ups', value: pendingTopUps.length.toString(), icon: <Activity className="text-emerald-600" />, color: 'bg-emerald-100' },
  ];

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
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-8 p-4 border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_#000] ${
              notification.type === 'success' ? 'bg-emerald-400' : 'bg-pink-400'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-12">
        {[
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
          { id: 'users', label: 'User Registry', icon: <Users size={20} /> },
          { id: 'requests', label: `Upgrade Requests (${requests.length})`, icon: <ClipboardList size={20} /> },
          { id: 'topups', label: `Pending Top-Ups (${pendingTopUps.length})`, icon: <Activity size={20} /> },
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
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 size={64} className="animate-spin text-purple-500 mb-4" />
            <p className="font-black uppercase italic">Accessing Encrypted Core...</p>
          </motion.div>
        ) : (
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map(s => <StatCard key={s.label} {...s} />)}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_#000]">
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-black text-white uppercase italic font-black">
                    <tr>
                      <th className="p-4 border-b-4 border-black">User Identity</th>
                      <th className="p-4 border-b-4 border-black">Role</th>
                      <th className="p-4 border-b-4 border-black">Status</th>
                      <th className="p-4 border-b-4 border-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold">
                    {users.map((user) => (
                      <tr key={user.id} className="border-b-4 border-black hover:bg-purple-50">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-xl font-black">{user.username || user.name}</span>
                            <span className="text-sm opacity-50">{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 border-2 border-black text-xs uppercase font-black ${user.role === 'ADMIN' ? 'bg-purple-300' : 'bg-cyan-200'}`}>{user.role}</span>
                        </td>
                        <td className="p-4 uppercase text-xs font-black">
                          <span className={user.status?.toUpperCase() === 'ACTIVE' ? 'text-emerald-600' : 'text-red-500'}>{user.status || 'ACTIVE'}</span>
                        </td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          {user.status?.toUpperCase() === 'BANNED' || user.status?.toUpperCase() === 'INACTIVE' ? (
                            <button 
                              disabled={isActionLoading || user.role === 'ADMIN'} 
                              onClick={() => confirmAction('UNBAN USER', `Are you sure you want to unban ${user.username || user.name}?`, () => handleUserAction(user.id, 'unban'), 'UNBAN', 'bg-emerald-400 hover:bg-emerald-500')} 
                              className="px-2 py-1 bg-emerald-300 border-2 border-black text-xs font-black hover:bg-emerald-400 disabled:opacity-50"
                            >
                              UNBAN
                            </button>
                          ) : (
                            <button 
                              disabled={isActionLoading || user.role === 'ADMIN'} 
                              onClick={() => confirmAction('BAN USER', `Are you sure you want to ban ${user.username || user.name}?`, () => handleUserAction(user.id, 'ban'), 'BAN', 'bg-yellow-400 hover:bg-yellow-500')} 
                              className="px-2 py-1 bg-yellow-300 border-2 border-black text-xs font-black hover:bg-yellow-400 disabled:opacity-50"
                            >
                              BAN
                            </button>
                          )}
                          
                          {user.role === 'JASTIPER' && (
                            <button 
                              disabled={isActionLoading} 
                              onClick={() => confirmAction('DEMOTE JASTIPER', `Are you sure you want to demote ${user.username || user.name} to a regular USER?`, () => handleUserAction(user.id, 'demote'), 'DEMOTE', 'bg-pink-400 hover:bg-pink-500 text-white')} 
                              className="px-2 py-1 bg-pink-300 border-2 border-black text-xs font-black hover:bg-pink-400 disabled:opacity-50"
                            >
                              DEMOTE
                            </button>
                          )}
                          <button 
                            disabled={isActionLoading || user.role === 'ADMIN'} 
                            onClick={() => confirmAction('DELETE USER', `Are you sure you want to permanently delete ${user.username || user.name}? This action cannot be undone.`, () => handleUserAction(user.id, 'delete'), 'DELETE', 'bg-red-500 hover:bg-red-600 text-white')} 
                            className="px-2 py-1 bg-red-400 border-2 border-black text-xs font-black hover:bg-red-500 text-white disabled:opacity-50"
                          >
                            DEL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {requests.length === 0 ? (
                  <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
                    <p className="text-2xl font-black uppercase italic text-gray-400">No pending upgrade requests</p>
                  </div>
                ) : requests.map((request) => (
                  <div key={request.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] relative">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Applicant</p>
                        <span className="font-black text-lg block">{request.requesterUsername}</span>
                        <span className="text-sm font-bold opacity-60">{request.fullName}</span>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Status</p>
                        <span className={`px-2 py-0.5 border-2 border-black font-black uppercase text-xs ${
                          request.status?.toUpperCase().includes('APPROVE') || request.status?.toUpperCase().includes('ACCEPTED') ? 'bg-green-300' : 'bg-yellow-300'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Credential</p>
                        <p className="font-bold italic border-l-4 border-black pl-3 bg-gray-50">{request.credential}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t-4 border-black flex justify-end gap-4">
                      <button disabled={isActionLoading} onClick={() => handleRequestAction(request.id, 'REJECTED')} className="bg-pink-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">REJECT</button>
                      <button disabled={isActionLoading} onClick={() => handleRequestAction(request.id, 'ACCEPTED')} className="bg-emerald-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">APPROVE</button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {activeTab === 'topups' && (
              <motion.div key="topups" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                {pendingTopUps.length === 0 ? (
                  <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
                    <p className="text-2xl font-black uppercase italic text-gray-400">No pending top-ups</p>
                  </div>
                ) : pendingTopUps.map((tx) => (
                  <div key={tx.transactionId || tx.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] relative">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Transaction ID</p>
                        <span className="font-mono text-sm block">{tx.transactionId || tx.id}</span>
                        <span className="text-sm font-bold opacity-60">User: {tx.userId}</span>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-black text-gray-500 mb-1">Amount</p>
                        <span className="block max-w-[180px] truncate font-black text-xl text-green-600" title={formatDollar(tx.amount || 0)}>
                          {formatDollar(tx.amount || 0)}
                        </span>
                      </div>
                      <div className="flex items-end justify-end gap-2 mt-4 md:mt-0">
                        <button disabled={isActionLoading} onClick={() => confirmAction('REJECT TOP UP', `Are you sure you want to reject transaction ${tx.transactionId || tx.id}?`, () => handleRejectTopUp(tx.transactionId || tx.id || ''), 'REJECT', 'bg-pink-400 hover:bg-pink-500 text-white')} className="bg-pink-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 w-full md:w-auto">
                          REJECT
                        </button>
                        <button disabled={isActionLoading} onClick={() => confirmAction('CONFIRM TOP UP', `Are you sure you want to confirm transaction ${tx.transactionId || tx.id}?`, () => handleConfirmTopUp(tx.transactionId || tx.id || ''), 'CONFIRM', 'bg-emerald-400 hover:bg-emerald-500')} className="bg-emerald-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 w-full md:w-auto">
                          CONFIRM
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && modalConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] max-w-md w-full"
            >
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tight">{modalConfig.title}</h2>
              <p className="font-bold text-gray-700 mb-8">{modalConfig.message}</p>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 border-4 border-black font-black uppercase hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    modalConfig.onConfirm();
                  }}
                  className={`px-6 py-2 border-4 border-black font-black uppercase transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${modalConfig.confirmStyle}`}
                >
                  {modalConfig.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) => {
  return (
    <div className={`${color} border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]`}>
      <div className="flex justify-between items-start mb-4">
        <div className="bg-white border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000]">{icon}</div>
        <span className="text-4xl font-black">{value}</span>
      </div>
      <p className="text-lg font-black uppercase italic">{label}</p>
    </div>
  );
};
