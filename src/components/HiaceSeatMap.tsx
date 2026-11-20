'use client';

import React, { useState } from 'react';
import { Armchair } from 'lucide-react';

interface HiaceSeatMapProps {
  selectedSeats: string[];
  onToggleSeat: (seatCode: string) => void;
  bookedSeats: string[];
  prioritySeats: string[];
  onConfirm: () => void;
}

interface SeatPosition {
  code: string;
  top: string;
  left: string;
  width: string;
  height: string;
}

// Koordinat presisi tiap kursi mengikuti posisi jok pada gambar hiace-top.png
const SEAT_POSITIONS: SeatPosition[] = [
  { code: 'H', top: '69.5%', left: '36%', width: '10%', height: '18.5%' },
  { code: 'A', top: '29.5%', left: '49%', width: '12.5%', height: '19%' },
  { code: 'D', top: '69.5%', left: '49%', width: '12.5%', height: '19%' },
  { code: 'B', top: '29.5%', left: '65.2%', width: '12.5%', height: '19%' },
  { code: 'E', top: '69.5%', left: '65.2%', width: '12.5%', height: '19%' },
  { code: 'C', top: '27.5%', left: '84%', width: '12%', height: '17.5%' },
  { code: 'G', top: '48.5%', left: '84%', width: '12%', height: '17.5%' },
  { code: 'F', top: '69.5%', left: '84%', width: '12%', height: '17.5%' },
];

export default function HiaceSeatMap({
  selectedSeats,
  onToggleSeat,
  bookedSeats,
  prioritySeats,
  onConfirm,
}: HiaceSeatMapProps) {
  const [recentSeat, setRecentSeat] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleSeatClick = (code: string) => {
    setRecentSeat(code);
    onToggleSeat(code);
    setTimeout(() => {
      setRecentSeat((prev) => (prev === code ? null : prev));
    }, 320);
  };

  const getSeatVisualClass = (code: string) => {
    if (bookedSeats.includes(code)) {
      return 'bg-[#6B7280]/92 border-b-[3px] border-[#374151] text-white cursor-not-allowed opacity-95';
    }
    if (selectedSeats.includes(code)) {
      return 'bg-[#15803D] border-b-[3px] border-[#052E16] text-white ring-2 ring-emerald-300 shadow-[0_6px_16px_rgba(21,128,61,0.75)] -translate-y-0.5 scale-105';
    }
    if (prioritySeats.includes(code)) {
      return 'bg-[#1D4ED8]/92 border-b-[3px] border-[#1E3A8A] text-white hover:bg-[#1D4ED8] hover:scale-105 shadow-[0_3px_8px_rgba(29,78,216,0.45)]';
    }
    return 'bg-[#8B1E24]/92 border-b-[3px] border-[#4C0D11] text-white hover:bg-[#8B1E24] hover:scale-105 shadow-[0_3px_8px_rgba(139,30,36,0.45)]';
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] mt-4 animate-seat-card-in">
      {/* Animasi Keyframes Khusus Denah 3D */}
      <style jsx>{`
        @keyframes seatCardIn {
          0% {
            opacity: 0;
            transform: translateY(-12px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes vanGlideIn {
          0% {
            opacity: 0;
            transform: perspective(700px) rotateX(14deg) translateX(-14px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: perspective(700px) rotateX(0deg) translateX(0) scale(1);
          }
        }
        @keyframes seatPop {
          0% {
            transform: translate(-50%, -50%) scale(0.86);
          }
          55% {
            transform: translate(-50%, -56%) scale(1.14);
          }
          100% {
            transform: translate(-50%, -52%) scale(1.05);
          }
        }
        .animate-seat-card-in {
          animation: seatCardIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-van-glide {
          animation: vanGlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-seat-pop {
          animation: seatPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      {/* Header Armada */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-gray-900">
            Toyota Hiace Commuter
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <Armchair className="w-4 h-4 text-gray-700" />
            <span className="font-medium">8 Seat &bull; 3D Cabin View</span>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold text-[#15803D]">
            {selectedSeats.length} Kursi Dipilih
          </span>
        )}
      </div>

      {/* Kontainer Mobil Toyota Hiace 3D */}
      <div className="relative mx-auto w-full max-w-[350px] my-4 select-none animate-van-glide">
        <div className="relative w-full aspect-[2/1] flex items-center justify-center">
          {!imgError ? (
            <img
              src="/images/Seat 3D.png"
              alt="Toyota Hiace 3D Top View"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] pointer-events-none"
            />
          ) : (
            /* Fallback Bodi 3D jika file hiace-top.png belum ditaruh di public/images */
            <div className="w-full h-full rounded-l-[64px] rounded-r-[28px] bg-gradient-to-b from-gray-100 via-white to-gray-200 border-2 border-gray-300 shadow-inner flex items-center pl-4">
              <span className="-rotate-90 text-[10px] font-black italic text-[#15803D]">
                BorneoTrans
              </span>
            </div>
          )}

          {/* Overlay 8 Kursi Interaktif 3D */}
          {SEAT_POSITIONS.map((seat) => {
            const isBooked = bookedSeats.includes(seat.code);
            const isSelected = selectedSeats.includes(seat.code);
            const isPopping = recentSeat === seat.code;

            return (
              <button
                key={seat.code}
                type="button"
                disabled={isBooked}
                onClick={() => handleSeatClick(seat.code)}
                aria-label={`Kursi ${seat.code}`}
                style={{
                  top: seat.top,
                  left: seat.left,
                  width: seat.width,
                  height: seat.height,
                  transform: isSelected
                    ? 'translate(-50%, -53%) scale(1.06)'
                    : 'translate(-50%, -50%)',
                }}
                className={`absolute rounded-lg font-extrabold text-[11px] flex items-center justify-center transition-all duration-200 backdrop-blur-[1px] ${getSeatVisualClass(
                  seat.code
                )} ${isPopping ? 'animate-seat-pop' : ''}`}
              >
                <span className="drop-shadow-xs">{seat.code}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legenda 4 Status Warna Kursi */}
      <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 mt-3 mb-5 text-[11px] font-semibold text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-6 h-4 rounded bg-[#15803D] shadow-xs shrink-0" />
          <span>Kursi Terpilih</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-4 rounded bg-[#8B1E24] shadow-xs shrink-0" />
          <span>Kursi masih kosong</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-4 rounded bg-[#1D4ED8] shadow-xs shrink-0" />
          <span>Kursi Prioritas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-4 rounded bg-[#6B7280] shadow-xs shrink-0" />
          <span>Kursi sudah dipesan</span>
        </div>
      </div>

      {/* Tombol Konfirmasi */}
      <button
        type="button"
        onClick={onConfirm}
        className="w-full py-2.5 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-[0.99] transition"
      >
        Konfirmasi
      </button>
    </div>
  );
}