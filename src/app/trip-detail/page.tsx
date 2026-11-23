"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Mic,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Ban,
  AlertTriangle,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import HiaceSeatMap from "@/components/HiaceSeatMap";
import { findOrBuildRoute, getSchedulesForRoute } from "@/data/mockData";

const ALL_HIACE_SEATS = ["F", "C", "G", "D", "A", "H", "B", "E"];

function parseScheduleHour(timeStr: string): number {
  const normalized = (timeStr || "0").trim().toUpperCase();
  const isPM = normalized.includes("PM");
  const isAM = normalized.includes("AM");
  const clean = normalized.replace(/[^0-9:.]/g, "");
  const parts = clean.split(/[:.]/);
  let hour = parseInt(parts[0] || "0", 10);
  if (Number.isNaN(hour)) return 0;
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return hour;
}

function computeArrivalTime(
  departureTime: string,
  durationText: string
): string {
  const [depHStr, depMStr] = departureTime.replace(".", ":").split(":");
  const depH = parseInt(depHStr || "13", 10);
  const depM = parseInt(depMStr || "0", 10);

  const hourMatch = durationText.match(/(\d+)\s*jam/i);
  const minMatch = durationText.match(/(\d+)\s*menit/i);
  const addH = hourMatch ? parseInt(hourMatch[1], 10) : 3;
  const addM = minMatch ? parseInt(minMatch[1], 10) : 30;

  const totalMinutes = (depH * 60 + depM + addH * 60 + addM) % (24 * 60);
  const arrH = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const arrM = String(totalMinutes % 60).padStart(2, "0");
  return `${arrH}:${arrM}`;
}

// Sumber tunggal perhitungan sisa kursi yang 100% sama dengan halaman /search
function calculateShiftSeats(
  originCity: string,
  destCity: string,
  travelDate: string,
  shiftKey: "pagi" | "siang",
  totalCapacity: number
): number {
  const cleanOrigin = originCity.replace(/^Kota\s+/i, "").toLowerCase().trim();
  const cleanDest = destCity.replace(/^Kota\s+/i, "").toLowerCase().trim();
  const seedKey = `${cleanOrigin}|${cleanDest}|${travelDate}|${shiftKey}`;

  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) >>> 0;
  }

  const occupancyPattern = [6, 2, 0, 5, 1, 7, 3, 0, 4, 2];
  const baseAvailable = occupancyPattern[hash % occupancyPattern.length];
  return Math.min(baseAvailable, totalCapacity);
}

// Ambil kursi yang sudah benar-benar dipesan user di localStorage untuk rute, tanggal, & shift terkait
function getUserBookedSeatCodes(
  originCity: string,
  destCity: string,
  travelDate: string,
  shiftKey: "pagi" | "siang"
): string[] {
  if (typeof window === "undefined") return [];

  const bookedCodes = new Set<string>();
  const cleanOrigin = originCity.replace(/^Kota\s+/i, "").toLowerCase().trim();
  const cleanDest = destCity.replace(/^Kota\s+/i, "").toLowerCase().trim();

  try {
    const storageKeys = ["borneo_bookings", "borneo_tickets"];
    for (const key of storageKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;

      for (const item of parsed) {
        const itemOrigin = (
          item.origin ||
          item.originCity ||
          item.origin_city ||
          ""
        ).toLowerCase();
        const itemDest = (
          item.destination ||
          item.destinationCity ||
          item.destination_city ||
          ""
        ).toLowerCase();
        const itemDate = item.date || item.travel_date || "";
        const itemTime = item.departureTime || item.departure_time || "";
        const itemShift =
          parseScheduleHour(itemTime) >= 12 ? "siang" : "pagi";

        if (
          itemOrigin.includes(cleanOrigin) &&
          itemDest.includes(cleanDest) &&
          itemDate === travelDate &&
          (!itemTime || itemShift === shiftKey)
        ) {
          const seatList = item.selectedSeats || item.seats;
          if (Array.isArray(seatList)) {
            seatList.forEach((code: unknown) => {
              if (typeof code === "string" && ALL_HIACE_SEATS.includes(code)) {
                bookedCodes.add(code);
              }
            });
          }
        }
      }
      break;
    }
  } catch {
    // Abaikan jika localStorage dibatasi browser
  }

  return Array.from(bookedCodes);
}

