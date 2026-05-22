'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Menu,
  PackageCheck,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-react';

const heroImage =
  'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=1800&q=85';

const promiseCards = [
  {
    icon: <Plane size={30} />,
    label: 'From Anywhere',
    copy: 'Shop beyond borders with trusted travelers bringing the good stuff home.',
    color: 'bg-cyan-300',
  },
  {
    icon: <ShieldCheck size={30} />,
    label: 'Pay With Confidence',
    copy: 'Your money stays protected while your order moves from request to delivery.',
    color: 'bg-emerald-300',
  },
  {
    icon: <PackageCheck size={30} />,
    label: 'Know What Happens',
    copy: 'Follow the journey clearly, then close the deal only when it feels right.',
    color: 'bg-yellow-300',
  },
];

const storySteps = [
  'Find a deal worth bringing home',
  'Pay securely from your JSON wallet',
  'Let a verified Jastiper handle the trip',
  'Receive it, review it, and confirm',
];

const highlights = [
  {
    title: 'For shoppers who want more',
    copy: 'Get access to items that are not always easy to find locally, without chasing strangers across chat groups.',
    icon: <ShoppingBag size={28} />,
  },
  {
    title: 'For Jastipers ready to sell',
    copy: 'Turn travel plans into a clean storefront where people can discover, order, and pay with less back-and-forth.',
    icon: <Store size={28} />,
  },
  {
    title: 'For every deal that needs trust',
    copy: 'JSON keeps the buying journey organized, trackable, and calmer from checkout to confirmation.',
    icon: <CreditCard size={28} />,
  },
];

