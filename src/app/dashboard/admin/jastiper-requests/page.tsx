'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, User, Calendar, ExternalLink } from 'lucide-react';

export default function JastiperRequestsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'ADMIN') {
      router.push('/dashboard/home');
    } else {
      const timer = setTimeout(() => {
        setIsAdmin(true);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [router]);

  if (isLoading || !isAdmin) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-black text-2xl">LOADING REQUESTS...</div>;
  }

  // Mock requests for UI demonstration
  const requests = [
    { 
      id: 'REQ-001', 
      requesterUser: { username: 'John Doe' }, 
      createdAt: '2024-02-27', 
      credential: 'I travel to Japan often.' 
    },
    { 
      id: 'REQ-002', 
      requesterUser: { username: 'Sarah Wilson' }, 
      createdAt: '2024-02-26', 
      credential: 'Frequent flyer in SE Asia.' 
    },
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
            <ClipboardList size={32} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-black">Jastiper Requests</h1>
        </div>
      </motion.div>

      <div className="space-y-6">
        {requests.map((request, idx) => (
          <motion.div
            key={request.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 font-black italic">
              {request.id}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <p className="text-xs uppercase font-black text-gray-500 mb-1">Applicant</p>
                <div className="flex items-center gap-2">
                  <div className="bg-cyan-200 border-2 border-black p-1">
                    <User size={20} />
                  </div>
                  <span className="font-black text-lg">{request.requesterUser.username}</span>
                </div>
              </div>

              <div className="md:col-span-1">
                <p className="text-xs uppercase font-black text-gray-500 mb-1">Date Submitted</p>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span className="font-bold">{request.createdAt}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs uppercase font-black text-gray-500 mb-1">Upgrade Reason</p>
                <p className="font-bold italic">&quot;{request.credential}&quot;</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t-4 border-black flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-main border-4 border-black px-4 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  View Profile <ExternalLink size={16} />
                </button>
              </div>
              
              <div className="flex gap-4">
                <button className="flex items-center gap-2 bg-pink-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <XCircle size={20} /> REJECT
                </button>
                <button className="flex items-center gap-2 bg-emerald-300 border-4 border-black px-6 py-2 font-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <CheckCircle size={20} /> APPROVE
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {requests.length === 0 && (
          <div className="bg-gray-100 border-4 border-black border-dashed p-12 text-center">
            <p className="text-2xl font-black text-gray-400 uppercase">No pending requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
