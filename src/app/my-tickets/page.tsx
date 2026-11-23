'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CloudCheck, HardDrive } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { BookingTicket } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const SAMPLE_TICKET: BookingTicket = {
  id: 'sample-1',
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

export default function MyTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<BookingTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncedFromCloud, setSyncedFromCloud] = useState(false);
  const [timezoneLabel, setTimezoneLabel] = useState<'WIB' | 'WITA'>('WITA');

  useEffect(() => {
    try {
      const rawSettings = localStorage.getItem('borneo_user_settings');
      if (rawSettings) {
        const parsedSettings = JSON.parse(rawSettings);
        if (parsedSettings?.preferredTimezone) {
          setTimezoneLabel(parsedSettings.preferredTimezone);
        }
      }
    } catch {
      // Abaikan jika gagal parse
    }

    const loadTickets = async () => {
      let activeUserId: string | null = null;

      if (isSupabaseConfigured && supabase) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          activeUserId = user?.id ?? null;
        } catch {
          activeUserId = null;
        }
      }

      // Gunakan kunci penyimpanan lokal yang terisolasi per akun
      const ticketStorageKey = activeUserId
        ? `borneo_tickets_${activeUserId}`
        : 'borneo_tickets_demo';

      let localTickets: BookingTicket[] = [];
      try {
        const savedRaw = localStorage.getItem(ticketStorageKey);
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (Array.isArray(parsed)) {
            localTickets = parsed;
          }
        }
      } catch {
        localTickets = [];
      }

      let cloudTickets: BookingTicket[] = [];

      // Hanya tarik dari Supabase jika akun terautentikasi dan filter eksplisit berdasarkan user_id
      if (isSupabaseConfigured && supabase && activeUserId) {
        try {
          const { data: bookingsData, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', activeUserId)
            .order('created_at', { ascending: false })
            .limit(30);

          if (error) {
            console.error('Supabase bookings error:', error.message);
          } else if (Array.isArray(bookingsData)) {
            setSyncedFromCloud(true);

            const bookingIds = bookingsData.map((b) => b.id).filter(Boolean);
            const passengersMap: Record<
              string,
              Array<{ seat_code: string; passenger_name: string }>
            > = {};

            if (bookingIds.length > 0) {
              const { data: passData } = await supabase
                .from('booking_passengers')
                .select('booking_id, seat_code, passenger_name')
                .in('booking_id', bookingIds);

              if (Array.isArray(passData)) {
                passData.forEach((p) => {
                  if (!passengersMap[p.booking_id]) {
                    passengersMap[p.booking_id] = [];
                  }
                  passengersMap[p.booking_id].push({
                    seat_code: p.seat_code,
                    passenger_name: p.passenger_name,
                  });
                });
              }
            }

            cloudTickets = bookingsData.map((row) => ({
              id: row.id,
              ticket_code: row.ticket_code,
              origin_city: row.origin_city || 'Sampit',
              destination_city: row.destination_city || 'Palangkaraya',
              departure_date: row.departure_date || 'Jadwal Borneo Trans',
              departure_time: row.departure_time || '01:00',
              arrival_time: row.arrival_time || '03:10',
              booker_salutation: row.booker_salutation,
              booker_name: row.booker_name,
              booker_email: row.booker_email,
              booker_phone: row.booker_phone,
              is_airport_drop: Boolean(row.is_airport_drop),
              ticket_subtotal: Number(row.ticket_subtotal) || 0,
              airport_drop_total: Number(row.airport_drop_total) || 0,
              admin_fee: Number(row.admin_fee) || 2500,
              total_amount: Number(row.total_amount) || 0,
              payment_method: row.payment_method,
              payment_status:
                row.payment_status === 'PENDING' ? 'PENDING' : 'PAID',
              barcode_number: row.barcode_number,
              passengers:
                passengersMap[row.id] && passengersMap[row.id].length > 0
                  ? passengersMap[row.id]
                  : [{ seat_code: 'A', passenger_name: row.booker_name }],
              created_at: row.created_at,
            }));
          }
        } catch (err) {
          console.error('Supabase fetch failed:', err);
        }
      }

      const mergedMap = new Map<string, BookingTicket>();
      [...cloudTickets, ...localTickets].forEach((t) => {
        if (t?.ticket_code && !mergedMap.has(t.ticket_code)) {
          mergedMap.set(t.ticket_code, t);
        }
      });

      const mergedList = Array.from(mergedMap.values());
      if (mergedList.length > 0) {
        setTickets(mergedList);
      } else if (!activeUserId) {
        // Tampilkan contoh tiket hanya jika berada di Mode Demo tanpa login
        setTickets([SAMPLE_TICKET]);
      } else {
        setTickets([]);
      }
      setLoading(false);
    };

    loadTickets();
  }, []);

  const handleOpenDetail = (ticket: BookingTicket) => {
    sessionStorage.setItem('borneo_latest_ticket', JSON.stringify(ticket));
    router.push('/ticket-success');
  };

  return (
    <AppShell showBottomNav={false} darkHeaderIcon={true}>
      <div className="relative flex-1 bg-gradient-to-b from-[#E5E7EB] via-[#D1D5DB] to-[#F3F4F6] pt-16 pb-12 px-5 min-h-screen">
        <img
          src="/images/bg utama.png"
          alt="Clouds"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none"
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 pl-6">
            <h1 className="text-xl font-extrabold text-gray-900">
              MY Ticket
            </h1>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/85 border border-gray-200 text-[10px] font-bold text-[#15803D] shadow-2xs">
              {syncedFromCloud ? (
                <>
                  <CloudCheck className="w-3.5 h-3.5" />
                  <span>Supabase Sync</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-600">Mode Lokal</span>
                </>
              )}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-3xl p-4 shadow-sm animate-pulse space-y-3"
                >
                  <div className="h-28 rounded-2xl bg-gray-100" />
                  <div className="flex justify-end">
                    <div className="h-7 w-24 rounded-xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <p className="text-sm font-extrabold text-gray-800">
                Belum Ada E-Ticket
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tiket perjalanan yang kamu pesan dengan akun ini akan muncul di
                sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400">
                        E - Ticket
                      </span>
                      <img
                        src="/images/Logo BT green.png"
                        alt="Borneo Trans"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="h-5 w-auto object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm font-extrabold text-gray-900 pb-2 border-b border-gray-200">
                      <span>{ticket.origin_city}</span>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <span>{ticket.destination_city}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] py-2 border-b border-gray-200">
                      <div>
                        <p className="text-gray-400 text-[10px]">Tanggal</p>
                        <p className="font-bold text-gray-800">
                          {ticket.departure_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-[10px]">Berangkat</p>
                        <p className="font-bold text-gray-800">
                          {ticket.departure_time.replace(':', '.')} {timezoneLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-2 gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400">Penumpang</p>
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {ticket.passengers
                            .map((p) => p.passenger_name)
                            .join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-gray-400">ID Ticket</p>
                        <p className="text-xs font-extrabold text-gray-900">
                          {ticket.ticket_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(ticket)}
                      className="px-5 py-1.5 rounded-xl btn-borneo text-white text-xs font-bold shadow active:scale-95 transition"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-xs font-bold text-gray-500 mt-6">
            Tidak ada riwayat ticket lain.
          </p>
        </div>
      </div>
    </AppShell>
  );
}