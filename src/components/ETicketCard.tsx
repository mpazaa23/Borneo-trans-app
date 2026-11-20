'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BookingTicket } from '@/types/database';

interface ETicketCardProps {
  ticket: BookingTicket;
  ticketRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ETicketCard({ ticket, ticketRef }: ETicketCardProps) {
  // Pola batang barcode visual yang tajam dan aman saat di-export menjadi PNG
  const barcodeBars = [
    3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 2, 3, 1, 1, 4,
    2, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3,
  ];

  return (
    <div
      ref={ticketRef}
      className="relative bg-[#FAF8F5] rounded-3xl shadow-[0_12px_32px_rgba(0,0,0,0.16)] overflow-hidden border border-stone-200/80"
    >
      {/* Lekukan Perforasi Kiri & Kanan */}
      <div className="absolute -left-3.5 top-[69%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#87BFA8] shadow-inner z-10" />
      <div className="absolute -right-3.5 top-[69%] -translate-y-1/2 w-7 h-7 rounded-full bg-[#87BFA8] shadow-inner z-10" />

      {/* Bagian Atas Tiket */}
      <div className="px-6 pt-6 pb-5">
        {/* Header: E-Ticket & Logo Borneo Trans */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-bold text-gray-500 border-b border-dashed border-gray-400 pb-0.5">
            E - Ticket
          </span>
          <div className="text-right">
            <img
              src="/images/logo BT green.png"
              alt="Borneo Trans"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
              className="h-7 object-contain"
            />
            <span
              style={{ display: 'none' }}
              className="text-base font-black italic text-[#15803D]"
            >
              Borneo<span className="text-gray-800">Trans</span>
            </span>
          </div>
        </div>

        {/* Rute Keberangkatan -> Tujuan */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-gray-300/80">
          <span className="text-lg font-extrabold text-gray-900">
            {ticket.origin_city}
          </span>
          <ArrowRight className="w-5 h-5 text-gray-500 shrink-0" />
          <span className="text-lg font-extrabold text-gray-900 text-right">
            {ticket.destination_city}
          </span>
        </div>

        {/* Tanggal & Jam Berangkat */}
        <div className="flex items-start justify-between py-3.5 border-b border-gray-300/80">
          <div>
            <p className="text-[11px] font-semibold text-gray-400">Tanggal</p>
            <p className="text-xs font-extrabold text-gray-900 mt-0.5">
              {ticket.departure_date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-gray-400">Berangkat</p>
            <p className="text-xs font-extrabold text-gray-900 mt-0.5">
              {ticket.departure_time.replace(':', '.')} WITA
            </p>
          </div>
        </div>

        {/* Daftar Penumpang & Kursi */}
        <div className="py-3.5 border-b border-gray-300/80 space-y-2.5">
          {ticket.passengers.map((p, idx) => (
            <div key={idx}>
              <p className="text-sm font-bold text-gray-800 leading-tight">
                {p.passenger_name}
              </p>
              <p className="text-[11px] font-semibold text-gray-400">
                Seat {p.seat_code}
              </p>
            </div>
          ))}
        </div>

        {/* ID Ticket */}
        <div className="pt-3.5">
          <p className="text-[11px] font-semibold text-gray-400">ID Ticket</p>
          <p className="text-base font-extrabold tracking-wide text-gray-900 mt-0.5">
            {ticket.ticket_code}
          </p>
        </div>
      </div>

      {/* Garis Putus-Putus Pemisah Sobekan */}
      <div className="px-6">
        <div className="border-t-2 border-dashed border-[#87BFA8]" />
      </div>

      {/* Bagian Bawah: Nomor & Barcode */}
      <div className="px-6 pt-4 pb-6 flex flex-col items-center justify-center">
        <p className="text-[10px] font-mono tracking-widest text-gray-600 mb-1.5">
          {ticket.barcode_number}
        </p>
        <svg
          viewBox="0 0 180 48"
          className="w-44 h-12"
          aria-label="Barcode Tiket"
        >
          {(() => {
            let currentX = 4;
            return barcodeBars.map((width, index) => {
              const xPos = currentX;
              currentX += width + (index % 2 === 0 ? 1.5 : 2.2);
              return (
                <rect
                  key={index}
                  x={xPos}
                  y={2}
                  width={width}
                  height={44}
                  fill="#1F2937"
                />
              );
            });
          })()}
        </svg>
      </div>
    </div>
  );
}