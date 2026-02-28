'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircle, 
  Bell, 
  Lock, 
  ChevronRight,
  Globe,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function SettingsPage() {
  const handleResetRole = () => {
    localStorage.removeItem('user_role');
    window.dispatchEvent(new Event('roleUpdated'));
    alert('Role reset to Standard User. You can now test the upgrade flow.');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-6 mb-12">
        <div className="bg-main border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000]">
          <Settings size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-6xl font-black uppercase tracking-tighter">Settings</h1>
      </div>

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
              className="w-full flex items-center gap-4 p-4 font-black uppercase text-sm border-4 border-black bg-pink-100 shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Reset Account Role
            </button>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-2 space-y-10">
          <SettingsGroup 
            title="Profile Details" 
            items={[
              { label: 'Display Name', value: 'John Doe' },
              { label: 'Username', value: '@johndoe' },
              { label: 'Personal Bio', value: 'Avid traveler and tea lover.' },
              { label: 'Default Currency', value: 'IDR' },
            ]} 
          />
          
          <SettingsGroup 
            title="Notification Hub" 
            color="bg-cyan-100"
            items={[
              { label: 'Marketplace Alerts', value: 'Enabled' },
              { label: 'Transaction Updates', value: 'Direct Message' },
              { label: 'Email Reports', value: 'Weekly' },
            ]} 
          />

          <div className="pt-8 border-t-4 border-black flex flex-col sm:flex-row gap-6">
            <button className="neo-button bg-black text-white px-8 py-4 text-xl">
              Save All Changes
            </button>
            <button className="border-4 border-black px-8 py-4 font-black uppercase hover:bg-red-400 transition-all shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 p-5 font-black uppercase text-lg border-4 border-black transition-all ${active ? 'bg-main translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000]'}`}>
      {icon}
      {label}
    </button>
  );
}

function SettingsGroup({ title, items, color = 'bg-white' }: { title: string, items: { label: string, value: string }[], color?: string }) {
  return (
    <div className={`border-4 border-black ${color} shadow-[10px_10px_0px_0px_#000] p-8`}>
      <h3 className="text-3xl font-black uppercase mb-8 underline decoration-8 decoration-black/10 underline-offset-4">{title}</h3>
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black/10 pb-4 gap-2">
            <div>
              <p className="text-xs font-black uppercase text-gray-500 mb-1">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
            <button className="self-start sm:self-center font-black uppercase text-sm border-2 border-black px-4 py-2 bg-white shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
              Update
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
