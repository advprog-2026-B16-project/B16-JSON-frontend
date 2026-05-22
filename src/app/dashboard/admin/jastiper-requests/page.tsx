'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, User, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { UpgradeRequestResponse } from '@/types/api';

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
}

function isPendingRequest(status?: string) {
  const normalized = status?.toUpperCase() || 'PENDING';
  return normalized === 'PENDING' || normalized === 'WAITING' || normalized === 'SUBMITTED';
}

export default function JastiperRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setIsLoading(true);
    try {
      let response = await apiFetch('/upgrade-request/get-all');
      let rawData = await response.json().catch(() => null);
      
      // If first endpoint failed or returned empty list/object, try alternative
      const isEmpty = !rawData || 
                     (Array.isArray(rawData) && rawData.length === 0) || 
                     (typeof rawData === 'object' && !Array.isArray(rawData) && !rawData.id && !rawData.upgr_req_id && !rawData.requests && !rawData.data && !rawData.content);

      if (!response.ok || isEmpty) {
        console.log('[RequestsPage] Primary endpoint empty or failed, trying alternative...');
        const altRes = await apiFetch('/upgrade-request/get-requests');
        if (altRes.ok) {
          const altData = await altRes.json().catch(() => null);
          if (altData) {
            response = altRes;
            rawData = altData;
          }
        }
      }

      if (response.ok && rawData) {
        console.log('[RequestsPage] Raw data:', rawData);
        let extracted: RawUpgradeRequest[] = [];
        if (Array.isArray(rawData)) {
          extracted = rawData;
        } else if (rawData && typeof rawData === 'object') {
          extracted = rawData.requests || rawData.data || rawData.content || [];
          if (extracted.length === 0 && (rawData.id || rawData.upgr_req_id)) extracted = [rawData];
        }
        
        console.log('[RequestsPage] Extracted:', extracted.length);

        // NORMALIZE AND FILTER
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

        console.log('[RequestsPage] Normalized:', normalized.length);
        setRequests(normalized);
      } else {
        console.warn('[RequestsPage] Fetch failed.');
        setRequests([]);
      }
    } catch {
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleAction = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const requestToUpdate = requests.find(r => r.id === requestId);
    if (!requestToUpdate) return;

    setNotification(null);
    const originalRequests = [...requests];
    // Optimistic update for smoothness
    setRequests(prev => prev.filter(req => req.id !== requestId));
    
    try {
      const response = await apiFetch(`/upgrade-request/change-status/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          username: requestToUpdate.requesterUsername, 
          newStatus: status
        }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || `Server returned ${response.status}`);
      }

      setNotification({ message: `Successfully ${status === 'ACCEPTED' ? 'approved' : 'rejected'} request!`, type: 'success' });
      setTimeout(fetchRequests, 2000);
    } catch (err) {
      setNotification({ 
        message: err instanceof Error ? err.message : 'Action failed. Please try again.', 
        type: 'error' 
      });
      setRequests(originalRequests);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-purple-400 border-4 border-black p-2 shadow-[4px_4px_0px_0px_#000]">
            <ClipboardList size={32} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-black">Requests Detail</h1>
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

      <AnimatePresence mode="popLayout">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={64} className="animate-spin text-purple-500 mb-4" />
            <p className="font-black uppercase italic text-black">Syncing Core...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.length === 0 ? (
              <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_0px_#000]">
                <p className="text-2xl font-black uppercase italic text-gray-400">No pending upgrade requests found</p>
              </div>
            ) : requests.map((request) => (
              <motion.div key={request.id} layout initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black italic text-xs">
                  ID: {request.id}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-2">
                  <div>
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Applicant</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-cyan-200 border-2 border-black p-1 text-black"><User size={20} /></div>
                      <span className="font-black text-lg text-black">{request.requesterUsername}</span>
                    </div>
                    <p className="text-xs font-bold mt-1 text-black">{request.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Status</p>
                    <span className={`px-2 py-0.5 border-2 border-black font-black uppercase text-[10px] ${
                      request.status?.toUpperCase().includes('APPROVE') || request.status?.toUpperCase().includes('ACCEPTED') ? 'bg-green-300' : 'bg-yellow-300'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase font-black text-gray-500 mb-1">Evidence</p>
                    <p className="font-bold italic text-black break-words bg-gray-50 p-2 border-l-4 border-black">&quot;{request.credential}&quot;</p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t-4 border-black flex justify-end gap-4">
                  <button onClick={() => handleAction(request.id, 'REJECTED')} className="bg-pink-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all text-black">REJECT</button>
                  <button onClick={() => handleAction(request.id, 'ACCEPTED')} className="bg-emerald-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 transition-all text-black">APPROVE</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
