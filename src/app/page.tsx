'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Globe,
  Zap,
  Menu,
  X
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Mock authentication check
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);

  const handleExplore = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-main selection:text-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background border-b-4 border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-3xl font-black tracking-tighter flex items-center gap-2"
          >
            <div className="bg-main border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000]">
              JSON
            </div>
            <span className="hidden sm:inline">Jastip Online Nasional</span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 font-bold">
            <a href="#" className="hover:underline decoration-4 underline-offset-4">How it works</a>
            <a href="#" className="hover:underline decoration-4 underline-offset-4">Pricing</a>
            <a href="#" className="hover:underline decoration-4 underline-offset-4">About</a>
            <button
              onClick={() => router.push('/login')}
              className="neo-button text-sm"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 border-2 border-black bg-main"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-main border-b-4 border-black pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-black">
              <a href="#" onClick={() => setIsMenuOpen(false)}>How it works</a>
              <a href="#" onClick={() => setIsMenuOpen(false)}>Pricing</a>
              <a href="#" onClick={() => setIsMenuOpen(false)}>About</a>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push('/login');
                }}
                className="neo-button w-full mt-4"
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="bg-cyan-300 border-2 border-black px-4 py-1 font-black text-sm uppercase mb-6 inline-block shadow-[4px_4px_0px_0px_#000]">
              #1 Trusted Jastip Platform
            </span>
            <h1 className="text-6xl md:text-8xl font-black leading-none mb-8">
              Beli Apa Saja <br />
              <span className="text-main italic">Dimana Saja.</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium mb-10 max-w-xl border-l-8 border-black pl-6 py-2">
              Titip belanja dari luar negeri atau antar kota jadi lebih mudah, aman, dan transparan. JSON menghubungkan Anda dengan traveler handal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExplore}
                className="neo-button text-2xl py-6 px-10 flex items-center justify-center gap-3"
              >
                Explore Now <ArrowRight size={28} strokeWidth={3} />
              </motion.button>
              <button className="border-4 border-black bg-white py-6 px-10 text-2xl font-black shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-3">
                How It Works
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-pink-400 border-4 border-black rounded-full z-0 animate-bounce" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-main border-4 border-black z-0 rotate-12" />

            <div className="relative z-10 bg-white border-4 border-black p-4 shadow-[12px_12px_0px_0px_#000]">
              <div className="bg-gray-100 border-2 border-black aspect-square flex items-center justify-center overflow-hidden">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 0.95, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <ShoppingBag size={150} strokeWidth={1} className="text-black/20" />
                </motion.div>
                <div className="absolute inset-0 grid grid-cols-2 gap-4 p-6">
                  <div className="bg-pink-300 border-2 border-black p-4 flex flex-col justify-end neo-box h-32">
                    <span className="font-black">Global</span>
                  </div>
                  <div className="bg-cyan-300 border-2 border-black p-4 flex flex-col justify-end neo-box h-32 mt-8">
                    <span className="font-black">Safe</span>
                  </div>
                  <div className="bg-main border-2 border-black p-4 flex flex-col justify-end neo-box h-32">
                    <span className="font-black">Fast</span>
                  </div>
                  <div className="bg-purple-300 border-2 border-black p-4 flex flex-col justify-end neo-box h-32 mt-8">
                    <span className="font-black">Direct</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-t-4 border-black px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-5xl font-black mb-4">Kenapa Memilih JSON?</h2>
            <p className="text-xl font-bold">Solusi jastip paling sat-set dan terpercaya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck size={40} />}
              title="Aman & Terpercaya"
              description="Rekber sistem menjamin dana Anda aman hingga barang sampai ke tangan Anda."
              color="bg-green-400"
            />
            <FeatureCard
              icon={<Globe size={40} />}
              title="Jangkauan Luas"
              description="Titip barang dari mana saja, mulai dari Tokyo, Paris, hingga pelosok Nusantara."
              color="bg-pink-400"
            />
            <FeatureCard
              icon={<Zap size={40} />}
              title="Proses Cepat"
              description="Dapatkan penawaran dari traveler dalam hitungan menit setelah request dipublish."
              color="bg-cyan-400"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white px-6 py-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="bg-main text-black border-2 border-white p-1">JSON</div>
            <span>Jastip Online Nasional</span>
          </div>
          <div className="flex gap-8 font-bold">
            <a href="#" className="hover:text-main">Twitter</a>
            <a href="#" className="hover:text-main">Instagram</a>
            <a href="#" className="hover:text-main">Terms</a>
          </div>
          <p className="font-bold opacity-60">© 2026 JSON. Built with ❤️ for Travelers.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`p-8 border-4 border-black ${color} shadow-[8px_8px_0px_0px_#000]`}
    >
      <div className="bg-white border-2 border-black w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000]">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase">{title}</h3>
      <p className="font-bold leading-relaxed">{description}</p>
    </motion.div>
  );
}
