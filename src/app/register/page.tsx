'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (typeof data === 'object') {
          const firstError = Object.values(data)[0] as string;
          throw new Error(firstError || 'Registration failed');
        }
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 py-12">
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => router.push('/login')}
        className="absolute top-8 left-8 flex items-center gap-2 font-bold hover:underline decoration-4"
      >
        <ArrowLeft size={20} /> Back to Login
      </motion.button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-cyan-300 border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000]">
              <UserPlus size={32} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Register</h1>
          </div>

          {error && (
            <div className="bg-red-400 border-2 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-lg font-black mb-1 uppercase italic">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-lg font-black mb-1 uppercase italic">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-cyan-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-lg font-black mb-1 uppercase italic">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-pink-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-black mb-1 uppercase italic">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-pink-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neo-button w-full text-2xl py-4 flex items-center justify-center gap-3 mt-8 bg-main"
            >
              {isLoading ? 'Creating Account...' : 'Join JSON'} <UserPlus size={24} strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-4 border-black text-center">
            <p className="font-bold mb-4">Already have an account?</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-purple-300 border-4 border-black py-3 px-6 font-black uppercase flex items-center justify-center gap-2 mx-auto shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              <LogIn size={20} /> Login Instead
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
