'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  LayoutGrid,
  Compass,
  Ticket,
  LogOut,
  User,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AppShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  darkHeaderIcon?: boolean;
}

export default function AppShell({
  children,
  showBottomNav = true,
  darkHeaderIcon = false,
}: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Penjelajah Borneo',
    email: 'Member Borneo Trans',
  });

  const pathname = usePathname();
  const router = useRouter();

  // Sinkronkan nama & email pengguna saat halaman berpindah atau sidebar dibuka
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('borneo_demo_user');
      const rawSettings = localStorage.getItem('borneo_user_settings');

      const parsedUser = rawUser ? JSON.parse(rawUser) : {};
      const parsedSettings = rawSettings ? JSON.parse(rawSettings) : {};

      const resolvedName =
        parsedUser.name || parsedSettings.name || 'Penjelajah Borneo';
      const resolvedEmail =
        parsedUser.email || parsedSettings.email || 'Member Borneo Trans';

      setUserInfo({
        name: resolvedName,
        email: resolvedEmail,
      });
    } catch {
      // Gunakan nilai default jika localStorage tidak tersedia
    }
  }, [drawerOpen, pathname]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('borneo_demo_user');
    setDrawerOpen(false);
    router.push('/');
  };

  const navLinks = [
    { label: 'Beranda (Home)', href: '/home', icon: Home },
    { label: 'Jelajahi Pesona Kalimantan', href: '/explore', icon: Compass },
    { label: 'Promo Untukmu', href: '/promo', icon: LayoutGrid },
    { label: 'MY Ticket', href: '/my-tickets', icon: Ticket },
    { label: 'Profil & Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <div className="relative flex-1 flex flex-col min-h-screen">
      {/* Tombol Hamburger Menu Melayang di Pojok Kiri Atas */}
      <button
        onClick={() => setDrawerOpen(true)}
        aria-label="Buka Menu"
        className={`fixed top-4 z-30 ml-4 p-2.5 rounded-full backdrop-blur-md transition active:scale-95 ${
          darkHeaderIcon
            ? 'bg-white/85 text-[#081C15] shadow-md'
            : 'bg-black/25 text-white hover:bg-black/40'
        }`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Konten Halaman */}
      <div className="flex-1 flex flex-col">{children}</div>

      {/* Floating Bottom Navigation Bar (Kapsul Putih di Bawah) */}
      {showBottomNav && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] border border-gray-100 flex items-center gap-3">
            <button
              onClick={() => router.push('/home')}
              aria-label="Home"
              className={`p-3 rounded-xl transition-all ${
                pathname === '/home'
                  ? 'bg-[#262626] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/promo')}
              aria-label="Promo Untukmu"
              className={`p-3 rounded-xl transition-all ${
                pathname === '/promo'
                  ? 'bg-[#262626] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Side Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-center">
          <div className="w-full max-w-[430px] relative flex">
            {/* Backdrop gelap */}
            <div
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            />

            {/* Panel Menu Kiri */}
            <aside className="relative z-10 w-72 bg-gradient-to-b from-[#081C15] via-[#1B4332] to-[#0F2E22] text-white h-full p-6 flex flex-col justify-between shadow-2xl">
              <div>
                {/* Header Logo Putih Borneo Trans */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <img
                      src="/images/logo BT white.png"
                      alt="Borneo Trans"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'inline';
                      }}
                      className="h-11 w-auto object-contain"
                    />
                    <span
                      style={{ display: 'none' }}
                      className="font-extrabold italic text-xl tracking-tight text-white"
                    >
                      Borneo<span className="text-[#A3C9A8]">Trans</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Info User (Ketuk untuk Buka Profil & Pengaturan) */}
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/settings');
                  }}
                  className="w-full flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition mb-6 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#A3C9A8] text-[#081C15] flex items-center justify-center font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate">
                        {userInfo.name}
                      </p>
                      <p className="text-xs text-emerald-200/80 truncate">
                        {userInfo.email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-200/80 shrink-0" />
                </button>

                {/* Daftar Menu */}
                <nav className="space-y-1.5">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => {
                          setDrawerOpen(false);
                          router.push(item.href);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                          active
                            ? 'bg-white text-[#081C15] font-semibold shadow-md'
                            : 'text-emerald-50 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-200 hover:bg-red-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun</span>
              </button>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}