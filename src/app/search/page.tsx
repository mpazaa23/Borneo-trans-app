"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Calendar, Clock } from "lucide-react";
import AppShell from "@/components/AppShell";
import {
  REGIONAL_CITIES,
  findOrBuildRoute,
  getSchedulesForRoute,
} from "@/data/mockData";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(
    searchParams.get("origin") || "Kota Sampit",
  );
  const [destination, setDestination] = useState(
    searchParams.get("destination") || "Kota Palangkaraya",
  );
  const [date, setDate] = useState(searchParams.get("date") || "2026-04-20");
  const [isEditing, setIsEditing] = useState(false);

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
      return "20 April 2026";
    }
  };

  const formatShortCity = (cityName: string) =>
    cityName.replace(/^Kota\s+/i, "");

  const outboundRoute = findOrBuildRoute(origin, destination);
  const returnRoute = findOrBuildRoute(destination, origin);
  const displayedRoutes = [
    { ...outboundRoute, tripLabel: "Pagi", remainingSeats: 7 },
    { ...returnRoute, tripLabel: "Siang", remainingSeats: 4 },
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
                const sisaKursi = firstSchedule
                  ? firstSchedule.total_seats -
                    (firstSchedule.booked_seats?.length || 0)
                  : route.remainingSeats;

                return (
                  <div
                    key={`${route.id}-${idx}`}
                    onClick={() => {
                      const params = new URLSearchParams({
                        origin: route.origin_city,
                        destination: route.destination_city,
                        date,
                      });
                      router.push(`/trip-detail?${params.toString()}`);
                    }}
                    className="bg-white rounded-3xl overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.12)] cursor-pointer hover:ring-2 hover:ring-[#15803D] transition active:scale-[0.99]"
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
                        className="w-full h-40 object-contain scale-110 drop-shadow-md"
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
                            className={`px-2.5 py-0.5 rounded-md border border-gray-300 text-[10px] font-bold ${
                              idx === 0 ? "text-[#15803D]" : "text-gray-500"
                            }`}
                          >
                            Pagi
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md border border-gray-300 text-[10px] font-bold ${
                              idx === 1 ? "text-[#15803D]" : "text-gray-500"
                            }`}
                          >
                            Siang
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 text-[11px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>01.00 &nbsp; 06.00 &nbsp; 13.00</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatTanggalIndo(date)}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-3 pt-1">
                        <span className="text-xs font-extrabold text-[#15803D]">
                          Sisa {sisaKursi} Kursi
                        </span>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">
                            Mulai dari
                          </p>
                          <p className="text-sm font-extrabold text-[#8B1E24]">
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
