'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  User, 
  ShoppingBag, 
  Repeat, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJastiper, setIsJastiper] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    
    if (!token) {
      router.push('/login');
    } else {
      setIsJastiper(role === 'JASTIPER');
      setIsLoading(false);
    }

    // Listen for storage changes to update role instantly if changed in settings
    const handleStorageChange = () => {
      const updatedRole = localStorage.getItem('user_role');
      setIsJastiper(updatedRole === 'JASTIPER');
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener('roleUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roleUpdated', handleStorageChange);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  const navItems = [
    { label: 'Home', icon: <Home size={20} />, href: '/dashboard/home' },
    { label: 'Marketplace', icon: <ShoppingBag size={20} />, href: '/dashboard/marketplace' },
    { label: 'Transactions', icon: <Repeat size={20} />, href: '/dashboard/transactions' },
    { label: 'Account', icon: <User size={20} />, href: '/dashboard/account' },
    { label: 'Settings', icon: <Settings size={20} />, href: '/dashboard/settings' },
  ];

  const jastiperItems = [
    { label: 'Catalogue', icon: <BookOpen size={20} />, href: '/dashboard/catalogue' },
    { label: 'Orders', icon: <ClipboardList size={20} />, href: '/dashboard/orders' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-4xl font-black animate-bounce">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-main selection:text-black">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b-4 border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => router.push('/')}
            className="text-3xl font-black tracking-tighter flex items-center gap-2 cursor-pointer"
          >
            <div className="bg-main border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000]">
              JSON
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3 font-bold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 border-2 border-transparent hover:border-black hover:bg-main transition-all ${pathname === item.href ? 'bg-main border-black shadow-[2px_2px_0px_0px_#000]' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            
            {isJastiper && (
              <>
                <div className="w-px h-8 bg-black/20 mx-1" />
                {jastiperItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 border-2 border-black bg-yellow-100 hover:bg-yellow-200 transition-all ${pathname === item.href ? 'bg-yellow-400 shadow-[2px_2px_0px_0px_#000]' : 'shadow-[2px_2px_0px_0px_#000]'}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
            
            <div className="w-px h-8 bg-black/20 mx-1" />
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-pink-300 hover:bg-pink-400 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <LogOut size={20} />
              <span>Logout</span>
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
            className="fixed inset-0 z-40 bg-white border-b-4 border-black pt-24 px-6 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-4 text-xl font-black pb-12">
              <p className="text-xs uppercase text-gray-500 mb-[-10px]">General</p>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 border-4 border-black ${pathname === item.href ? 'bg-main shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_#000]'}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}

              {isJastiper && (
                <>
                  <p className="text-xs uppercase text-yellow-600 mt-4 mb-[-10px] flex items-center gap-2">
                    <ShieldCheck size={16} /> Jastiper Pro Menu
                  </p>
                  {jastiperItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 p-4 border-4 border-black bg-yellow-100 ${pathname === item.href ? 'bg-yellow-400 shadow-none translate-x-1 translate-y-1' : 'shadow-[4px_4px_0px_0px_#000]'}`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </>
              )}

              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 border-4 border-black bg-pink-300 shadow-[4px_4px_0px_0px_#000] mt-4"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {children}
      </main>
    </div>
  );
}
