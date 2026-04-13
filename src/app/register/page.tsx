'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';

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

  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // CLIENT-SIDE VALIDATION
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long, contain at least one digit, one lowercase letter, one uppercase letter, one special character (@#$%^&+=!), and have no whitespace.');
      setIsLoading(false);
      return;
    }

    try {
      // Postman confirmed: username, email, password, confirmPassword are required
      const response = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { detail: 'Could not parse response from server' };
      }

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Registration Error Payload:', data);
        }
        const backendMessage = data.detail || data.message || data.error || (typeof data === 'object' ? Object.values(data)[0] : null);
        throw new Error(backendMessage || `Registration failed with status ${response.status}`);
      }

      router.push('/login?registered=true');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-black flex flex-col items-center justify-center p-6 py-12">
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => router.push('/login')}
        className="absolute top-8 left-8 flex items-center gap-2 font-bold hover:underline decoration-4 text-black"
      >
        <ArrowLeft size={20} /> Back to Login
      </motion.button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black">
          <div className="flex items-center gap-3 mb-8 text-black">
            <div className="bg-cyan-300 border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000] text-black">
              <UserPlus size={32} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-black">Register</h1>
          </div>

          {error && (
            <div className="bg-red-400 border-2 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000] text-black" id="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-lg font-black mb-1 uppercase italic text-black">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full bg-white border-4 border-black p-4 font-bold text-black focus:outline-none focus:bg-yellow-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-lg font-black mb-1 uppercase italic text-black">Email Address</label>
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
              <label htmlFor="password" className="block text-lg font-black mb-1 uppercase italic text-black">Password</label>
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-black"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
              <PasswordStrengthMeter password={formData.password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-black mb-1 uppercase italic text-black">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white border-4 border-black p-4 font-bold text-black focus:outline-none focus:bg-pink-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neo-button w-full text-2xl py-4 flex items-center justify-center gap-3 mt-8 bg-main text-black"
            >
              {isLoading ? 'Creating Account...' : 'Join JSON'} <UserPlus size={24} strokeWidth={3} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-4 border-black text-center text-black">
            <p className="font-bold mb-4 text-black">Already have an account?</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-purple-300 border-4 border-black py-3 px-6 font-black uppercase flex items-center justify-center gap-2 mx-auto shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-black"
            >
              <LogIn size={20} /> Login Instead
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
