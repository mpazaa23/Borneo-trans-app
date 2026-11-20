'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pointer,
  ChevronsRight,
  Check,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface LocalRegisteredUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export default function OnboardingAndLoginPage() {
  const [step, setStep] = useState<'onboarding' | 'login'>('onboarding');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // State Animasi Geser (Slide-to-Unlock)
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(212);
  const [isDragging, setIsDragging] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [loading, setLoading] = useState(false);

  // State form manual login & register
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isUnlocked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    setIsDragging(true);

    if (trackRef.current) {
      // Lebar jalur (264px) - padding (8px) - lebar knob (44px) = 212px
      setMaxDrag(Math.max(120, trackRef.current.offsetWidth - 52));
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startXRef.current === null || isUnlocked) return;
    const diff = e.clientX - startXRef.current;
    const clamped = Math.max(0, Math.min(diff, maxDrag));
    setDragX(clamped);
  };

  const handlePointerUp = () => {
    if (!isDragging || isUnlocked) return;
    setIsDragging(false);
    startXRef.current = null;

    // Jika digeser minimal 72% jalur, kunci ke ujung kanan lalu buka form login
    if (dragX >= maxDrag * 0.72) {
      setDragX(maxDrag);
      setIsUnlocked(true);
      setTimeout(() => {
        setStep('login');
      }, 280);
    } else {
      // Memantul kembali ke kiri dengan mulus jika belum sampai ujung
      setDragX(0);
    }
  };

  const swipeProgress = maxDrag > 0 ? Math.min(1, dragX / maxDrag) : 0;

  const switchAuthMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const getStoredUsers = (): LocalRegisteredUser[] => {
    try {
      const raw = localStorage.getItem('borneo_registered_users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!trimmedEmail || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    if (authMode === 'register' && !trimmedName) {
      setErrorMsg('Nama lengkap wajib diisi untuk membuat akun.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'register') {
        const existingUsers = getStoredUsers();
        if (existingUsers.some((u) => u.email === trimmedEmail)) {
          setErrorMsg('Email sudah terdaftar. Silakan masuk menggunakan akun ini.');
          setLoading(false);
          return;
        }

        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              data: {
                full_name: trimmedName,
                phone: phone.trim(),
              },
            },
          });
          if (error && !error.message.toLowerCase().includes('already')) {
            throw error;
          }
        }

        const newUser: LocalRegisteredUser = {
          name: trimmedName,
          email: trimmedEmail,
          phone: phone.trim(),
          password,
        };
        localStorage.setItem(
          'borneo_registered_users',
          JSON.stringify([...existingUsers, newUser])
        );
        localStorage.setItem(
          'borneo_demo_user',
          JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
          })
        );

        setSuccessMsg('Akun berhasil dibuat! Mengarahkan ke beranda...');
        setTimeout(() => {
          router.push('/home');
        }, 700);
      } else {
        const existingUsers = getStoredUsers();
        const localMatch = existingUsers.find((u) => u.email === trimmedEmail);

        if (localMatch) {
          if (localMatch.password !== password) {
            setErrorMsg('Kata sandi salah. Periksa kembali kata sandimu.');
            setLoading(false);
            return;
          }

          localStorage.setItem(
            'borneo_demo_user',
            JSON.stringify({
              name: localMatch.name,
              email: localMatch.email,
              phone: localMatch.phone,
            })
          );
          router.push('/home');
          return;
        }

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });

          if (error) {
            setErrorMsg('Email belum terdaftar atau kata sandi tidak sesuai.');
            setLoading(false);
            return;
          }

          const userName =
            data.user?.user_metadata?.full_name ||
            trimmedEmail.split('@')[0];

          localStorage.setItem(
            'borneo_demo_user',
            JSON.stringify({
              name: userName,
              email: trimmedEmail,
            })
          );
          router.push('/home');
        } else {
          setErrorMsg(
            'Akun belum terdaftar. Silakan pilih tab "Daftar Akun" terlebih dahulu.'
          );
        }
      }
    } catch {
      setErrorMsg('Terjadi kendala saat memproses akun. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/home`,
          },
        });
        if (error) throw error;
      } else {
        localStorage.setItem(
          'borneo_demo_user',
          JSON.stringify({
            name: 'Penjelajah Borneo',
            email: 'traveler@borneotrans.id',
          })
        );
        router.push('/home');
      }
    } catch {
      router.push('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col justify-between min-h-screen bg-[#1B4332] overflow-hidden">
      {/* Foto Latar Pasar Terapung Kalimantan */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-900/40 to-black/70">
        <img
          src="/images/Floating Market Activity 1.png"
          alt="Pasar Terapung Kalimantan"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="w-full h-[72%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60" />
      </div>

      {/* Area Tengah: Logo Borneo Trans */}
      <div
        className={`relative z-10 flex-1 flex flex-col items-center justify-center px-6 transition-all duration-300 ${
          step === 'login' ? 'pt-7 pb-5' : 'pt-12 pb-24'
        }`}
      >
        <img
          src="/images/Logo Swoosh Borneo Trans (1) 1.png"
          alt="Borneo Trans"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
          className={`object-contain drop-shadow-lg transition-all duration-300 ${
            step === 'login' ? 'w-48' : 'w-64'
          }`}
        />
        <div style={{ display: 'none' }} className="text-center select-none">
          <h1 className="text-5xl font-black italic tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
            Borneo<span className="font-extrabold">Trans</span>
          </h1>
          <div className="h-1.5 w-48 mx-auto mt-1 rounded-full bg-white/90 shadow" />
        </div>
      </div>

      {/* Kartu Bawah Putih Melengkung */}
      <div
        className={`relative z-20 bg-[#F4F5F4] rounded-t-[34px] px-6 shadow-[0_-10px_35px_rgba(0,0,0,0.25)] transition-all duration-300 ${
          step === 'login' ? 'pt-6 pb-8' : 'pt-10 pb-12 text-center'
        }`}
      >
        <h2
          className={`font-extrabold text-[#111827] leading-snug text-center ${
            step === 'login' ? 'text-[17px] mb-4' : 'text-[19px] mb-7'
          }`}
        >
          #GerakanLangkahmubersama
          <br />
          BorneoTrans
        </h2>

        {step === 'onboarding' ? (
          <div className="flex flex-col items-center">
            {/* Jalur Interaktif Slide-to-Unlock (Mouse & Touch) */}
            <div
              ref={trackRef}
              className="relative w-66 h-13 rounded-full bg-[#3D5245] p-1 flex items-center shadow-lg overflow-hidden select-none"
            >
              {/* Jejak Hijau Terang Mengikuti Geseran */}
              <div
                style={{ width: `${dragX + 48}px` }}
                className={`absolute left-0 top-0 bottom-0 bg-[#15803D] rounded-full pointer-events-none ${
                  isDragging ? '' : 'transition-all duration-300 ease-out'
                }`}
              />

              {/* Teks Instruksi di Tengah Jalur */}
              <div
                style={{ opacity: Math.max(0, 1 - swipeProgress * 1.45) }}
                className="relative z-10 w-full flex items-center justify-center gap-1.5 pl-9 pr-3 text-white font-bold text-sm tracking-wide pointer-events-none"
              >
                <span>{isUnlocked ? 'Membuka...' : 'Swipe'}</span>
                <ChevronsRight className="w-4 h-4 text-emerald-200 animate-pulse" />
              </div>

              {/* Tombol Lingkaran yang Bisa Digeser (Draggable Knob) */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  transform: `translateX(${dragX}px)`,
                  touchAction: 'none',
                }}
                role="slider"
                aria-label="Geser ke kanan untuk mulai"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(swipeProgress * 100)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'ArrowRight') {
                    setDragX(maxDrag);
                    setIsUnlocked(true);
                    setTimeout(() => setStep('login'), 260);
                  }
                }}
                className={`relative z-20 w-11 h-11 rounded-full bg-white text-[#1B4332] flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing ${
                  isDragging ? 'scale-105' : 'transition-transform duration-300 ease-out'
                }`}
              >
                {isUnlocked ? (
                  <Check className="w-5 h-5 text-[#15803D] stroke-[2.5]" />
                ) : (
                  <Pointer className="w-5 h-5 rotate-[-18deg]" />
                )}
              </div>
            </div>

            <p className="text-[11px] text-gray-400 mt-3">
              Geser tombol putih ke kanan untuk mulai
            </p>
          </div>
        ) : (
          <div className="w-full max-w-[340px] mx-auto space-y-3.5">
            {/* Tab Pengalih Masuk / Daftar Akun */}
            <div className="grid grid-cols-2 bg-gray-200/80 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => switchAuthMode('login')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  authMode === 'login'
                    ? 'bg-white text-[#1B4332] shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => switchAuthMode('register')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  authMode === 'register'
                    ? 'bg-white text-[#1B4332] shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Daftar Akun
              </button>
            </div>

            {/* Pesan Error / Sukses */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-[11px] font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-[#15803D] px-3 py-2 rounded-xl text-[11px] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Input Manual */}
            <form onSubmit={handleManualSubmit} className="space-y-2.5 text-left">
              {authMode === 'register' && (
                <>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#3D5245]"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="No. WhatsApp (opsional)"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#3D5245]"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat Email"
                  className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#3D5245]"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    authMode === 'register'
                      ? 'Buat Kata Sandi (min. 6 karakter)'
                      : 'Kata Sandi'
                  }
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#3D5245]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#3D5245] hover:bg-[#2B3B31] text-white font-bold text-xs shadow-md transition active:scale-[0.99] disabled:opacity-60 mt-1"
              >
                {loading
                  ? 'Memproses...'
                  : authMode === 'register'
                  ? 'Buat Akun Baru'
                  : 'Masuk Sekarang'}
              </button>
            </form>

            {/* Pembatas */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                atau
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Tombol Login with Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-xs flex items-center justify-center gap-2.5 shadow-xs transition active:scale-[0.99] disabled:opacity-60"
            >
              <span className="w-5 h-5 rounded-full bg-[#4285F4]/10 flex items-center justify-center text-xs font-black text-[#4285F4]">
                G
              </span>
              <span>Login with Google</span>
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="text-xs font-medium text-[#1B4332] hover:underline"
              >
                Masuk Mode Demo Tanpa Login &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}