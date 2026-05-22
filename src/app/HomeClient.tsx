'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Menu,
  PackageSearch,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  X,
} from 'lucide-react';

const features = [
  {
    icon: <PackageSearch size={34} />,
    title: 'Marketplace katalog',
    description: 'Titipers bisa cari produk berdasarkan nama barang atau Jastiper penyedia.',
    color: 'bg-cyan-300',
  },
  {
    icon: <CreditCard size={34} />,
    title: 'Total Transaction',
    description: 'Pembayaran ditahan dulu dan baru dirilis saat order dikonfirmasi selesai.',
    color: 'bg-emerald-300',
  },
  {
    icon: <Truck size={34} />,
    title: 'Tracking order',
    description: 'Pantau status Paid, Purchased, On Delivery, Delivered, sampai Done.',
    color: 'bg-purple-300',
  },
  {
    icon: <Store size={34} />,
    title: 'Katalog Jastiper',
    description: 'Jastiper terverifikasi bisa kelola produk, stok, harga, dan tanggal pembelian.',
    color: 'bg-yellow-300',
  },
  {
    icon: <ShieldCheck size={34} />,
    title: 'Refund review',
    description: 'Refund bisa diajukan saat barang Delivered sebelum order dikonfirmasi Done.',
    color: 'bg-pink-300',
  },
  {
    icon: <BadgeCheck size={34} />,
    title: 'Admin verification',
    description: 'Admin memvalidasi upgrade Jastiper dan memonitor pengguna serta transaksi.',
    color: 'bg-green-300',
  },
];

export default function HomeClient({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goPrimary = () => router.push(isAuthenticated ? '/dashboard/home' : '/login');
  const goMarketplace = () => router.push(isAuthenticated ? '/dashboard/marketplace' : '/login');

  return (
    <div className="min-h-screen bg-white text-black selection:bg-main selection:text-black">
      <nav className="sticky top-0 z-50 border-b-4 border-black bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-black">
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-left text-3xl font-black tracking-tighter text-black"
          >
            <span className="border-2 border-black bg-main p-1 text-black shadow-[2px_2px_0px_0px_#000]">JSON</span>
            <span className="hidden sm:inline">Jastip Online Nasional</span>
          </motion.button>

          <div className="hidden items-center gap-4 font-bold text-black md:flex">
            <button onClick={goMarketplace} className="hover:underline decoration-4 underline-offset-4">Marketplace</button>
            <button onClick={goPrimary} className="neo-button text-sm text-black">
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </button>
          </div>

          <button
            className="border-2 border-black bg-main p-2 text-black md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 z-40 border-b-4 border-black bg-main px-6 pb-8 pt-24 md:hidden"
          >
            <div className="flex flex-col gap-4 text-2xl font-black text-black">
              <button onClick={goMarketplace} className="text-left">Marketplace</button>
              <button onClick={goPrimary} className="neo-button mt-2 w-full text-black">
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 text-black lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }}>
          <span className="mb-6 inline-block border-2 border-black bg-cyan-300 px-4 py-1 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_#000]">
            Marketplace jastip
          </span>
          <h1 className="mb-8 text-6xl font-black leading-none text-black md:text-8xl">
            Titip barang,
            <br />
            <span className="text-main italic">bayar aman.</span>
          </h1>
          <p className="mb-10 max-w-2xl border-l-8 border-black bg-yellow-50 py-2 pl-6 text-xl font-bold text-black md:text-2xl">
            Cari barang dari katalog Jastiper, bayar lewat wallet, pantau order, lalu konfirmasi Done saat barang diterima.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={goMarketplace}
              className="neo-button flex items-center justify-center gap-3 px-10 py-6 text-2xl text-black"
            >
              Browse Marketplace <ArrowRight size={28} strokeWidth={3} />
            </motion.button>
            <button
              onClick={goPrimary}
              className="flex items-center justify-center gap-3 border-4 border-black bg-white px-10 py-6 text-2xl font-black text-black shadow-[6px_6px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000]"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Login'}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="border-4 border-black bg-white p-5 text-black shadow-[12px_12px_0px_0px_#000]"
        >
          <div className="border-2 border-black bg-gray-50 p-6">
            <div className="mb-6 flex items-center gap-4 border-b-4 border-black pb-4">
              <div className="border-2 border-black bg-main p-3">
                <ShoppingBag size={34} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Live Flow</p>
                <h2 className="text-3xl font-black uppercase">Order</h2>
              </div>
            </div>
            <div className="space-y-3">
              {['Checkout', 'Pay wallet', 'Jastiper ships', 'Delivered', 'Confirm Done'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 border-2 border-black bg-white p-3 font-black shadow-[3px_3px_0px_0px_#000]">
                  <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-cyan-200 text-sm">{index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-t-4 border-black bg-white px-6 py-20 text-black">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center text-black">
            <h2 className="mb-4 text-5xl font-black uppercase">Yang Sudah Bisa Dipakai</h2>
            <p className="text-xl font-bold">Fitur inti JSON saat ini, tanpa janji yang belum ada di produk.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-black md:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-4 border-black bg-black px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-white md:flex-row">
          <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white">
            <div className="border-2 border-white bg-main p-1 text-black">JSON</div>
            <span>Jastip Online Nasional</span>
          </div>
          <button onClick={goPrimary} className="border-2 border-white px-5 py-3 font-black uppercase hover:bg-white hover:text-black">
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </button>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`border-4 border-black ${color} p-6 text-black shadow-[8px_8px_0px_0px_#000]`}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_#000]">
        {icon}
      </div>
      <h3 className="mb-3 text-2xl font-black uppercase text-black">{title}</h3>
      <p className="font-bold leading-relaxed text-black">{description}</p>
    </motion.div>
  );
}
