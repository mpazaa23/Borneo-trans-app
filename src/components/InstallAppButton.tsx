"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppButton() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Hanya tampilkan tombol melayang di halaman awal (/) dan Beranda (/home)
  const isAllowedPage = pathname === "/" || pathname === "/home";

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (
    !isAllowedPage ||
    isInstalled ||
    dismissed ||
    (!deferredPrompt && !isIOS)
  ) {
    return null;
  }

  return (
    <>
      {/* Tombol Kapsul Install App di Pojok Kanan Atas */}
      <div className="absolute top-3.5 right-4 z-50 flex items-center gap-1 bg-white/95 backdrop-blur-md border border-[#15803D]/30 shadow-lg rounded-full pl-3 pr-1.5 py-1">
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#15803D] hover:text-[#1B4332] transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Install App</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Tutup tombol install"
          className="w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Panduan Singkat Khusus Pengguna iPhone (Safari) */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900">
                Install Borneo Trans di iPhone
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              1. Ketuk ikon{" "}
              <span className="inline-flex items-center gap-1 font-bold text-[#15803D]">
                <Share className="w-3.5 h-3.5" /> Share
              </span>{" "}
              di bagian bawah browser Safari.
              <br />
              2. Gulir ke bawah lalu pilih{" "}
              <span className="font-bold text-gray-900">
                &ldquo;Add to Home Screen&rdquo;
              </span>{" "}
              (Tambah ke Layar Utama).
            </p>
          </div>
        </div>
      )}
    </>
  );
}
