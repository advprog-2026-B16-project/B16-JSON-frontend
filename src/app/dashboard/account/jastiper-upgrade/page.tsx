'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowLeft,
  Star,
  CheckCircle2,
  Globe,
  Plane,
  IdCard,
  Phone,
  Send,
  AlertCircle
} from 'lucide-react';

export default function JastiperUpgradePage() {
  const router = useRouter();
  const [isJastiper, setIsJastiper] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    idNumber: '',
    frequentDestinations: '',
    experience: '',
    agreement: false
  });

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setIsJastiper(role === 'JASTIPER');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay for processing the upgrade application
    setTimeout(() => {
      localStorage.setItem('user_role', 'JASTIPER');
      setIsJastiper(true);
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Trigger event for layout to update instantly
      window.dispatchEvent(new Event('roleUpdated'));
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
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
            Your request to become a Jastiper has been approved. You now have access to the Catalogue and Orders menu.
          </p>
          <button 
            onClick={() => router.push('/dashboard/home')}
            className="neo-button bg-white text-2xl px-12 py-4"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button
        onClick={() => router.push('/dashboard/account')}
        className="flex items-center gap-2 font-bold hover:underline decoration-4 mb-8"
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
                {isJastiper ? "Role Active (Pro)" : "Not Yet Upgraded"}
              </p>
            </div>

            <p className="font-bold text-sm">
              Complete the form to request your upgrade. This will allow you to create your own catalogue and fulfill orders.
            </p>
          </div>

          <div className="bg-cyan-100 border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000]">
            <h3 className="text-xl font-black uppercase mb-4 underline decoration-4 underline-offset-4">Why upgrade?</h3>
            <ul className="space-y-4 font-bold text-sm">
              <li className="flex gap-2"><Star size={18} className="shrink-0" fill="black" /> Get paid for your travels</li>
              <li className="flex gap-2"><Globe size={18} className="shrink-0" /> Global visibility for your offers</li>
              <li className="flex gap-2"><Plane size={18} className="shrink-0" /> Turn your trips into business</li>
            </ul>
          </div>
        </div>

        {/* Upgrade Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-black p-8 md:p-10 shadow-[12px_12px_0px_0px_#000]">
            <h1 className="text-4xl font-black uppercase mb-8 flex items-center gap-4">
              <IdCard size={40} /> Upgrade Request Form
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black uppercase italic mb-2">Full Name (per ID)</label>
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="JOHN DOE"
                    className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black uppercase italic mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel" 
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+62 812..."
                      className="w-full bg-white border-4 border-black p-4 pl-12 font-bold focus:outline-none focus:bg-cyan-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black uppercase italic mb-2">National ID / Passport Number</label>
                <input 
                  type="text" 
                  name="idNumber"
                  required
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="32710100..."
                  className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-pink-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase italic mb-2">Frequent Destinations</label>
                <textarea 
                  name="frequentDestinations"
                  required
                  value={formData.frequentDestinations}
                  onChange={handleChange}
                  placeholder="Tokyo, Singapore, Bangkok, etc."
                  rows={2}
                  className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-purple-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase italic mb-2">Brief Experience / Bio</label>
                <textarea 
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="I travel to Japan twice a year and often help friends buy snacks..."
                  rows={3}
                  className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-green-50 shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-black">
                <input 
                  type="checkbox" 
                  name="agreement"
                  required
                  checked={formData.agreement}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 border-2 border-black rounded-none appearance-none checked:bg-main cursor-pointer"
                />
                <label className="text-sm font-bold">
                  I certify that the information provided is accurate and I agree to the <span className="underline cursor-pointer">Jastiper Terms of Service</span>.
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || isJastiper}
                className={`w-full neo-button flex items-center justify-center gap-3 bg-main text-2xl py-6 ${isSubmitting || isJastiper ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Processing...' : (
                  <>
                    <Send size={24} strokeWidth={3} /> Submit Upgrade Request
                  </>
                )}
              </button>

              {isJastiper && !isSubmitted && (
                <p className="text-center font-black uppercase text-green-600 text-sm">
                  You already have the Jastiper role active.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
