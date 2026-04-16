'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Bell, 
  Lock, 
  Globe,
  Settings,
  HelpCircle,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';
import { updateProfile, getProfile } from './actions';
import { ProfileResponseDTO } from '@/types/api';

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const result = await getProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to load profile' });
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, []);

  const handleResetRole = () => {
    setMessage({ type: 'error', text: 'Role reset feature disabled for security compliance.' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.success && result.data) {
      setProfile(result.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Update failed' });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-black">
        <div className="flex items-center gap-6 mb-12 animate-pulse">
          <div className="bg-gray-200 border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000] w-20 h-20"></div>
          <div className="h-16 bg-gray-200 border-4 border-black w-64"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 border-4 border-black w-full shadow-[6px_6px_0px_0px_#000]"></div>
            ))}
          </div>
          <div className="lg:col-span-2 space-y-10">
            <div className="h-64 bg-gray-50 border-4 border-black w-full shadow-[10px_10px_0px_0px_#000]"></div>
            <div className="h-48 bg-gray-50 border-4 border-black w-full shadow-[10px_10px_0px_0px_#000]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black">
      <div className="flex items-center gap-6 mb-12">
        <div className="bg-main border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000]">
          <Settings size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-6xl font-black uppercase tracking-tighter">Settings</h1>
      </div>

      {message && (
        <div className={`border-4 border-black p-6 mb-12 flex items-center gap-4 font-black uppercase shadow-[8px_8px_0px_0px_#000] ${message.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`}>
          {message.type === 'success' ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
          <p className="text-xl">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <SidebarLink active icon={<UserCircle size={20} />} label="General Profile" />
          <SidebarLink icon={<Bell size={20} />} label="Notification Rules" />
          <SidebarLink icon={<Lock size={20} />} label="Security & Privacy" />
          <SidebarLink icon={<Globe size={20} />} label="Region & Language" />
          <SidebarLink icon={<HelpCircle size={20} />} label="Help & Feedback" />
          
          <div className="pt-4 mt-8 border-t-2 border-black border-dashed">
            <p className="text-xs font-black uppercase text-gray-400 mb-2">Development Tools</p>
            <button 
              onClick={handleResetRole}
              className="w-full flex items-center gap-4 p-4 font-black uppercase text-sm border-4 border-black bg-pink-100 shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-black"
            >
              Reset Account Role
            </button>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="border-4 border-black bg-white shadow-[10px_10px_0px_0px_#000] p-8 text-black">
              <h3 className="text-3xl font-black uppercase mb-8 underline decoration-8 decoration-black/10 underline-offset-4 flex items-center gap-3">
                <User size={28} /> Profile Details
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-1">Full Name</label>
                  <input 
                    name="fullName"
                    defaultValue={profile?.fullName}
                    className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">Username</label>
                    <div className="w-full bg-gray-100 border-4 border-black p-4 font-bold opacity-70">
                      @{profile?.username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-500 mb-1">Email Address</label>
                    <div className="w-full bg-gray-100 border-4 border-black p-4 font-bold opacity-70">
                      {profile?.email}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-1">Personal Bio</label>
                  <textarea 
                    name="bio"
                    defaultValue={profile?.bio}
                    rows={3}
                    className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-cyan-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      name="location"
                      defaultValue={profile?.location}
                      className="w-full bg-white border-4 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-pink-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t-4 border-black flex flex-col sm:flex-row gap-6">
              <button 
                type="submit" 
                disabled={isSaving}
                className="neo-button bg-black text-white px-8 py-4 text-xl flex items-center gap-3 justify-center min-w-[200px]"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save />} 
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
              <button 
                type="button"
                onClick={() => window.location.reload()}
                className="border-4 border-black px-8 py-4 font-black uppercase hover:bg-red-400 transition-all shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black"
              >
                Discard Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 p-5 font-black uppercase text-lg border-4 border-black transition-all ${active ? 'bg-main translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000]'} text-black`}>
      {icon}
      {label}
    </button>
  );
}
