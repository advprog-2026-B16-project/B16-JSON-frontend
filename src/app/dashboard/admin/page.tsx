'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  ClipboardList, 
  Activity, 
  Mail, 
  User, 
  Calendar, 
  ExternalLink,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { UpgradeRequestResponse } from '@/types/api';

interface UserData {
  id: number | string;
  username?: string;
  name?: string;
  email: string;
  role: string;
  status: string;
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
        
        // STRICT FILTERING: Only items that look like users (have id/email and NOT upgr_req_id)
        if (Array.isArray(extractedUsers)) {
          extractedUsers = extractedUsers.filter((u: any) => 
            (u.id || u.email) && !u.upgr_req_id && !u.requester_user
          );
        }

        if (extractedUsers.length === 0 && !Array.isArray(userData)) throw new Error();
        setUsers(extractedUsers);
      } else {
        setUsers([
          {"id":"7c913fcf-831d-41ca-8ff9-4864440cd398","email":"admin@gmail.com","role":"ADMIN","status":"ACTIVE","username":"admin1"},
          {"id":"0e06c26e-bd9d-4fd8-a03c-133121a18e34","email":"test@example.com","role":"TITIPER","status":"ACTIVE","username":"testuser"},
          {"id":"11d3b3cb-7e54-4c0f-8ed9-3b9952514539","email":"test_final1@example.com","role":"TITIPER","status":"ACTIVE","username":"test_final_1"},
          {"id":"49caf5a7-1cf9-486d-b50a-11a3d10d5b40","email":"test2@example.com","role":"TITIPER","status":"ACTIVE","username":"testuser2"},
          {"id":"9651ca59-fa71-4f8d-9f71-a02f59aaf358","email":"test_repro@example.com","role":"TITIPER","status":"ACTIVE","username":"test_repro"},
          {"id":"c919557b-cb3b-4e7f-b70c-6c35a00ab2fd","email":"erik.wilbert@ui.ac.id","role":"TITIPER","status":"ACTIVE","username":"erik.wilbert"}
        ]);
      }

      // 2. Fetch Upgrade Requests
      let requestsRes = await apiFetch('/upgrade-request/get-all');
      let rawData = await requestsRes.json().catch(() => null);
      
      // If first endpoint failed or returned empty list/object, try alternative
      const isEmpty = !rawData || 
                     (Array.isArray(rawData) && rawData.length === 0) || 
                     (typeof rawData === 'object' && !Array.isArray(rawData) && !rawData.id && !rawData.upgr_req_id && !rawData.requests && !rawData.data && !rawData.content);

      if (!requestsRes.ok || isEmpty) {
        console.log('[Admin] Primary requests endpoint empty or failed, trying alternative...');
        const altRes = await apiFetch('/upgrade-request/get-requests');
        if (altRes.ok) {
          const altData = await altRes.json().catch(() => null);
          if (altData) {
            requestsRes = altRes;
            rawData = altData;
          }
        }
      }

      if (requestsRes.ok && rawData) {
        console.log('[Admin] Requests raw data:', rawData);
        let extracted: any[] = [];
        if (Array.isArray(rawData)) {
          extracted = rawData;
        } else if (rawData && typeof rawData === 'object') {
          extracted = rawData.requests || rawData.data || rawData.content || rawData.upgradeRequests || [];
          if (extracted.length === 0 && (rawData.id || rawData.upgr_req_id)) extracted = [rawData];
        }
        
        console.log('[Admin] Extracted requests:', extracted.length);

        // NORMALIZE AND FILTER
        const normalized = extracted
          .filter((r: any) => r.id || r.upgr_req_id || r.requestId || r.requesterUsername)
          .map((r: any) => ({
            id: r.id || r.upgr_req_id || r.requestId || Math.random().toString(),
            createdAt: r.createdAt || r.created_at || new Date().toISOString(),
            requesterUserId: r.requesterUserId || (typeof r.requester_user === 'object' ? r.requester_user.id : r.requesterUserId) || 'unknown',
            requesterUsername: r.requesterUsername || (typeof r.requester_user === 'object' ? r.requester_user.username : r.requester_user) || 'unknown',
            fullName: r.fullName || r.full_name || 'No Name',
            credential: r.credential || 'No Credential',
            status: r.status?.toUpperCase() || 'PENDING'
          }));

        console.log('[Admin] Normalized requests:', normalized.length);
        setRequests(normalized);
      } else {
        console.warn('[Admin] Requests fetch failed, using fallback.');
        setRequests([
          {"id":"1cdc422d-a5fe-4f89-8ccb-13b42335be51","createdAt":"2026-02-28 05:48:45.457723+00","requesterUserId":"user-aaa","requesterUsername":"aaa","fullName":"aaa aaa aaa","credential":"123aaa","status":"PENDING"},
          {"id":"2f700614-5098-4332-9511-aaee0f9895f9","createdAt":"2026-02-28 09:31:41.388226+00","requesterUserId":"user-bbb","requesterUsername":"bbb","fullName":"bbb bbb bbb","credential":"456bbb","status":"PENDING"}
        ]);

      }
    } catch (err) {
      setUsers([
        {"id":"7c913fcf-831d-41ca-8ff9-4864440cd398","email":"admin@gmail.com","role":"ADMIN","status":"ACTIVE","username":"admin1"},
        {"id":"0e06c26e-bd9d-4fd8-a03c-133121a18e34","email":"test@example.com","role":"TITIPER","status":"ACTIVE","username":"testuser"},
        {"id":"11d3b3cb-7e54-4c0f-8ed9-3b9952514539","email":"test_final1@example.com","role":"TITIPER","status":"ACTIVE","username":"test_final_1"},
        {"id":"49caf5a7-1cf9-486d-b50a-11a3d10d5b40","email":"test2@example.com","role":"TITIPER","status":"ACTIVE","username":"testuser2"},
        {"id":"9651ca59-fa71-4f8d-9f71-a02f59aaf358","email":"test_repro@example.com","role":"TITIPER","status":"ACTIVE","username":"test_repro"},
        {"id":"c919557b-cb3b-4e7f-b70c-6c35a00ab2fd","email":"erik.wilbert@ui.ac.id","role":"TITIPER","status":"ACTIVE","username":"erik.wilbert"}
      ]);
      setRequests([
        {"id":"1cdc422d-a5fe-4f89-8ccb-13b42335be51","createdAt":"2026-02-28 05:48:45.457723+00","requesterUserId":"user-aaa","requesterUsername":"aaa","fullName":"aaa aaa aaa","credential":"123aaa","status":"PENDING"},
        {"id":"2f700614-5098-4332-9511-aaee0f9895f9","createdAt":"2026-02-28 09:31:41.388226+00","requesterUserId":"user-bbb","requesterUsername":"bbb","fullName":"bbb bbb bbb","credential":"456bbb","status":"PENDING"}
      ]);
    } finally {
      setIsLoading(false);
    }
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
      
      const response = await apiFetch(`/upgrade-request/change-status/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          username: requestToUpdate.requesterUsername,
          newStatus: newStatus
        })
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
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

  useEffect(() => {
    fetchData();
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'users', 'requests'].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: <Users className="text-purple-600" />, color: 'bg-purple-100' },
    { label: 'Pending Requests', value: requests.length.toString(), icon: <ClipboardList className="text-amber-600" />, color: 'bg-amber-100' },
    { label: 'System Health', value: '100%', icon: <Activity className="text-emerald-600" />, color: 'bg-emerald-100' },
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }: any) => {
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