export default function HomeClient({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const goPrimary = () => router.push(isAuthenticated ? '/dashboard/home' : '/login');
  const goMarketplace = () => router.push(isAuthenticated ? '/dashboard/marketplace' : '/login');

  return (
    <div className="min-h-screen bg-white text-black selection:bg-main selection:text-black">
      <nav className="fixed inset-x-0 top-0 z-50 border-b-4 border-black bg-white/95 px-5 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <motion.button
            initial={{ x: -18, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-3 text-left font-black text-black"
          >
            <span className="border-2 border-black bg-main px-2 py-1 text-2xl shadow-[3px_3px_0px_0px_#000]">JSON</span>
            <span className="hidden text-lg uppercase tracking-wide sm:inline">Jastip Online Nasional</span>
          </motion.button>

          <div className="hidden items-center gap-6 text-sm font-black uppercase md:flex">
            <button onClick={goMarketplace} className="hover:underline decoration-4 underline-offset-4">
              Marketplace
            </button>
            <button onClick={goPrimary} className="neo-button text-sm">
              {isAuthenticated ? 'Dashboard' : 'Start Now'}
            </button>
          </div>

          <button
            className="border-2 border-black bg-main p-2 md:hidden"
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
            <div className="flex flex-col gap-5 text-2xl font-black uppercase">
              <button onClick={goMarketplace} className="text-left">Marketplace</button>
              <button onClick={goPrimary} className="border-4 border-black bg-white px-5 py-4 text-left shadow-[5px_5px_0px_0px_#000]">
                {isAuthenticated ? 'Dashboard' : 'Start Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className="relative min-h-[92vh] overflow-hidden border-b-4 border-black bg-cover bg-center pt-28"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.9) 42%, rgba(255,255,255,0.3) 100%), url(${heroImage})` }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-[linear-gradient(0deg,#ffffff_0%,rgba(255,255,255,0)_100%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 pb-16 pt-12 md:px-8 lg:pt-20">
          <motion.div
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl"
          >
            <div className="mb-7 inline-flex items-center gap-2 border-4 border-black bg-cyan-300 px-4 py-2 text-sm font-black uppercase shadow-[5px_5px_0px_0px_#000]">
              <Sparkles size={18} /> Trusted jastip marketplace
            </div>
            <h1 className="max-w-5xl text-6xl font-black uppercase leading-[0.9] text-black md:text-8xl lg:text-9xl">
              Bring home what you love.
            </h1>
            <p className="mt-8 max-w-2xl border-l-8 border-black bg-white/90 px-5 py-4 text-xl font-black leading-snug text-black shadow-[6px_6px_0px_0px_#000] md:text-2xl">
              JSON connects shoppers with verified Jastipers, so overseas finds, limited drops, and hard-to-get items feel closer, safer, and easier to buy.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={goMarketplace}
                className="neo-button flex items-center justify-center gap-3 px-8 py-5 text-lg md:text-xl"
              >
                Explore Marketplace <ArrowRight size={24} strokeWidth={3} />
              </motion.button>
              <button
                onClick={goPrimary}
                className="flex items-center justify-center gap-3 border-4 border-black bg-white px-8 py-5 text-lg font-black uppercase shadow-[6px_6px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_#000] md:text-xl"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Create Your Account'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3"
          >
            {promiseCards.map((item) => (
              <div key={item.label} className={`border-4 border-black ${item.color} p-5 shadow-[7px_7px_0px_0px_#000]`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000]">
                  {item.icon}
                </div>
                <p className="mb-2 text-lg font-black uppercase">{item.label}</p>
                <p className="text-sm font-bold leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      <section className="border-b-4 border-black bg-white px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-4 inline-block border-4 border-black bg-pink-300 px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000]">
              Built for the deal
            </p>
            <h2 className="text-5xl font-black uppercase leading-none md:text-7xl">
              Less worry. More wishlist.
            </h2>
            <p className="mt-6 max-w-xl text-xl font-bold leading-relaxed text-gray-800">
              Stop guessing who to trust, where your money went, or what happens next. JSON gives every jastip order a cleaner path from discovery to delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {highlights.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ x: -4, y: -4 }}
                className="grid grid-cols-[auto_1fr] gap-5 border-4 border-black bg-gray-50 p-5 shadow-[8px_8px_0px_0px_#000]"
              >
                <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-main shadow-[3px_3px_0px_0px_#000]">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase">{item.title}</h3>
                  <p className="mt-2 font-bold leading-relaxed text-gray-700">{item.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-main px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div className="border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_#000]">
            <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-4">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">A better jastip rhythm</p>
                <h2 className="text-3xl font-black uppercase md:text-4xl">From want to delivered</h2>
              </div>
              <BadgeCheck size={40} className="text-green-600" />
            </div>
            <div className="space-y-4">
              {storySteps.map((step, index) => (
                <div key={step} className="flex items-center gap-4 border-2 border-black bg-white p-4 font-black uppercase shadow-[4px_4px_0px_0px_#000]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-cyan-200">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-5xl font-black uppercase leading-none md:text-7xl">
              Your next find is probably already waiting.
            </h2>
            <p className="mt-6 text-xl font-bold leading-relaxed">
              Whether it is a travel-exclusive snack, a fashion drop, a collectible, or a practical item from another city, JSON helps turn &quot;can someone bring this?&quot; into a real, trackable order.
            </p>
            <button
              onClick={goMarketplace}
              className="mt-8 flex items-center gap-3 border-4 border-black bg-black px-7 py-5 text-lg font-black uppercase text-white shadow-[7px_7px_0px_0px_#fff] transition-all hover:bg-white hover:text-black"
            >
              Start Browsing <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t-4 border-black bg-black px-6 py-10 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3 text-2xl font-black tracking-tight">
            <div className="border-2 border-white bg-main px-2 py-1 text-black">JSON</div>
            <span>Jastip Online Nasional</span>
          </div>
          <button onClick={goPrimary} className="border-2 border-white px-5 py-3 font-black uppercase hover:bg-white hover:text-black">
            {isAuthenticated ? 'Dashboard' : 'Start Now'}
          </button>
        </div>
      </footer>
    </div>
  );
}
