'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import AppShell from '@/components/AppShell';
import ETicketCard from '@/components/ETicketCard';
import { BookingTicket } from '@/types/database';

const FALLBACK_TICKET: BookingTicket = {
  id: 'demo-ticket-1',
  ticket_code: 'BRN26-87292-CG',
  origin_city: 'Sampit',
  destination_city: 'Palangkaraya',
  departure_date: 'Senin, 20 April 2026',
  departure_time: '01:00',
  arrival_time: '03:10',
  booker_salutation: 'Tuan',
  booker_name: 'Muhammad Nurha',
  booker_email: 'nurha@borneotrans.id',
  booker_phone: '081234567890',
  is_airport_drop: true,
  ticket_subtotal: 350000,
  airport_drop_total: 25000,
  admin_fee: 2500,
  total_amount: 377500,
  payment_method: 'BCA_VA',
  payment_status: 'PAID',
  barcode_number: '0123456789012345',
  passengers: [
    { seat_code: 'C', passenger_name: 'Muhammad Nurha' },
    { seat_code: 'G', passenger_name: 'Cintya Rinjani' },
  ],
  created_at: new Date().toISOString(),
};

export default function TicketSuccessPage() {
  const router = useRouter();
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [ticket, setTicket] = useState<BookingTicket>(FALLBACK_TICKET);
  const [downloading, setDownloading] = useState(false);

  // Tahapan animasi badge: masuk -> tampil -> keluar -> hilang
  const [badgeStatus, setBadgeStatus] = useState<
    'enter' | 'visible' | 'exit' | 'hidden'
  >('enter');

  useEffect(() => {
    const latest = sessionStorage.getItem('borneo_latest_ticket');
    if (latest) {
      try {
        setTicket(JSON.parse(latest));
      } catch {
        // Gunakan fallback ticket
      }
    }
  }, []);

  useEffect(() => {
    const showTimer = setTimeout(() => setBadgeStatus('visible'), 50);
    const exitTimer = setTimeout(() => setBadgeStatus('exit'), 3000);
    const hideTimer = setTimeout(() => setBadgeStatus('hidden'), 3550);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `E-Ticket-${ticket.ticket_code}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('Gagal mengunduh gambar tiket. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell showBottomNav={false} darkHeaderIcon={true}>
      <div className="relative flex-1 bg-gradient-to-b from-[#9ED2BE] via-[#BCE3D3] to-[#74B49B] pt-14 pb-10 px-6 min-h-screen flex flex-col justify-between">
        {/* Background Kalimantan */}
        <img
          src="/images/bg utama.png"
          alt="Kalimantan"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Badge Hijau Pembayaran Berhasil dengan Animasi Auto-Hide */}
          {badgeStatus !== 'hidden' && (
            <div
              className={`w-full flex justify-center overflow-hidden transition-all duration-500 ease-out ${
                badgeStatus === 'visible'
                  ? 'max-h-20 py-0.5 opacity-100 translate-y-0 scale-100 mb-5'
                  : badgeStatus === 'enter'
                  ? 'max-h-20 py-0.5 opacity-0 -translate-y-3 scale-95 mb-5'
                  : 'max-h-0 py-0 opacity-0 -translate-y-2 scale-95 mb-0 pointer-events-none'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#4ADE80] border border-emerald-600/30 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B] fill-emerald-800/15" />
                <span className="text-xs font-extrabold text-[#064E3B]">
                  Pembayaran berhasil
                </span>
              </div>
            </div>
          )}

          {/* Kartu E-Ticket */}
          <div className="w-full">
            <ETicketCard ticket={ticket} ticketRef={ticketRef} />
          </div>

          {/* Tombol Simpan E-Ticket & Home */}
          <div className="w-full space-y-2.5 mt-6">
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadTicket}
              className="w-full py-2.5 rounded-xl btn-borneo text-white text-xs font-bold shadow-lg active:scale-[0.99] transition"
            >
              {downloading ? 'Menyimpan Gambar...' : 'Unduh E-Ticket'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/home')}
              className="w-full py-2.5 rounded-xl bg-[#4B5563] hover:bg-[#374151] text-white text-xs font-bold shadow-md active:scale-[0.99] transition"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}