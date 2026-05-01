'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Star,
  Settings,
  CreditCard,
  History,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { getProfile } from '../settings/actions';
import { ProfileResponseDTO } from '@/types/api';

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const result = await getProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={64} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black uppercase">Failed to load profile</h2>
        <button onClick={() => window.location.reload()} className="mt-4 neo-button bg-main px-6 py-2">Retry</button>
      </div>
    );
  }

  const isJastiper = profile.role === 'JASTIPER';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Profile Card */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full bg-main border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#000] overflow-hidden">
                {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                    <User size={64} strokeWidth={2.5} />
                )}
                </div>
                {isJastiper && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 border-2 border-black p-1 rounded-full shadow-[2px_2px_0px_0px_#000]">
                        <Star size={16} fill="black" />
                    </div>
                )}
            </div>
            
            <h2 className="text-3xl font-black uppercase mb-2">{profile.fullName || profile.username}</h2>
            <p className="text-sm font-bold opacity-60 mb-4 italic">@{profile.username}</p>
            
            <div className="flex justify-center gap-2 mb-6">
              <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${profile.role === 'ADMIN' ? 'bg-purple-400 text-white' : 'bg-black text-white'}`}>{profile.role}</span>      
              <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${profile.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}`}>{profile.status}</span>
            </div>

            {profile.bio && (
                <p className="text-left font-bold border-t-4 border-black pt-4 mb-4 text-sm opacity-80">{profile.bio}</p>
            )}

            <div className="space-y-4 text-left border-t-4 border-black pt-6 mt-6">
              <ProfileItem icon={<Mail size={18} />} label="Email" value={profile.email} />
              {profile.location && <ProfileItem icon={<MapPin size={18} />} label="Location" value={profile.location} />}
              {isJastiper && <ProfileItem icon={<CheckCircle2 size={18} />} label="Success Rate" value={`${profile.successfulTransactions || 0} Transactions`} />}
            </div>

            <button
              onClick={() => router.push('/dashboard/settings')}
              className="w-full mt-8 flex items-center justify-center gap-2 border-4 border-black py-3 font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black hover:text-white"
            >
              <Settings size={20} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Account Sections */}
        <div className="flex-1 space-y-8">
          {/* Role Status / Upgrade Card */}
          <div className={`border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] flex flex-col md:flex-row justify-between items-center gap-6 ${isJastiper ? 'bg-yellow-50 border-yellow-500' : 'bg-white'}`}>
            <div className="flex items-center gap-6">
              <div className={`${isJastiper ? 'bg-yellow-400' : 'bg-main'} border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000]`}>
                <ShieldCheck size={40} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase mb-1">
                  {isJastiper ? "You're a Pro Jastiper" : "Become a Jastiper"}
                </h3>
                <p className="font-bold text-lg opacity-80 max-w-md">
                  {isJastiper
                    ? "Manage your listings in the Catalogue and track your customer orders."
                    : "Upgrade your account to start offering your shopping services and earn extra income."}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (isJastiper) {
                  router.push('/dashboard/catalogue');
                } else {
                  router.push('/dashboard/account/jastiper-upgrade');
                }
              }}
              className={`whitespace-nowrap neo-button flex items-center gap-2 text-xl px-8 py-5 ${isJastiper ? 'bg-yellow-400' : 'bg-main'} text-black`}
            >
              {isJastiper ? "View Pro Status" : (
                <>
                  <Star size={24} fill="black" /> Get Started <ArrowRight size={24} strokeWidth={3} />
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div onClick={() => router.push('/dashboard/wallet')} className="cursor-pointer h-full">
              <DashboardActionCard
                icon={<CreditCard size={32} />}
                title="Wallet & Payments"
                description="Manage your balance, bank accounts, and payment methods."
                color="bg-cyan-100"
              />
            </div>
            <DashboardActionCard
              icon={<History size={32} />}
              title="Activity History"
              description="Review all your past requests, offers, and transactions."
              color="bg-pink-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="opacity-60">{icon}</div>
      <div>
        <span className="block text-xs font-black uppercase text-gray-400">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
    </div>
  );
}

function DashboardActionCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className={`h-full border-4 border-black p-8 ${color} shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#000] transition-all`}>
      <div className="bg-white border-2 border-black w-14 h-14 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase mb-2">{title}</h3>
      <p className="font-bold opacity-70 leading-snug">{description}</p>
      <div className="mt-6 flex items-center gap-2 font-black uppercase text-sm group">
        Manage <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
