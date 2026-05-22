'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  IdCard,
  Send,
  AlertCircle,
  Lock,
  Clock,
  XCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { ProfileResponseDTO, UpgradeRequestResponse } from '@/types/api';

type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

function normalizeRequestStatus(status?: string | null): RequestStatus | null {
  const normalized = status?.toUpperCase();
  if (normalized === 'PENDING' || normalized === 'ACCEPTED' || normalized === 'REJECTED') {
    return normalized;
  }
  return null;
}

function statusCopy(status: RequestStatus | null, isJastiper: boolean) {
  if (isJastiper || status === 'ACCEPTED') {
    return {
      label: 'Approved',
      title: 'Jastiper Access Approved',
      message: 'Your request has been approved. You can now manage catalogue items and Jastiper orders.',
      color: 'bg-emerald-300',
      icon: <CheckCircle2 size={28} />,
    };
  }

  if (status === 'PENDING') {
    return {
      label: 'Requesting',
      title: 'Request Under Review',
      message: 'Your Jastiper upgrade request is waiting for admin review. We will unlock Jastiper tools once it is approved.',
      color: 'bg-yellow-300',
      icon: <Clock size={28} />,
    };
  }

  if (status === 'REJECTED') {
    return {
      label: 'Rejected',
      title: 'Request Needs Revision',
      message: 'Your previous request was rejected. Update your credential or social media link, then submit a new request.',
      color: 'bg-pink-300',
      icon: <XCircle size={28} />,
    };
  }

  return {
    label: 'Not Requested',
    title: 'Not Yet Requested',
    message: 'Complete the form to request access as a Jastiper.',
    color: 'bg-white',
    icon: <AlertCircle size={28} />,
  };
}

export default function JastiperUpgradePage() {
  const router = useRouter();
  const [isJastiper, setIsJastiper] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [upgradeRequest, setUpgradeRequest] = useState<UpgradeRequestResponse | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    credential: '',
    socialMediaUrl: '',
    confirmPassword: ''
  });

  useEffect(() => {
    let isMounted = true;

    async function loadUpgradeStatus() {
      try {
        const [profileResponse, requestResponse] = await Promise.all([
          apiFetch('/user/profile', { cache: 'no-store' }),
          apiFetch('/upgrade-request/me', { cache: 'no-store' }),
        ]);

        if (!isMounted) return;

        if (profileResponse.ok) {
          const profile = await profileResponse.json() as ProfileResponseDTO;
          setIsJastiper(profile.role?.toUpperCase().includes('JASTIPER') ?? false);
        }

        if (requestResponse.ok && requestResponse.status !== 204) {
          const request = await requestResponse.json() as UpgradeRequestResponse;
          setUpgradeRequest(request);
        }
      } catch {
        if (isMounted) {
          setUpgradeRequest(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingStatus(false);
        }
      }
    }

    loadUpgradeStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic client-side validation
    if (!formData.fullName || !formData.credential || !formData.socialMediaUrl) {
      setError('Full Name, Credential, and Social Media URL are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await apiFetch('/upgrade-request/submit', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          credential: formData.credential,
          socialMediaUrl: formData.socialMediaUrl
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit upgrade request.');
      }

      const request = await response.json().catch(() => null) as UpgradeRequestResponse | null;
      if (request) {
        setUpgradeRequest(request);
      }
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-black">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-400 border-4 border-black p-12 shadow-[16px_16px_0px_0px_#000]"
        >
          <div className="bg-white border-4 border-black w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_0px_#000]">
            <CheckCircle2 size={64} className="text-green-600" />
          </div>
          <h1 className="text-5xl font-black uppercase mb-4">Application Sent!</h1>
          <p className="text-xl font-bold mb-8">
            Your request to become a Jastiper has been sent for review.
          </p>
          <button 
            onClick={() => router.push('/dashboard/home')}
            className="neo-button bg-white text-2xl px-12 py-4 text-black"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const requestStatus = normalizeRequestStatus(upgradeRequest?.status);
  const status = statusCopy(requestStatus, isJastiper);
  const hasPendingRequest = requestStatus === 'PENDING';
  const shouldHideForm = isJastiper || requestStatus === 'ACCEPTED' || hasPendingRequest;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-black">
      <button
        onClick={() => router.push('/dashboard/account')}
        className="flex items-center gap-2 font-bold hover:underline decoration-4 mb-8 text-black"
      >
        <ArrowLeft size={20} /> Back to Account
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-main border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000]">
            <div className="bg-white border-2 border-black w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase mb-4 leading-tight">Jastiper Role</h2>
            
            <div className="p-4 border-2 border-black bg-white/50 mb-6 font-bold">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle size={18} />
                <span className="uppercase text-sm font-black tracking-tighter">Current Status</span>
              </div>
              <p className="text-xl italic">
                {isLoadingStatus ? 'Checking...' : status.label}
              </p>
            </div>

            <p className="font-bold text-sm">
              {status.message}
            </p>
          </div>
        </div>

        {/* Upgrade Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[12px_12px_0px_0px_#000]">
            <h1 className="text-4xl font-black uppercase mb-8 flex items-center gap-4">
              <IdCard size={40} /> Upgrade Request Form
            </h1>

            {!isLoadingStatus && (
              <div className={`mb-8 border-4 border-black p-5 font-black shadow-[6px_6px_0px_0px_#000] ${status.color}`}>
                <div className="mb-3 flex items-center gap-3 uppercase">
                  <span className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000]">
                    {status.icon}
                  </span>
                  <div>
                    <p className="text-xs text-gray-700">Upgrade Status</p>
                    <h2 className="text-2xl">{status.title}</h2>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{status.message}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-400 border-2 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000] text-black">
                {error}
              </div>
            )}

            {shouldHideForm ? (
              <div className="border-4 border-black bg-gray-50 p-6 font-bold shadow-[6px_6px_0px_0px_#000]">
                {isJastiper || requestStatus === 'ACCEPTED'
                  ? 'Your Jastiper tools are available from the dashboard navigation.'
                  : 'No further action is needed while your request is under review.'}
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black uppercase italic mb-2">Full Name (per ID)</label>
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="JOHN DOE"
                    className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black uppercase italic mb-2">Credential (URL or Base64 Description)</label>
                  <textarea 
                    name="credential"
                    required
                    value={formData.credential}
                    onChange={handleChange}
                    placeholder="Describe your qualifications or provide a link to your ID/Cert..."
                    rows={3}
                    className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-cyan-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black uppercase italic mb-2">Social Media URL</label>
                  <input 
                    type="url" 
                    name="socialMediaUrl"
                    required
                    value={formData.socialMediaUrl}
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourusername"
                    className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-purple-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all text-black"
                  />
                </div>

                <div className="pt-4 border-t-2 border-black border-dashed">
                  <label className="block text-sm font-black uppercase italic mb-2 flex items-center gap-2">
                    <Lock size={14} /> Confirm with Current Password
                  </label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-pink-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all text-black"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || isJastiper}
                className={`w-full neo-button flex items-center justify-center gap-3 bg-main text-2xl py-6 ${isSubmitting || isJastiper ? 'opacity-50 cursor-not-allowed' : ''} text-black`}
              >
                {isSubmitting ? 'Processing...' : (
                  <>
                    <Send size={24} strokeWidth={3} /> Submit Upgrade Request
                  </>
                )}
              </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
