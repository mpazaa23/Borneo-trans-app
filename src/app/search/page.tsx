"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Calendar, Clock, Ban, AlertTriangle } from "lucide-react";
import AppShell from "@/components/AppShell";
import {
  REGIONAL_CITIES,
  findOrBuildRoute,
  getSchedulesForRoute,
} from "@/data/mockData";

// Sumber tunggal perhitungan sisa kursi berdasarkan rute, tanggal, dan shift ('pagi' | 'siang')
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
  const cappedAvailable = Math.min(baseAvailable, totalCapacity);

  // Kurangi otomatis jika user sudah memesan tiket pada rute, tanggal, & shift yang sama
  let userBookedCount = 0;
  if (typeof window !== "undefined") {
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
          const itemHour = parseInt(itemTime.split(":")[0] || "0", 10);
          const itemShift = itemHour >= 12 ? "siang" : "pagi";

          if (
            itemOrigin.includes(cleanOrigin) &&
            itemDest.includes(cleanDest) &&
            itemDate === travelDate &&
            (!itemTime || itemShift === shiftKey)
          ) {
            const seatList = item.selectedSeats || item.seats;
            const seatsCount = Array.isArray(seatList)
              ? seatList.length
              : Number(item.passengers || item.seat_count || 1);
            userBookedCount += seatsCount;
          }
        }
        break;
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  return Math.max(0, cappedAvailable - userBookedCount);
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(
    searchParams.get("origin") || "Kota Sampit"
  );
  const [destination, setDestination] = useState(
    searchParams.get("destination") || "Kota Palangkaraya"
  );
  const [date, setDate] = useState(searchParams.get("date") || "2026-11-23");
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const paramOrigin = searchParams.get("origin");
    const paramDest = searchParams.get("destination");
    const paramDate = searchParams.get("date");
    if (paramOrigin) setOrigin(paramOrigin);
    if (paramDest) setDestination(paramDest);
    if (paramDate) setDate(paramDate);
  }, [searchParams]);

  const handleToggleEdit = () => {
    if (isEditing) {
      if (origin === destination) {
        alert("Kota keberangkatan dan tujuan tidak boleh sama.");
        return;
      }
      const params = new URLSearchParams({ origin, destination, date });
      router.replace(`/search?${params.toString()}`);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const formatTanggalIndo = (isoDate: string) => {
    try {
      const parsed = new Date(isoDate + "T00:00:00");
      return parsed.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "23 November 2026";
    }
  };

  const formatShortCity = (cityName: string) =>
    cityName.replace(/^Kota\s+/i, "");

  const outboundRoute = findOrBuildRoute(origin, destination);
  const returnRoute = findOrBuildRoute(destination, origin);
  const displayedRoutes: Array<
    typeof outboundRoute & { tripLabel: string; shiftKey: "pagi" | "siang" }
  > = [
    { ...outboundRoute, tripLabel: "Pagi", shiftKey: "pagi" },
    { ...returnRoute, tripLabel: "Siang", shiftKey: "siang" },
  ];

  return (
    <AppShell showBottomNav={false} darkHeaderIcon={true}>
      <div className="relative flex-1 bg-gradient-to-b from-[#9ED2BE] via-[#BCE3D3] to-[#74B49B] pt-14 pb-10 px-5 min-h-screen">
        <img
          src="/images/bg-kalimantan.png"
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        />

        <div className="relative z-10 space-y-5">
          {/* Section 1: Detail Pencarian */}
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 mb-2.5 pl-7">
              Detail Pencarian
            </h1>

            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.1)] space-y-3">
              {/* Keberangkatan */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[11px] font-bold text-gray-800 mb-1">
                  Keberangkatan
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#15803D] shrink-0" />
                  {isEditing ? (
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full text-xs font-semibold text-gray-800 bg-emerald-50/80 rounded-lg px-2.5 py-1.5 border border-emerald-200 focus:outline-none"
                    >
                      {REGIONAL_CITIES.map((group) => (
                        <optgroup
                          key={group.province}
                          label={`── ${group.province} ──`}
                          className="font-bold text-[#15803D]"
                        >
                          {group.cities.map((c) => (
                            <option
                              key={c}
                              value={c}
                              className="font-medium text-gray-800"
                            >
                              {c}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold text-gray-800">
                      {origin}
                    </span>
                  )}
                </div>
              </div>

              {/* Tujuan */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[11px] font-bold text-gray-800 mb-1">
                  Tujuan
                </p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#15803D] shrink-0" />
                  {isEditing ? (
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full text-xs font-semibold text-gray-800 bg-emerald-50/80 rounded-lg px-2.5 py-1.5 border border-emerald-200 focus:outline-none"
                    >
                      {REGIONAL_CITIES.map((group) => (
                        <optgroup
                          key={group.province}
                          label={`── ${group.province} ──`}
                          className="font-bold text-[#15803D]"
                        >
                          {group.cities.map((c) => (
                            <option
                              key={c}
                              value={c}
                              className="font-medium text-gray-800"
                            >
                              {c}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold text-gray-800">
                      {destination}
                    </span>
                  )}
                </div>
              </div>

              {/* Tanggal */}
              <div className="border-b border-gray-200 pb-2">
                <p className="text-[11px] font-bold text-gray-800 mb-1">
                  Tanggal
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#15803D] shrink-0" />
                  {isEditing ? (
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs font-semibold text-gray-800 bg-emerald-50/80 rounded-lg px-2.5 py-1.5 border border-emerald-200 focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-800">
                      {formatTanggalIndo(date)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tombol Ubah / Simpan Pencarian */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleToggleEdit}
                  className="px-4 py-1.5 rounded-lg btn-borneo text-white text-[11px] font-bold shadow active:scale-95 transition"
                >
                  {isEditing ? "Simpan & Cari" : "Ubah Pencarian"}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Pilihan Rute */}
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 mb-3">
              Pilihan Rute
            </h2>

            <div className="space-y-4">
              {displayedRoutes.map((route, idx) => {
                const schedules = getSchedulesForRoute(route.id, date);
                const firstSchedule = schedules[0];
                const totalCapacity = firstSchedule?.total_seats || 8;

                const sisaKursi = mounted
                  ? calculateShiftSeats(
                      route.origin_city,
                      route.destination_city,
                      date,
                      route.shiftKey,
                      totalCapacity
                    )
                  : 5;

                const isFull = sisaKursi <= 0;
                const isLowSeats = sisaKursi > 0 && sisaKursi <= 3;

                return (
                  <div
                    key={`${route.id}-${idx}`}
                    onClick={() => {
                      if (isFull) return;
                      const params = new URLSearchParams({
                        origin: route.origin_city,
                        destination: route.destination_city,
                        date,
                        seats: String(sisaKursi),
                        shift: route.shiftKey,
                      });
                      router.push(`/trip-detail?${params.toString()}`);
                    }}
                    className={`bg-white rounded-3xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.12)] transition ${
                      isFull
                        ? "opacity-85 cursor-not-allowed ring-1 ring-red-200"
                        : "cursor-pointer hover:ring-2 hover:ring-[#15803D] active:scale-[0.99]"
                    }`}
                  >
                    {/* Foto Armada Toyota Hiace */}
                    <div className="h-44 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 flex items-center justify-center p-2 relative overflow-hidden">
                      <img
                        src="/images/logo travel.png"
                        alt="Toyota Hiace Borneo Trans"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                        className={`w-full h-40 object-contain scale-110 drop-shadow-md transition ${
                          isFull ? "grayscale opacity-60" : ""
                        }`}
                      />
                      <div
                        style={{ display: "none" }}
                        className="flex-col items-center justify-center text-center"
                      >
                        <div className="px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
                          <p className="text-base font-black italic text-[#15803D]">
                            Borneo<span className="text-gray-800">Trans</span>
                          </p>
                          <p className="text-[10px] font-semibold text-gray-500">
                            Toyota Hiace Commuter &bull; Executive Shuttle
                          </p>
                        </div>
                      </div>

                      {/* Overlay Badge Status Penuh */}
                      {isFull && (
                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold tracking-wide uppercase shadow-md flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          <span>Kuota Penuh</span>
                        </div>
                      )}
                    </div>

                    {/* Detail Rute, Jam & Harga */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                          {formatShortCity(route.origin_city)} -
                          <br />
                          {formatShortCity(route.destination_city)}
                        </h3>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${
                              idx === 0
                                ? "border-[#15803D] bg-emerald-50 text-[#15803D]"
                                : "border-gray-300 text-gray-500"
                            }`}
                          >
                            Pagi
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold ${
                              idx === 1
                                ? "border-[#15803D] bg-emerald-50 text-[#15803D]"
                                : "border-gray-300 text-gray-500"
                            }`}
                          >
                            Siang
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="flex items-center gap-2">
                            <span
                              className={
                                idx === 0 ? "font-bold text-[#15803D]" : ""
                              }
                            >
                              01.00
                            </span>
                            <span
                              className={
                                idx === 0 ? "font-bold text-[#15803D]" : ""
                              }
                            >
                              06.00
                            </span>
                            <span
                              className={
                                idx === 1 ? "font-bold text-[#15803D]" : ""
                              }
                            >
                              13.00
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatTanggalIndo(date)}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-3 pt-1">
                        {/* Indikator Status Kursi Dinamis */}
                        {isFull ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-extrabold">
                            <Ban className="w-3.5 h-3.5 shrink-0" />
                            <span>Kursi Penuh</span>
                          </div>
                        ) : isLowSeats ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Hampir Penuh &bull; Sisa {sisaKursi} Kursi</span>
                          </div>
                        ) : (
                          <span className="text-xs font-extrabold text-[#15803D]">
                            Sisa {sisaKursi} Kursi
                          </span>
                        )}

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">
                            Mulai dari
                          </p>
                          <p
                            className={`text-sm font-extrabold ${
                              isFull ? "text-gray-400" : "text-[#8B1E24]"
                            }`}
                          >
                            Rp {route.base_price.toLocaleString("id-ID")}
                            <span className="text-xs font-semibold text-gray-500">
                              /Pax
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function SearchRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen text-sm font-semibold text-[#1B4332]">
          Memuat pilihan rute...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}