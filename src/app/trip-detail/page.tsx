'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Mic,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import HiaceSeatMap from '@/components/HiaceSeatMap';
import { findOrBuildRoute, getSchedulesForRoute } from '@/data/mockData';

function TripDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const originParam = searchParams.get('origin') || 'Kota Sampit';
  const destinationParam =
    searchParams.get('destination') || 'Kota Palangkaraya';
  const date = searchParams.get('date') || '2026-04-20';

  const currentRoute = findOrBuildRoute(originParam, destinationParam);
  const activeSchedules = getSchedulesForRoute(currentRoute.id, date);

  // Awalnya null agar denah kursi BELUM terbuka saat halaman pertama kali dibuka
  const [expandedScheduleId, setExpandedScheduleId] = useState<string | null>(
    null
  );

  // Awalnya kosong agar belum ada kursi yang otomatis terpilih
  const [selectedSeatsMap, setSelectedSeatsMap] = useState<
    Record<string, string[]>
  >({});

  const [airportDropMap, setAirportDropMap] = useState<Record<string, boolean>>(
    {}
  );

  const formatShortCity = (cityName: string) =>
    cityName.replace(/^Kota\s+/i, '');

  const formatHariTanggal = (isoDate: string) => {
    try {
      const parsed = new Date(isoDate + 'T00:00:00');
      return parsed.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Senin, 20 April 2026';
    }
  };

  const toggleSeat = (scheduleId: string, seatCode: string) => {
    setSelectedSeatsMap((prev) => {
      const current = prev[scheduleId] || [];
      const exists = current.includes(seatCode);
      const updated = exists
        ? current.filter((s) => s !== seatCode)
        : [...current, seatCode];
      return { ...prev, [scheduleId]: updated };
    });
  };

  const toggleAirportDrop = (scheduleId: string) => {
    setAirportDropMap((prev) => ({
      ...prev,
      [scheduleId]: !prev[scheduleId],
    }));
  };

  const handleConfirmSeats = (scheduleId: string) => {
    const seats = selectedSeatsMap[scheduleId] || [];
    if (seats.length === 0) {
      alert('Silakan pilih minimal 1 kursi terlebih dahulu.');
      return;
    }
    setExpandedScheduleId(null);
  };

  const handleProceedCheckout = (scheduleId: string) => {
    const seats = selectedSeatsMap[scheduleId] || [];
    if (seats.length === 0) {
      alert('Silakan pilih minimal 1 kursi terlebih dahulu.');
      return;
    }

    const schedule =
      activeSchedules.find((s) => s.id === scheduleId) || activeSchedules[0];

    const draftBooking = {
      routeId: currentRoute.id,
      scheduleId: schedule.id,
      originCity: formatShortCity(currentRoute.origin_city),
      destinationCity: formatShortCity(currentRoute.destination_city),
      originAddress: currentRoute.origin_address,
      destinationAddress: currentRoute.destination_address,
      date,
      formattedDate: formatHariTanggal(date),
      departureTime: schedule.departure_time,
      arrivalTime: schedule.arrival_time,
      basePrice: currentRoute.base_price,
      airportDropFee: currentRoute.airport_drop_fee,
      isAirportDrop: Boolean(airportDropMap[scheduleId]),
      selectedSeats: seats,
    };

    sessionStorage.setItem('borneo_booking_draft', JSON.stringify(draftBooking));
    router.push('/checkout');
  };

  return (
    <AppShell showBottomNav={false} darkHeaderIcon={true}>
      <div className="relative flex-1 bg-gradient-to-b from-[#9ED2BE] via-[#BCE3D3] to-[#74B49B] pt-14 pb-12 px-5 min-h-screen">
        {/* Background Kalimantan */}
        <img
          src="/images/bg utama.png"
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        />

        <div className="relative z-10">
          {/* Search Bar Atas */}
          <div className="flex items-center gap-2.5 mb-4 pl-7">
            <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Find places, food, trips.."
                className="w-full text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="button"
              aria-label="Voice Search"
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm shrink-0"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Judul Halaman */}
          <h1 className="text-lg font-extrabold text-gray-900 mb-3">
            Detail Perjalanan
          </h1>

          {/* Daftar Kartu Jadwal Keberangkatan */}
          <div className="space-y-5">
            {activeSchedules.map((schedule) => {
              const isExpanded = expandedScheduleId === schedule.id;
              const selectedSeats = selectedSeatsMap[schedule.id] || [];
              const isAirportDrop = Boolean(airportDropMap[schedule.id]);
              const hasConfirmedSeats = selectedSeats.length > 0 && !isExpanded;

              return (
                <div key={schedule.id}>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
                    {/* Pill Header Rute */}
                    <div className="bg-white border-b border-gray-100 py-2.5 px-4 flex items-center justify-center gap-3 shadow-xs">
                      <span className="text-xs font-extrabold text-gray-900">
                        {formatShortCity(currentRoute.origin_city)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-extrabold text-gray-900">
                        {formatShortCity(currentRoute.destination_city)}
                      </span>
                    </div>

                    <div className="p-4">
                     {/* Baris Logo Armada & Tanggal */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="w-28 h-16 flex items-center justify-start overflow-hidden">
                            <img
                              src="/images/Logo TV 2.jpg"
                              alt="Hiace"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              className="w-full h-full object-contain object-left scale-110"
                            />
                          </div>
                          <p className="text-[11px] font-extrabold text-gray-800 mt-0.5">
                            {schedule.service_class}
                          </p>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <img
                            src="/images/logo BT green.png"
                            alt="Borneo Trans"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                            className="h-6 object-contain"
                          />
                          <p
                            style={{ display: 'none' }}
                            className="text-sm font-black italic text-[#15803D]"
                          >
                            Borneo<span className="text-gray-800">Trans</span>
                          </p>
                          <p className="text-[11px] font-semibold text-gray-600 mt-1">
                            {formatHariTanggal(date)}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Keberangkatan & Kedatangan */}
                      <div className="relative pl-1 my-3">
                        <div className="flex items-start gap-3">
                          <span className="w-11 text-sm font-extrabold text-gray-900 pt-0.5">
                            {schedule.departure_time}
                          </span>
                          <div className="flex flex-col items-center">
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#15803D] bg-white mt-1" />
                            <div className="w-0.5 h-11 bg-gray-300" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-gray-900 leading-tight">
                              {formatShortCity(currentRoute.origin_city)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {currentRoute.origin_address}
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-gray-400 font-medium -mt-8 mb-3 pl-1 w-12 leading-tight">
                          {currentRoute.duration_text}
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="w-11 text-sm font-extrabold text-gray-900">
                            {schedule.arrival_time}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-[#15803D] mt-1" />
                          <div>
                            <p className="text-sm font-extrabold text-gray-900 leading-tight">
                              {formatShortCity(currentRoute.destination_city)}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {currentRoute.destination_address}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Opsi Drop Bandara & Harga */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-[11px] font-bold text-gray-700 mb-1">
                            Drop Bandara?
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleAirportDrop(schedule.id)}
                            aria-label="Toggle Drop Bandara"
                            className={`w-12 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                              isAirportDrop
                                ? 'bg-[#15803D] justify-end'
                                : 'bg-gray-300 justify-start'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-extrabold text-[#8B1E24]">
                            Rp {currentRoute.base_price.toLocaleString('id-ID')}
                            <span className="text-xs font-semibold text-gray-500">
                              /Pax
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-500 mt-1.5">
                        *Drop bandara dikenai biaya tambah Rp{' '}
                        {currentRoute.airport_drop_fee.toLocaleString('id-ID')}
                      </p>

                      {/* Bagian Bawah Kartu: Pilih Kursi Anda / Edit Kursi + Lanjut */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedScheduleId(
                                isExpanded ? null : schedule.id
                              )
                            }
                            className="flex items-center gap-1.5 text-xs font-extrabold text-[#15803D] hover:underline"
                          >
                            <span>
                              {selectedSeats.length > 0
                                ? 'Edit Kursi Anda'
                                : 'Pilih Kursi Anda'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {selectedSeats.length > 0 && (
                            <p className="text-[11px] text-gray-600 mt-0.5">
                              Kursi Terpilih:{' '}
                              <span className="font-extrabold text-[#15803D]">
                                Seat {selectedSeats.join(', ')}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Tombol Lanjut baru muncul setelah user memilih & mengonfirmasi kursi */}
                        {hasConfirmedSeats && (
                          <button
                            type="button"
                            onClick={() => handleProceedCheckout(schedule.id)}
                            className="px-6 py-2 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-95 transition"
                          >
                            Lanjut
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Denah Kursi Toyota Hiace (Hanya muncul saat user klik "Pilih Kursi Anda") */}
                  {isExpanded && (
                    <HiaceSeatMap
                      selectedSeats={selectedSeats}
                      onToggleSeat={(code) => toggleSeat(schedule.id, code)}
                      bookedSeats={schedule.booked_seats || []}
                      prioritySeats={schedule.priority_seats || ['B', 'E']}
                      onConfirm={() => handleConfirmSeats(schedule.id)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function TripDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen text-sm font-semibold text-[#1B4332]">
          Memuat detail perjalanan...
        </div>
      }
    >
      <TripDetailContent />
    </Suspense>
  );
}