// Susun daftar kursi abu-abu (bookedSeats) agar jumlah sisa kursi 100% sinkron dengan /search
function buildSyncedBookedSeats(
  seedText: string,
  totalCapacity: number,
  targetRemainingSeats: number,
  explicitBookedCodes: string[]
): string[] {
  const clampedRemaining = Math.max(
    0,
    Math.min(targetRemainingSeats, totalCapacity)
  );
  const targetBookedCount = Math.max(
    explicitBookedCodes.length,
    totalCapacity - clampedRemaining
  );

  if (targetBookedCount <= 0) return [];

  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    hash = (hash * 33 + seedText.charCodeAt(i)) >>> 0;
  }

  const offset = hash % ALL_HIACE_SEATS.length;
  const rotatedPool = [
    ...ALL_HIACE_SEATS.slice(offset),
    ...ALL_HIACE_SEATS.slice(0, offset),
  ];

  const result = new Set<string>(explicitBookedCodes);
  for (const seatCode of rotatedPool) {
    if (result.size >= targetBookedCount) break;
    result.add(seatCode);
  }

  return Array.from(result);
}

function getTimePeriodLabel(departureTime: string): "Pagi" | "Siang" {
  return parseScheduleHour(departureTime) >= 12 ? "Siang" : "Pagi";
}

function TripDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const originParam = searchParams.get("origin") || "Kota Sampit";
  const destinationParam =
    searchParams.get("destination") || "Kota Palangkaraya";
  const date = searchParams.get("date") || "2026-11-23";
  const shiftParam = (searchParams.get("shift") || "").toLowerCase();

  const currentRoute = findOrBuildRoute(originParam, destinationParam);
  const rawSchedules = getSchedulesForRoute(currentRoute.id, date);

  // Tampilkan jadwal sesuai shift yang diklik pengguna di /search (Siang saja atau Pagi saja)
  const activeSchedules = useMemo(() => {
    const hasAfternoon = rawSchedules.some(
      (s) => parseScheduleHour(s.departure_time) >= 12
    );

    const template = rawSchedules[0];
    const combinedSchedules = hasAfternoon
      ? [...rawSchedules]
      : [
          ...rawSchedules,
          {
            id: `${currentRoute.id}-${date}-1300`,
            route_id: currentRoute.id,
            departure_time: "13:00",
            arrival_time: computeArrivalTime(
              "13:00",
              currentRoute.duration_text || "3 jam 30 Menit"
            ),
            service_class: template?.service_class || "PREMIUM",
            total_seats: template?.total_seats || 8,
            booked_seats: [],
            priority_seats: template?.priority_seats || ["B", "E"],
          },
        ];

    if (shiftParam === "siang") {
      return combinedSchedules.filter(
        (s) => parseScheduleHour(s.departure_time) >= 12
      );
    }

    if (shiftParam === "pagi") {
      return combinedSchedules.filter(
        (s) => parseScheduleHour(s.departure_time) < 12
      );
    }

    return combinedSchedules;
  }, [rawSchedules, shiftParam, currentRoute, date]);

  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatShortCity = (cityName: string) =>
    cityName.replace(/^Kota\s+/i, "");

  const formatHariTanggal = (isoDate: string) => {
    try {
      const parsed = new Date(isoDate + "T00:00:00");
      return parsed.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Senin, 23 November 2026";
    }
  };

  const toggleSeat = (
    scheduleId: string,
    seatCode: string,
    lockedBookedSeats: string[]
  ) => {
    if (lockedBookedSeats.includes(seatCode)) return;

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
      alert("Silakan pilih minimal 1 kursi terlebih dahulu.");
      return;
    }
    setExpandedScheduleId(null);
  };

  const handleProceedCheckout = (scheduleId: string) => {
    const seats = selectedSeatsMap[scheduleId] || [];
    if (seats.length === 0) {
      alert("Silakan pilih minimal 1 kursi terlebih dahulu.");
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

    sessionStorage.setItem(
      "borneo_booking_draft",
      JSON.stringify(draftBooking)
    );
    router.push("/checkout");
  };

  return (
    <AppShell showBottomNav={false} darkHeaderIcon={true}>
      <div className="relative flex-1 bg-gradient-to-b from-[#9ED2BE] via-[#BCE3D3] to-[#74B49B] pt-14 pb-12 px-5 min-h-screen">
        {/* Background Kalimantan */}
        <img
          src="/images/bg utama.png"
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
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
              const totalCapacity = schedule.total_seats || 8;
              const periodLabel = getTimePeriodLabel(schedule.departure_time);
              const shiftKey: "pagi" | "siang" =
                periodLabel === "Siang" ? "siang" : "pagi";

              const baseTargetSeats = calculateShiftSeats(
                currentRoute.origin_city,
                currentRoute.destination_city,
                date,
                shiftKey,
                totalCapacity
              );

              const explicitBooked = mounted
                ? getUserBookedSeatCodes(
                    currentRoute.origin_city,
                    currentRoute.destination_city,
                    date,
                    shiftKey
                  )
                : [];

              const syncedBookedSeats = buildSyncedBookedSeats(
                `${currentRoute.id}-${date}-${schedule.departure_time}`,
                totalCapacity,
                baseTargetSeats,
                explicitBooked
              );

              const remainingSeats = Math.max(
                0,
                totalCapacity - syncedBookedSeats.length
              );
              const isScheduleFull = remainingSeats === 0;
              const isLowSeats = remainingSeats > 0 && remainingSeats <= 3;

              const isExpanded = expandedScheduleId === schedule.id;
              const selectedSeats = selectedSeatsMap[schedule.id] || [];
              const isAirportDrop = Boolean(airportDropMap[schedule.id]);
              const hasConfirmedSeats = selectedSeats.length > 0 && !isExpanded;

              return (
                <div key={schedule.id}>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.12)] ring-2 ring-[#15803D]/50">
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
                                e.currentTarget.style.display = "none";
                              }}
                              className="w-full h-full object-contain object-left scale-110"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <p className="text-[11px] font-extrabold text-gray-800">
                              {schedule.service_class}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                                periodLabel === "Siang"
                                  ? "bg-emerald-50 border-[#15803D] text-[#15803D]"
                                  : "bg-gray-100 border-gray-200 text-gray-700"
                              }`}
                            >
                              {periodLabel}
                            </span>
                            {isScheduleFull ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-[10px] font-extrabold">
                                <Ban className="w-3 h-3" />
                                Penuh
                              </span>
                            ) : isLowSeats ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                Sisa {remainingSeats} Kursi
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#15803D] text-[10px] font-extrabold">
                                Sisa {remainingSeats} Kursi
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <img
                            src="/images/logo BT green.png"
                            alt="Borneo Trans"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = "block";
                            }}
                            className="h-6 object-contain"
                          />
                          <p
                            style={{ display: "none" }}
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
                                ? "bg-[#15803D] justify-end"
                                : "bg-gray-300 justify-start"
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-white shadow" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-base font-extrabold text-[#8B1E24]">
                            Rp {currentRoute.base_price.toLocaleString("id-ID")}
                            <span className="text-xs font-semibold text-gray-500">
                              /Pax
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-500 mt-1.5">
                        *Drop bandara dikenai biaya tambah Rp{" "}
                        {currentRoute.airport_drop_fee.toLocaleString("id-ID")}
                      </p>

                      {/* Bagian Bawah Kartu: Pilih Kursi Anda / Edit Kursi + Lanjut */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
                        <div>
                          {isScheduleFull ? (
                            <span className="text-xs font-bold text-red-500">
                              Semua kursi sudah terisi
                            </span>
                          ) : (
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
                                  ? "Edit Kursi Anda"
                                  : "Pilih Kursi Anda"}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {selectedSeats.length > 0 && (
                            <p className="text-[11px] text-gray-600 mt-0.5">
                              Kursi Terpilih:{" "}
                              <span className="font-extrabold text-[#15803D]">
                                Seat {selectedSeats.join(", ")}
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

                  {/* Denah Kursi Toyota Hiace (Sinkron dengan jumlah sisa kursi) */}
                  {isExpanded && !isScheduleFull && (
                    <HiaceSeatMap
                      selectedSeats={selectedSeats}
                      onToggleSeat={(code) =>
                        toggleSeat(schedule.id, code, syncedBookedSeats)
                      }
                      bookedSeats={syncedBookedSeats}
                      prioritySeats={schedule.priority_seats || ["B", "E"]}
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