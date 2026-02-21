'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-black flex flex-col items-center justify-center p-6">
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 flex items-center gap-2 font-bold hover:underline decoration-4 text-black"
      >
        <ArrowLeft size={20} /> Back to Home
      </motion.button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black">
          <div className="flex items-center gap-3 mb-8 text-black">
            <div className="bg-main border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000] text-black">
              <LogIn size={32} />
            </div>
            <h1 className="text-4xl font-black uppercase text-black">Login</h1>
          </div>

          {error && (
            <div className="bg-red-400 border-2 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000] text-black">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-black mb-2 uppercase italic text-black">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-white border-4 border-black p-4 font-bold text-black focus:outline-none focus:bg-cyan-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-lg font-black mb-2 uppercase italic text-black">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white border-4 border-black p-4 font-bold text-black focus:outline-none focus:bg-pink-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded text-black"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neo-button w-full text-2xl py-4 flex items-center justify-center gap-3 mt-8 text-black"
            >
              {isLoading ? 'Logging in...' : 'Enter JSON'} <LogIn size={24} strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t-4 border-black text-center text-black">
            <p className="font-bold text-lg mb-4 text-black">New to JSON?</p>
            <button
              onClick={() => router.push('/register')}
              className="bg-cyan-300 border-4 border-black py-3 px-6 font-black uppercase flex items-center justify-center gap-2 mx-auto shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black"
            >
              <UserPlus size={20} /> Create an Account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
