'use client';

import { useState, useEffect, use } from 'react';
import {
  User,
  Mail,
  MapPin,
  ShieldCheck,
  Star,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { getPublicProfile } from '../../../settings/actions';
import { ProfileResponseDTO } from '@/types/api';
import { useRouter } from 'next/navigation';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const result = await getPublicProfile(username);
      if (result.success && result.data) {
        setProfile(result.data);
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [username]);

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
        <h2 className="text-2xl font-black uppercase">User not found</h2>
        <button onClick={() => router.back()} className="mt-4 neo-button bg-main px-6 py-2">Go Back</button>
      </div>
    );
  }

  const isJastiper = profile.role === 'JASTIPER';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-black">
      <button 
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 font-black uppercase hover:underline decoration-4"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white border-4 border-black p-12 shadow-[16px_16px_0px_0px_#000] text-center">
        <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="w-full h-full bg-main border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#000] overflow-hidden">
            {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
                <User size={96} strokeWidth={2.5} />
            )}
            </div>
            {isJastiper && (
                <div className="absolute -top-3 -right-3 bg-yellow-400 border-4 border-black p-2 rounded-full shadow-[4px_4px_0px_0px_#000]">
                    <Star size={24} fill="black" />
                </div>
            )}
        </div>
        
        <h2 className="text-5xl font-black uppercase mb-2 tracking-tighter">{profile.fullName || profile.username}</h2>
        <p className="text-xl font-bold opacity-60 mb-6 italic">@{profile.username}</p>
        
        <div className="flex justify-center gap-4 mb-10">
          <span className={`px-6 py-2 text-sm font-black uppercase border-4 border-black ${profile.role === 'ADMIN' ? 'bg-purple-400 text-white' : 'bg-black text-white'}`}>{profile.role}</span>      
          <span className={`px-6 py-2 text-sm font-black uppercase border-4 border-black bg-white`}>{profile.status}</span>
        </div>

        {profile.bio && (
            <div className="max-w-2xl mx-auto text-left font-bold border-4 border-black p-6 mb-10 bg-gray-50 shadow-[6px_6px_0px_0px_#000]">
                <p className="text-lg leading-relaxed">{profile.bio}</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left border-t-4 border-black pt-10">
          <div className="space-y-6">
            <ProfileItem icon={<Mail size={24} />} label="Email" value={profile.email} />
            {profile.location && <ProfileItem icon={<MapPin size={24} />} label="Based In" value={profile.location} />}
          </div>
          {isJastiper && (
            <div className="bg-yellow-50 border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000]">
                <div className="flex items-center gap-4 mb-2">
                    <CheckCircle2 size={32} className="text-green-600" />
                    <h4 className="text-2xl font-black uppercase">Verified Jastiper</h4>
                </div>
                <p className="font-bold text-3xl">{profile.successfulTransactions || 0} Successful Transactions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-main border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000]">{icon}</div>
      <div>
        <span className="block text-xs font-black uppercase text-gray-400">{label}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
    </div>
  );
}
