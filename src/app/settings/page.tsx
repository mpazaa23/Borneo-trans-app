'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Bell,
  Headphones,
  LogOut,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Users,
  Plus,
  Trash2,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Moon,
  Sun,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface SavedCoPassenger {
  id: string;
  name: string;
  relation: string;
}

export interface BorneoUserSettings {
  name: string;
  email: string;
  phone: string;
  favoritePickup: string;
  autoFillCheckout: boolean;
  preferredTimezone: 'WIB' | 'WITA';
  defaultPaymentMethod: string;
  savedPassengers: SavedCoPassenger[];
  tripReminder: boolean;
  promoAlert: boolean;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: BorneoUserSettings = {
  name: 'Penjelajah Borneo',
  email: 'traveler@borneotrans.id',
  phone: '',
  favoritePickup: '',
  autoFillCheckout: true,
  preferredTimezone: 'WITA',
  defaultPaymentMethod: 'BCA_VA',
  savedPassengers: [],
  tripReminder: true,
  promoAlert: true,
  darkMode: false,
};

const PAYMENT_PREFERENCE_OPTIONS = [
  { id: 'BCA_VA', label: 'BCA Virtual Account' },
  { id: 'BNI_VA', label: 'BNI Virtual Account' },
  { id: 'BRI_VA', label: 'BRI Virtual Account' },
  { id: 'MANDIRI_VA', label: 'Mandiri Virtual Account' },
  { id: 'QRIS', label: 'QRIS (Semua E-Wallet & Mobile Banking)' },
  { id: 'BCA_TF', label: 'Transfer Bank BCA' },
  { id: 'BNI_TF', label: 'Transfer Bank BNI' },
  { id:'BRI_TF', label: 'Transfer Bank BRI' },
  { id:'MANDIRI_TF', label: 'Transfer Bank Mandiri' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<BorneoUserSettings>(DEFAULT_SETTINGS);
  const [savedNotice, setSavedNotice] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // State tambah penumpang pendamping tersimpan
  const [newPassengerName, setNewPassengerName] = useState('');
  const [newPassengerRelation, setNewPassengerRelation] = useState('Pasangan');

  // State ubah kata sandi
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassText, setShowPassText] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('borneo_demo_user');
      const rawSettings = localStorage.getItem('borneo_user_settings');

      const parsedUser = rawUser ? JSON.parse(rawUser) : {};
      const parsedSettings = rawSettings ? JSON.parse(rawSettings) : {};

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
        name: parsedUser.name || parsedSettings.name || DEFAULT_SETTINGS.name,
        email: parsedUser.email || parsedSettings.email || DEFAULT_SETTINGS.email,
        phone: parsedUser.phone || parsedSettings.phone || DEFAULT_SETTINGS.phone,
        savedPassengers: Array.isArray(parsedSettings.savedPassengers)
          ? parsedSettings.savedPassengers
          : [],
      });
    } catch {
      // Gunakan nilai bawaan jika penyimpanan lokal kosong
    }
  }, []);

  const persistSettings = (nextSettings: BorneoUserSettings) => {
    setSettings(nextSettings);
    localStorage.setItem(
      'borneo_demo_user',
      JSON.stringify({
        name: nextSettings.name,
        email: nextSettings.email,
        phone: nextSettings.phone,
      })
    );
    localStorage.setItem('borneo_user_settings', JSON.stringify(nextSettings));
  };

  const handleAddCoPassenger = () => {
    const trimmed = newPassengerName.trim();
    if (!trimmed) return;

    const updatedList: SavedCoPassenger[] = [
      ...settings.savedPassengers,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        relation: newPassengerRelation,
      },
    ];

    persistSettings({
      ...settings,
      savedPassengers: updatedList,
    });
    setNewPassengerName('');
  };

  const handleRemoveCoPassenger = (id: string) => {
    const updatedList = settings.savedPassengers.filter((p) => p.id !== id);
    persistSettings({
      ...settings,
      savedPassengers: updatedList,
    });
  };

  const handleUpdatePassword = async () => {
    setPasswordFeedback(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'Kata sandi baru minimal 6 karakter.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'Konfirmasi kata sandi baru tidak cocok.',
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const normalizedEmail = settings.email.trim().toLowerCase();
      const rawRegistered = localStorage.getItem('borneo_registered_users');
      const registeredUsers: Array<{
        name: string;
        email: string;
        phone?: string;
        password: string;
      }> = rawRegistered ? JSON.parse(rawRegistered) : [];

      const localIdx = registeredUsers.findIndex(
        (u) => u.email === normalizedEmail
      );

      if (localIdx !== -1) {
        if (
          currentPassword &&
          registeredUsers[localIdx].password !== currentPassword
        ) {
          setPasswordFeedback({
            type: 'error',
            text: 'Kata sandi lama tidak sesuai.',
          });
          setUpdatingPassword(false);
          return;
        }
        registeredUsers[localIdx].password = newPassword;
        localStorage.setItem(
          'borneo_registered_users',
          JSON.stringify(registeredUsers)
        );
      }

      if (isSupabaseConfigured && supabase) {
        await supabase.auth.updateUser({ password: newPassword });
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({
        type: 'success',
        text: 'Kata sandi akun berhasil diperbarui!',
      });
    } catch {
      setPasswordFeedback({
        type: 'error',
        text: 'Gagal memperbarui kata sandi. Coba lagi.',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedSettings: BorneoUserSettings = {
      ...settings,
      name: settings.name.trim() || 'Penjelajah Borneo',
      email: settings.email.trim() || 'traveler@borneotrans.id',
      phone: settings.phone.trim(),
      favoritePickup: settings.favoritePickup.trim(),
    };

    persistSettings(cleanedSettings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2600);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('borneo_demo_user');
      router.push('/');
    } catch {
      router.push('/');
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = settings.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return (
    <AppShell showBottomNav={true}>
      <div className="flex-1 bg-[#F4F7F5] pb-28 min-h-screen flex flex-col">
        {/* Header Hijau Borneo Trans */}
        <div className="relative bg-gradient-to-b from-[#5E9F83] via-[#4C8A70] to-[#2F634E] pt-16 pb-10 px-5 overflow-hidden">
          <img
            src="/images/bg utama.png"
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-35 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-emerald-950/30 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/95 text-[#1B4332] font-black text-lg flex items-center justify-center shadow-md shrink-0">
              {initials || 'BT'}
            </div>
            <div className="min-w-0 text-white">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-emerald-100 mb-1">
                <Sparkles className="w-3 h-3" />
                Member Borneo Trans
              </span>
              <h1 className="text-lg font-extrabold leading-tight truncate">
                {settings.name}
              </h1>
              <p className="text-xs text-emerald-100 truncate">
                {settings.email}
              </p>
            </div>
          </div>
        </div>

        {/* Layered Sheet Konten Pengaturan */}
        <form
          onSubmit={handleSaveSettings}
          className="relative z-20 -mt-5 rounded-t-[28px] bg-[#F4F7F5] px-5 pt-5 space-y-4 flex-1 shadow-[0_-8px_24px_rgba(8,28,21,0.08)]"
        >
          {savedNotice && (
            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#15803D] flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profil &amp; pengaturan berhasil disimpan!</span>
            </div>
          )}

          {/* Kartu Sakelar Dark Mode (Berubah Langsung ke Seluruh Aplikasi) */}
       <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-emerald-950/5 flex items-center justify-between gap-3">
         <div className="flex items-center gap-3">
           <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
             {settings.darkMode ? (
               <Moon className="w-4 h-4" />
             ) : (
               <Sun className="w-4 h-4" />
             )}
           </div>
           <div>
             <p className="text-xs font-extrabold text-gray-900">
               Mode Gelap (Dark Mode)
             </p>
             <p className="text-[10px] text-gray-500">
               {settings.darkMode
                 ? 'Aktif • Nyaman untuk perjalanan malam'
                 : 'Nonaktif • Tampilan siang terang'}
             </p>
           </div>
         </div>

         <button
           type="button"
           role="switch"
           aria-checked={settings.darkMode}
           onClick={() => {
             const nextDark = !settings.darkMode;
           if (nextDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
                } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.removeAttribute('data-theme');
                }
             persistSettings({
               ...settings,
               darkMode: nextDark,
             });
           }}
           className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
             settings.darkMode ? 'bg-[#15803D]' : 'bg-gray-300'
           }`}
         >
           <div
             className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
               settings.darkMode ? 'translate-x-5' : 'translate-x-0'
             }`}
           />
         </button>
       </div>

          {/* 1. Data Profil Pemesan & Keamanan */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-emerald-950/5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                Profil Penumpang
              </h2>
              <span className="text-[10px] font-semibold text-[#15803D]">
                Data Utama
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  placeholder="Nama lengkap sesuai identitas"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F4F7F5] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#15803D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                  placeholder="email@domain.com"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F4F7F5] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#15803D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Nomor WhatsApp Aktif
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  placeholder="Contoh: 081234567890"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F4F7F5] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#15803D]"
                />
              </div>
            </div>

            {/* Bagian Ubah Kata Sandi */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordBox((prev) => !prev);
                  setPasswordFeedback(null);
                }}
                className="w-full flex items-center justify-between text-left py-1"
              >
                <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-800">
                  <Lock className="w-3.5 h-3.5 text-[#15803D]" />
                  Keamanan &amp; Kata Sandi
                </span>
                <span className="text-[11px] font-bold text-[#15803D]">
                  {showPasswordBox ? 'Tutup' : 'Ubah Kata Sandi'}
                </span>
              </button>

              {showPasswordBox && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#F4F7F5] border border-gray-200/80 space-y-2">
                  {passwordFeedback && (
                    <div
                      className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ${
                        passwordFeedback.type === 'error'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                      }`}
                    >
                      {passwordFeedback.type === 'error' ? (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{passwordFeedback.text}</span>
                    </div>
                  )}

                  <input
                    type={showPassText ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Kata sandi lama (opsional jika akun demo)"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#15803D]"
                  />

                  <div className="relative">
                    <input
                      type={showPassText ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Kata sandi baru (min. 6 karakter)"
                      className="w-full h-9 pl-3 pr-9 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#15803D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassText((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassText ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <input
                    type={showPassText ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#15803D]"
                  />

                  <button
                    type="button"
                    disabled={updatingPassword}
                    onClick={handleUpdatePassword}
                    className="w-full py-2 rounded-lg bg-[#1B4332] hover:bg-[#143326] text-white text-[11px] font-bold transition disabled:opacity-60"
                  >
                    {updatingPassword
                      ? 'Memperbarui...'
                      : 'Simpan Kata Sandi Baru'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Daftar Penumpang Pendamping Tersimpan */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-emerald-950/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#15803D]" />
                <h2 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                  Penumpang Tersimpan
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">
                {settings.savedPassengers.length} tersimpan
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Simpan nama pasangan, keluarga, atau rekan perjalanan agar bisa
              dipilih sekali ketuk saat memesan lebih dari 1 kursi.
            </p>

            {/* List Penumpang yang Sudah Disimpan */}
            {settings.savedPassengers.length > 0 && (
              <div className="space-y-2">
                {settings.savedPassengers.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#F4F7F5] border border-gray-200/80"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {person.name}
                      </p>
                      <p className="text-[10px] font-semibold text-[#15803D]">
                        {person.relation}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoPassenger(person.id)}
                      aria-label={`Hapus ${person.name}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Tambah Penumpang Baru */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newPassengerName}
                onChange={(e) => setNewPassengerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCoPassenger();
                  }
                }}
                placeholder="Nama penumpang pendamping..."
                className="flex-1 h-9 px-3 rounded-xl bg-[#F4F7F5] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#15803D]"
              />
              <select
                value={newPassengerRelation}
                onChange={(e) => setNewPassengerRelation(e.target.value)}
                className="h-9 px-2 rounded-xl bg-[#F4F7F5] border border-gray-200 text-[11px] font-semibold text-gray-700 focus:outline-none focus:border-[#15803D]"
              >
                <option value="Pasangan">Pasangan</option>
                <option value="Keluarga">Keluarga</option>
                <option value="Rekan">Rekan</option>
              </select>
              <button
                type="button"
                onClick={handleAddCoPassenger}
                aria-label="Tambah penumpang"
                className="h-9 px-3 rounded-xl bg-[#15803D] hover:bg-[#116932] text-white flex items-center justify-center shadow-xs active:scale-95 transition shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Preferensi Layanan Door to Door, Pembayaran & Checkout */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-emerald-950/5 space-y-3.5">
            <h2 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              Layanan &amp; Pemesanan Cepat
            </h2>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Alamat Penjemputan Favorit (Door to Door)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#15803D] absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={settings.favoritePickup}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      favoritePickup: e.target.value,
                    })
                  }
                  placeholder="Masukkan alamat rumah, hotel, atau patokan jemput..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F7F5] border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#15803D] resize-none"
                />
              </div>
            </div>

            {/* Metode Pembayaran Utama */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Metode Pembayaran Utama
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-[#15803D] absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={settings.defaultPaymentMethod}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultPaymentMethod: e.target.value,
                    })
                  }
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F4F7F5] border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#15803D] cursor-pointer"
                >
                  {PAYMENT_PREFERENCE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggle Auto-fill Checkout */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <p className="text-xs font-bold text-gray-800">
                  Isi Otomatis Data Pemesan
                </p>
                <p className="text-[10px] text-gray-500">
                  Gunakan profil, titik jemput, &amp; metode bayar utama saat
                  checkout
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.autoFillCheckout}
                onClick={() =>
                  setSettings({
                    ...settings,
                    autoFillCheckout: !settings.autoFillCheckout,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                  settings.autoFillCheckout ? 'bg-[#15803D]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.autoFillCheckout
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Pilihan Zona Waktu Kalimantan */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#15803D]" />
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Zona Waktu Jadwal
                  </p>
                  <p className="text-[10px] text-gray-500">
                    WIB (Kalteng/Kalbar) atau WITA (Kalsel/Kaltim)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 bg-[#F4F7F5] p-0.5 rounded-xl border border-gray-200">
                {(['WIB', 'WITA'] as const).map((tz) => (
                  <button
                    key={tz}
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, preferredTimezone: tz })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition ${
                      settings.preferredTimezone === tz
                        ? 'bg-[#15803D] text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Notifikasi & Bantuan */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-emerald-950/5 space-y-3">
            <h2 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
              Notifikasi &amp; Bantuan
            </h2>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#15803D] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Pengingat Jadwal Keberangkatan
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Notifikasi 2 jam sebelum armada menjemput
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.tripReminder}
                onClick={() =>
                  setSettings({
                    ...settings,
                    tripReminder: !settings.tripReminder,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                  settings.tripReminder ? 'bg-[#15803D]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.tripReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    Info Promo &amp; Diskon Rute
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Dapatkan kode hemat paket wisata &amp; hotel
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.promoAlert}
                onClick={() =>
                  setSettings({
                    ...settings,
                    promoAlert: !settings.promoAlert,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                  settings.promoAlert ? 'bg-[#15803D]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.promoAlert ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Kartu Layanan CS 24 Jam */}
            <div className="mt-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white text-[#15803D] flex items-center justify-center shadow-xs shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-800">
                    Pusat Bantuan CS 24 Jam
                  </p>
                  <p className="text-[10px] text-gray-600">
                    Ubah jadwal &amp; bantuan penjemputan
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#15803D] bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                Aktif
              </span>
            </div>
          </div>

          {/* Tombol Simpan & Keluar Akun */}
          <div className="space-y-2.5 pt-1">
            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-[0.99] transition"
            >
              Simpan Perubahan
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-[0.99]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loggingOut ? 'Keluar...' : 'Keluar Akun'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}