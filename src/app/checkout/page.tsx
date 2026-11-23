"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Sparkles,
  MapPin,
  UserPlus,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  ArrowLeft,
  QrCode,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { BookingTicket } from "@/types/database";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface BookingDraft {
  routeId: string;
  scheduleId: string;
  originCity: string;
  destinationCity: string;
  originAddress: string;
  destinationAddress: string;
  date: string;
  formattedDate: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  airportDropFee: number;
  isAirportDrop: boolean;
  selectedSeats: string[];
}

interface SavedCoPassenger {
  id: string;
  name: string;
  relation: string;
}

const DEFAULT_DRAFT: BookingDraft = {
  routeId: "route-1",
  scheduleId: "sch-1",
  originCity: "Sampit",
  destinationCity: "Palangkaraya",
  originAddress: "Jl. S. Parman No. 28, Sampit",
  destinationAddress: "Jl. Kawitan I No. 68, Sidorejot",
  date: "2026-04-20",
  formattedDate: "Senin, 20 April 2026",
  departureTime: "01:00",
  arrivalTime: "03:10",
  basePrice: 175000,
  airportDropFee: 25000,
  isAirportDrop: true,
  selectedSeats: ["C", "G"],
};

const PAYMENT_GROUPS = [
  {
    group: "Transfer Bank VA",
    options: [
      {
        id: "BNI_VA",
        label: "BNI Virtual Account",
        badge: "BNI",
        logo: "/images/BNI.png",
        logoClass: "h-6 scale-125 origin-left",
        color: "text-orange-600",
      },
      {
        id: "BCA_VA",
        label: "BCA Virtual Account",
        badge: "BCA",
        logo: "/images/BCA.png",
        logoClass: "h-6 scale-135 origin-left",
        color: "text-blue-700",
      },
      {
        id: "BRI_VA",
        label: "BRI Virtual Account",
        badge: "BRI",
        logo: "/images/BRI.png",
        logoClass: "h-5 scale-95 origin-left",
        color: "text-blue-600",
      },
      {
        id: "MANDIRI_VA",
        label: "Mandiri Virtual Account",
        badge: "mandiri",
        logo: "/images/MANDIRI.png",
        logoClass: "h-6 scale-135 origin-left",
        color: "text-amber-600",
      },
    ],
  },
  {
    group: "Transfer Bank",
    options: [
      {
        id: "BNI_TF",
        label: "Bank BNI",
        badge: "BNI",
        logo: "/images/BNI.png",
        logoClass: "h-6 scale-125 origin-left",
        color: "text-orange-600",
      },
      {
        id: "BCA_TF",
        label: "Bank BCA",
        badge: "BCA",
        logo: "/images/BCA.png",
        logoClass: "h-6 scale-135 origin-left",
        color: "text-blue-700",
      },
      {
        id: "BRI_TF",
        label: "Bank BRI",
        badge: "BRI",
        logo: "/images/BRI.png",
        logoClass: "h-5 scale-95 origin-left",
        color: "text-blue-600",
      },
      {
        id: "MANDIRI_TF",
        label: "Bank Mandiri",
        badge: "mandiri",
        logo: "/images/MANDIRI.png",
        logoClass: "h-6 scale-135 origin-left",
        color: "text-amber-600",
      },
    ],
  },
  {
    group: "QRIS",
    options: [
      {
        id: "QRIS",
        label: "QRIS",
        badge: "QRIS",
        logo: "/images/logo-qris.png",
        logoClass: "h-6",
        color: "text-gray-900",
      },
    ],
  },
];

const PAYMENT_SIMULATION_INFO: Record<
  string,
  {
    type: "VA" | "TRANSFER" | "QRIS";
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    steps: string[];
  }
> = {
  BCA_VA: {
    type: "VA",
    bankName: "BCA Virtual Account",
    accountNumber: "3901 0812 8849 2104",
    accountHolder: "BORNEO TRANS TRAVEL",
    steps: [
      "Buka aplikasi BCA Mobile (m-BCA) atau myBCA.",
      "Pilih menu m-Transfer > BCA Virtual Account.",
      "Masukkan nomor Virtual Account di atas, lalu periksa rincian tagihan.",
      "Masukkan PIN m-BCA untuk menyelesaikan simulasi pembayaran.",
    ],
  },
  BNI_VA: {
    type: "VA",
    bankName: "BNI Virtual Account",
    accountNumber: "8808 0812 7731 9042",
    accountHolder: "BORNEO TRANS TRAVEL",
    steps: [
      "Buka aplikasi BNI Mobile Banking / wondr by BNI.",
      "Pilih menu Transfer > Virtual Account Billing.",
      "Tempel nomor Virtual Account di atas dan pastikan nominal sesuai.",
      "Konfirmasi transaksi dengan password transaksi.",
    ],
  },
  BRI_VA: {
    type: "VA",
    bankName: "BRI Virtual Account (BRIVA)",
    accountNumber: "1289 0081 2645 3310",
    accountHolder: "BORNEO TRANS TRAVEL",
    steps: [
      "Masuk ke aplikasi BRImo di ponselmu.",
      "Pilih menu Pembayaran > BRIVA.",
      "Masukkan nomor BRIVA di atas lalu tekan Lanjutkan.",
      "Periksa tagihan Borneo Trans dan masukkan PIN BRImo.",
    ],
  },
  MANDIRI_VA: {
    type: "VA",
    bankName: "Mandiri Virtual Account",
    accountNumber: "8950 8081 2993 4120",
    accountHolder: "BORNEO TRANS TRAVEL",
    steps: [
      "Buka aplikasi Livin’ by Mandiri.",
      'Pilih menu Bayar > Cari Penyedia Jasa "Borneo Trans" atau tempel kode VA.',
      "Periksa total nominal pembayaran yang muncul.",
      "Tekan Lanjut Bayar dan masukkan PIN Livin’.",
    ],
  },
  BCA_TF: {
    type: "TRANSFER",
    bankName: "Bank BCA",
    accountNumber: "8220 9148 77",
    accountHolder: "PT BORNEO TRANS NUSANTARA",
    steps: [
      "Masuk ke m-Banking atau ATM BCA.",
      "Pilih Transfer ke Rekening BCA dan masukkan nomor rekening tujuan.",
      "Masukkan nominal tepat sesuai Total Tagihan hingga 3 digit terakhir.",
      "Simpan bukti transfer lalu tekan tombol konfirmasi di bawah.",
    ],
  },
  BNI_TF: {
    type: "TRANSFER",
    bankName: "Bank BNI",
    accountNumber: "0948 1127 85",
    accountHolder: "PT BORNEO TRANS NUSANTARA",
    steps: [
      "Masuk ke BNI Mobile Banking atau ATM BNI.",
      "Pilih Transfer Antar Rekening BNI dan masukkan nomor rekening tujuan.",
      "Masukkan nominal tepat sesuai Total Tagihan.",
      "Selesaikan transfer lalu tekan tombol konfirmasi di bawah.",
    ],
  },
  BRI_TF: {
    type: "TRANSFER",
    bankName: "Bank BRI",
    accountNumber: "0341 0100 4829 305",
    accountHolder: "PT BORNEO TRANS NUSANTARA",
    steps: [
      "Masuk ke aplikasi BRImo atau ATM BRI.",
      "Pilih Transfer Sesama BRI dan masukkan nomor rekening tujuan.",
      "Masukkan nominal tepat sesuai Total Tagihan.",
      "Selesaikan transfer lalu tekan tombol konfirmasi di bawah.",
    ],
  },
  MANDIRI_TF: {
    type: "TRANSFER",
    bankName: "Bank Mandiri",
    accountNumber: "1480 0192 8471 2",
    accountHolder: "PT BORNEO TRANS NUSANTARA",
    steps: [
      "Masuk ke Livin’ by Mandiri atau ATM Mandiri.",
      "Pilih Transfer ke Rekening Mandiri dan masukkan nomor rekening tujuan.",
      "Masukkan nominal tepat sesuai Total Tagihan.",
      "Selesaikan transfer lalu tekan tombol konfirmasi di bawah.",
    ],
  },
  QRIS: {
    type: "QRIS",
    bankName: "QRIS Nasional (GPN / E-Wallet / Mobile Banking)",
    accountNumber: "ID1026094827104 • NMID BORNEOTRANS",
    accountHolder: "BORNEO TRANS TRAVEL",
    steps: [
      "Buka aplikasi m-Banking atau E-Wallet (GoPay, OVO, DANA, ShopeePay, BCA, BRI, Mandiri).",
      "Pilih menu Scan / Pindai QRIS.",
      "Arahkan kamera ke kode QR di atas (nominal otomatis terisi).",
      "Periksa nama merchant BORNEO TRANS TRAVEL lalu selesaikan pembayaran.",
    ],
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft>(DEFAULT_DRAFT);
  const [checkoutStep, setCheckoutStep] = useState<
    "form" | "payment" | "gateway"
  >("form");

  const [salutation, setSalutation] = useState("Tuan");
  const [bookerName, setBookerName] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [bookerPhone, setBookerPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [passengerNames, setPassengerNames] = useState<Record<string, string>>(
    {},
  );

  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [timezoneLabel, setTimezoneLabel] = useState<"WIB" | "WITA">("WITA");
  const [savedCoPassengers, setSavedCoPassengers] = useState<
    SavedCoPassenger[]
  >([]);

  const [showPaymentOptions, setShowPaymentOptions] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState("BCA_VA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<"account" | "amount" | null>(
    null,
  );
  const [secondsLeft, setSecondsLeft] = useState(3599);
  const [showGuideSteps, setShowGuideSteps] = useState(true);

  useEffect(() => {
    let activeDraft = DEFAULT_DRAFT;
    const savedDraft = sessionStorage.getItem("borneo_booking_draft");
    if (savedDraft) {
      try {
        activeDraft = JSON.parse(savedDraft);
        setDraft(activeDraft);
      } catch {
        // Gunakan default draft jika gagal parse
      }
    }

    let resolvedName = "";
    let resolvedEmail = "";
    let resolvedPhone = "";
    let resolvedPickup = "";
    let shouldAutoFill = false;
    let coPassengersList: SavedCoPassenger[] = [];

    try {
      const rawUser = localStorage.getItem("borneo_demo_user");
      const rawSettings = localStorage.getItem("borneo_user_settings");

      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const parsedSettings = rawSettings ? JSON.parse(rawSettings) : null;

      if (parsedSettings?.preferredTimezone) {
        setTimezoneLabel(parsedSettings.preferredTimezone);
      }

      if (parsedSettings?.defaultPaymentMethod) {
        setSelectedPayment(parsedSettings.defaultPaymentMethod);
      }

      if (Array.isArray(parsedSettings?.savedPassengers)) {
        coPassengersList = parsedSettings.savedPassengers;
        setSavedCoPassengers(coPassengersList);
      }

      shouldAutoFill = parsedSettings?.autoFillCheckout === true;

      if (shouldAutoFill && (parsedUser || parsedSettings)) {
        resolvedName =
          parsedUser?.name || parsedSettings?.name || "Penjelajah Borneo";
        resolvedEmail =
          parsedUser?.email ||
          parsedSettings?.email ||
          "traveler@borneotrans.id";
        resolvedPhone =
          parsedUser?.phone !== undefined
            ? parsedUser.phone
            : parsedSettings?.phone || "";
        resolvedPickup = parsedSettings?.favoritePickup?.trim() || "";

        setBookerName(resolvedName);
        setBookerEmail(resolvedEmail);
        setBookerPhone(resolvedPhone);
        setPickupAddress(resolvedPickup);
        setIsAutoFilled(true);
      } else {
        setBookerName("");
        setBookerEmail("");
        setBookerPhone("");
        setPickupAddress("");
        setIsAutoFilled(false);
      }
    } catch {
      setPickupAddress("");
      setIsAutoFilled(false);
    }

    const initialPassengers: Record<string, string> = {};
    activeDraft.selectedSeats.forEach((seat, idx) => {
      if (shouldAutoFill && idx === 0) {
        initialPassengers[seat] = resolvedName;
      } else if (shouldAutoFill && coPassengersList[idx - 1]) {
        initialPassengers[seat] = coPassengersList[idx - 1].name;
      } else {
        initialPassengers[seat] = "";
      }
    });
    setPassengerNames(initialPassengers);
  }, []);

  useEffect(() => {
    if (checkoutStep !== "gateway") return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [checkoutStep]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCopyText = (text: string, field: "account" | "amount") => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClearBookerForm = () => {
    setBookerName("");
    setBookerEmail("");
    setBookerPhone("");
    setPickupAddress("");
    setIsAutoFilled(false);
    if (draft.selectedSeats[0]) {
      setPassengerNames((prev) => ({
        ...prev,
        [draft.selectedSeats[0]]: "",
      }));
    }
  };

  const seatCount = draft.selectedSeats.length;
  const ticketSubtotal = seatCount * draft.basePrice;
  const airportDropTotal = draft.isAirportDrop ? draft.airportDropFee : 0;
  const adminFee = 2500;
  const grandTotal = ticketSubtotal + airportDropTotal + adminFee;

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookerName.trim() || !bookerEmail.trim() || !bookerPhone.trim()) {
      alert("Mohon lengkapi seluruh data pemesan terlebih dahulu.");
      return;
    }
    if (!pickupAddress.trim()) {
      alert("Mohon isi alamat titik jemput (Door to Door) terlebih dahulu.");
      return;
    }
    setCheckoutStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenGatewaySimulation = () => {
    setSecondsLeft(3599);
    setCheckoutStep("gateway");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const seatSuffix = draft.selectedSeats.join("");
      const ticketCode = `BRN26-${randomDigits}-${seatSuffix}`;
      const barcodeNumber = `012345${randomDigits}12345`;

      const passengersList = draft.selectedSeats.map((seat, idx) => ({
        seat_code: seat,
        passenger_name:
          passengerNames[seat]?.trim() ||
          (idx === 0 ? bookerName : `Penumpang Seat ${seat}`),
      }));

      const newTicket: BookingTicket = {
        id: crypto.randomUUID(),
        ticket_code: ticketCode,
        origin_city: draft.originCity,
        destination_city: draft.destinationCity,
        departure_date: draft.formattedDate,
        departure_time: draft.departureTime,
        arrival_time: draft.arrivalTime,
        booker_salutation: salutation,
        booker_name: bookerName,
        booker_email: bookerEmail,
        booker_phone: bookerPhone,
        is_airport_drop: draft.isAirportDrop,
        ticket_subtotal: ticketSubtotal,
        airport_drop_total: airportDropTotal,
        admin_fee: adminFee,
        total_amount: grandTotal,
        payment_method: selectedPayment,
        payment_status: "PAID",
        barcode_number: barcodeNumber,
        passengers: passengersList,
        created_at: new Date().toISOString(),
      };

      let activeUserId: string | null = null;

      if (isSupabaseConfigured && supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        activeUserId = user?.id ?? null;

        // Simpan ke Supabase HANYA jika user terautentikasi (memenuhi RLS auth.uid() = user_id)
        if (activeUserId) {
          const { data: bookingRow, error: insertError } = await supabase
            .from("bookings")
            .insert({
              user_id: activeUserId,
              ticket_code: ticketCode,
              origin_city: draft.originCity,
              destination_city: draft.destinationCity,
              departure_date: draft.formattedDate,
              departure_time: draft.departureTime,
              arrival_time: draft.arrivalTime,
              booker_salutation: salutation,
              booker_name: bookerName,
              booker_email: bookerEmail,
              booker_phone: bookerPhone,
              is_airport_drop: draft.isAirportDrop,
              ticket_subtotal: ticketSubtotal,
              airport_drop_total: airportDropTotal,
              admin_fee: adminFee,
              total_amount: grandTotal,
              payment_method: selectedPayment,
              payment_status: "PAID",
              barcode_number: barcodeNumber,
            })
            .select("id")
            .single();

          if (insertError) {
            console.error(
              "Supabase booking insert error:",
              insertError.message,
            );
          } else if (bookingRow?.id) {
            await supabase.from("booking_passengers").insert(
              passengersList.map((p) => ({
                booking_id: bookingRow.id,
                seat_code: p.seat_code,
                passenger_name: p.passenger_name,
              })),
            );
          }
        }
      }

      // Pisahkan penyimpanan lokal berdasarkan user_id agar tidak tercampur antar akun
      const ticketStorageKey = activeUserId
        ? `borneo_tickets_${activeUserId}`
        : "borneo_tickets_demo";

      const existingRaw = localStorage.getItem(ticketStorageKey);
      const existingTickets: BookingTicket[] = existingRaw
        ? JSON.parse(existingRaw)
        : [];
      localStorage.setItem(
        ticketStorageKey,
        JSON.stringify([newTicket, ...existingTickets]),
      );
      sessionStorage.setItem("borneo_latest_ticket", JSON.stringify(newTicket));

      router.push("/ticket-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentObj = PAYMENT_GROUPS.flatMap((g) => g.options).find(
    (o) => o.id === selectedPayment,
  );
  const selectedPaymentLabel =
    selectedPaymentObj?.label || "Pilih Metode Pembayaran";
  const gatewayInfo =
    PAYMENT_SIMULATION_INFO[selectedPayment] || PAYMENT_SIMULATION_INFO.BCA_VA;

  return (
    <AppShell showBottomNav={false} darkHeaderIcon={true}>
      <div className="relative flex-1 bg-gradient-to-b from-[#9ED2BE] via-[#BCE3D3] to-[#74B49B] pt-14 pb-12 px-5 min-h-screen">
        <img
          src="/images/bg utama.png"
          alt="Kalimantan"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
        />

        <div className="relative z-10 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-[#15803D] text-[10px] font-extrabold">
                  Berangkat
                </span>
                <span className="text-[11px] font-semibold text-gray-600">
                  {draft.formattedDate}
                </span>
              </div>

              <div className="flex items-center">
                <img
                  src="/images/Logo BT green.png"
                  alt="Borneo Trans"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "inline";
                  }}
                  className="h-6 object-contain"
                />
                <span
                  style={{ display: "none" }}
                  className="text-sm font-black italic text-[#15803D]"
                >
                  Borneo<span className="text-gray-800">Trans</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-sm font-extrabold text-gray-900">
                    {draft.originCity}
                  </p>
                  <p className="text-sm font-extrabold text-gray-900">
                    {draft.destinationCity}
                  </p>
                </div>
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-xs font-bold text-gray-600">
                {draft.departureTime} - {draft.arrivalTime} {timezoneLabel}
              </span>
            </div>

            {draft.isAirportDrop && (
              <p className="text-[10px] text-gray-400 mt-1">*Drop Bandara</p>
            )}

            {checkoutStep !== "form" && (
              <>
                <div className="mt-2.5 pt-2.5 border-t border-gray-200 space-y-2">
                  {draft.selectedSeats.map((seat) => (
                    <div key={seat} className="border-b border-gray-100 pb-1.5">
                      <p className="text-xs font-bold text-gray-800">
                        {passengerNames[seat] || bookerName}
                      </p>
                      <p className="text-[10px] text-gray-400">Seat {seat}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-xs font-bold text-gray-500">Total</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{seatCount}x</span>
                    <span className="text-sm font-extrabold text-[#8B1E24]">
                      Rp {ticketSubtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {checkoutStep === "form" ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-extrabold text-gray-900">
                  Data Pemesan
                </h1>
                {isAutoFilled && (
                  <button
                    type="button"
                    onClick={handleClearBookerForm}
                    className="text-[10px] font-bold text-[#15803D] bg-white/90 px-2.5 py-1 rounded-full shadow-xs hover:bg-white transition"
                  >
                    Pesan untuk orang lain?
                  </button>
                )}
              </div>

              <form
                onSubmit={handleNextToPayment}
                className="bg-white rounded-3xl p-5 shadow-[0_10px_28px_rgba(0,0,0,0.12)] space-y-3.5"
              >
                {isAutoFilled && (
                  <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 text-[11px] font-semibold text-[#15803D]">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Terisi otomatis dari Profil &amp; Pengaturan akunmu
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Sapaan
                  </label>
                  <select
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:border-[#15803D]"
                  >
                    <option value="Tuan">Mr</option>
                    <option value="Nyonya">Mrs</option>
                    <option value="Nona">Ms</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nama Pemesan
                  </label>
                  <input
                    type="text"
                    required
                    value={bookerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBookerName(val);
                      if (draft.selectedSeats[0]) {
                        setPassengerNames((prev) => ({
                          ...prev,
                          [draft.selectedSeats[0]]: val,
                        }));
                      }
                    }}
                    placeholder="Masukkan nama lengkap"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={bookerEmail}
                    onChange={(e) => setBookerEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    No Telepon
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookerPhone}
                    onChange={(e) => setBookerPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:border-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Titik Jemput (Door to Door)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#15803D] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Alamat lengkap penjemputan"
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs focus:outline-none focus:border-[#15803D]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2.5">
                  <p className="text-xs font-extrabold text-[#15803D]">
                    Data Penumpang ({seatCount} Kursi)
                  </p>
                  {draft.selectedSeats.map((seat, seatIdx) => (
                    <div key={seat} className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-gray-600">
                        Nama Penumpang — Seat {seat}
                      </label>
                      <input
                        type="text"
                        required
                        value={passengerNames[seat] || ""}
                        onChange={(e) =>
                          setPassengerNames((prev) => ({
                            ...prev,
                            [seat]: e.target.value,
                          }))
                        }
                        placeholder={`Nama penumpang kursi ${seat}`}
                        className="w-full h-10 px-3.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#15803D]"
                      />

                      {seatIdx > 0 && savedCoPassengers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-gray-400 inline-flex items-center gap-1">
                            <UserPlus className="w-3 h-3 text-[#15803D]" />
                            Pilih tersimpan:
                          </span>
                          {savedCoPassengers.map((person) => (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() =>
                                setPassengerNames((prev) => ({
                                  ...prev,
                                  [seat]: person.name,
                                }))
                              }
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                                passengerNames[seat] === person.name
                                  ? "bg-[#15803D] text-white border-[#15803D]"
                                  : "bg-emerald-50 text-[#15803D] border-emerald-200 hover:bg-emerald-100"
                              }`}
                            >
                              {person.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-95 transition"
                  >
                    Lanjut
                  </button>
                </div>
              </form>
            </div>
          ) : checkoutStep === "payment" ? (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-xs font-extrabold text-gray-900 mb-2.5">
                  Metode Pembayaran
                </p>
                <button
                  type="button"
                  onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                  className="w-full py-3 px-4 rounded-xl btn-borneo text-white text-xs font-bold flex items-center justify-between shadow"
                >
                  <span>{selectedPaymentLabel}</span>
                  {showPaymentOptions ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>

              {showPaymentOptions && (
                <div className="bg-white rounded-3xl p-5 shadow-[0_10px_28px_rgba(0,0,0,0.12)] space-y-4">
                  <h2 className="text-base font-extrabold text-gray-900">
                    Pilih Metode Pembayaran
                  </h2>

                  {PAYMENT_GROUPS.map((group) => (
                    <div key={group.group} className="space-y-2">
                      <p className="text-xs font-bold text-gray-700">
                        {group.group}
                      </p>
                      <div className="space-y-2">
                        {group.options.map((opt) => {
                          const active = selectedPayment === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedPayment(opt.id)}
                              className={`w-full px-3.5 py-3 rounded-xl border flex items-center justify-between transition ${
                                active
                                  ? "border-[#15803D] bg-emerald-50/60 shadow-xs"
                                  : "border-gray-200 bg-white hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-8 flex items-center justify-start shrink-0">
                                  <img
                                    src={opt.logo}
                                    alt={opt.badge}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const fallback = e.currentTarget
                                        .nextElementSibling as HTMLElement;
                                      if (fallback)
                                        fallback.style.display = "inline";
                                    }}
                                    className={`w-auto max-w-[64px] object-contain ${opt.logoClass}`}
                                  />
                                  <span
                                    style={{ display: "none" }}
                                    className={`text-left text-[11px] font-black tracking-tight ${opt.color}`}
                                  >
                                    {opt.badge}
                                  </span>
                                </div>
                                <span className="text-xs font-semibold text-gray-800">
                                  {opt.label}
                                </span>
                              </div>

                              <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  active
                                    ? "border-[#15803D]"
                                    : "border-gray-400"
                                }`}
                              >
                                {active && (
                                  <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white rounded-3xl p-5 shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
                <h2 className="text-base font-extrabold text-gray-900 mb-3">
                  Rincian Tagihan
                </h2>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>
                      Tiket Travel{" "}
                      <strong className="ml-2 text-gray-500">
                        {seatCount} x
                      </strong>
                    </span>
                    <span className="font-bold">
                      Rp {ticketSubtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {draft.isAirportDrop && (
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Drop Bandara</span>
                      <span className="font-bold">
                        Rp {airportDropTotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-700 pb-3 border-b border-gray-200">
                    <span>Biaya Admin</span>
                    <span className="font-bold">
                      Rp {adminFee.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-sm font-extrabold text-gray-900">
                    <span>Total</span>
                    <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenGatewaySimulation}
                className="w-full py-3 rounded-xl btn-borneo text-white text-sm font-bold shadow-lg active:scale-[0.99] transition"
              >
                Bayar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("payment")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ganti Metode</span>
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Batas Bayar {formatCountdown(secondsLeft)}</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-[0_10px_28px_rgba(0,0,0,0.12)] space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-[#15803D] text-[10px] font-extrabold mb-1">
                      Simulasi Payment Gateway
                    </span>
                    <h2 className="text-sm font-extrabold text-gray-900">
                      {gatewayInfo.bankName}
                    </h2>
                  </div>

                  {selectedPaymentObj && (
                    <img
                      src={selectedPaymentObj.logo}
                      alt={selectedPaymentObj.badge}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      className="h-7 w-auto object-contain"
                    />
                  )}
                </div>

                {gatewayInfo.type === "QRIS" ? (
                  <div className="flex flex-col items-center text-center py-2 space-y-3">
                    <div className="p-4 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-inner flex flex-col items-center">
                      <div className="w-44 h-44 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center relative">
                        <QrCode className="w-36 h-36 text-gray-900 stroke-[1.6]" />
                        <span className="absolute px-2 py-0.5 rounded bg-[#15803D] text-white text-[9px] font-black tracking-wider">
                          QRIS
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 mt-2">
                        {gatewayInfo.accountHolder}
                      </p>
                      <p className="text-[9px] text-gray-400">
                        {gatewayInfo.accountNumber}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500 max-w-[260px]">
                      Pindai kode QRIS di atas melalui aplikasi m-Banking atau
                      E-Wallet pilihanmu.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#F4F7F5] border border-gray-200/80">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {gatewayInfo.type === "VA"
                          ? "Nomor Virtual Account"
                          : "Nomor Rekening Tujuan"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-base font-black tracking-wider text-gray-900">
                          {gatewayInfo.accountNumber}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyText(
                              gatewayInfo.accountNumber.replace(/\s+/g, ""),
                              "account",
                            )
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-[#15803D] inline-flex items-center gap-1 shadow-2xs active:scale-95 transition"
                        >
                          {copiedField === "account" ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-500 mt-1">
                        a.n. {gatewayInfo.accountHolder}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-600">
                      Total Pembayaran
                    </p>
                    <p className="text-base font-extrabold text-[#15803D]">
                      Rp {grandTotal.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(String(grandTotal), "amount")}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-bold text-[#15803D] inline-flex items-center gap-1 shadow-2xs active:scale-95 transition"
                  >
                    {copiedField === "amount" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nominal</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowGuideSteps((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-extrabold text-gray-800"
                  >
                    <span>Panduan Cara Pembayaran</span>
                    {showGuideSteps ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {showGuideSteps && (
                    <ol className="mt-2.5 space-y-2 text-[11px] text-gray-600 list-decimal list-inside">
                      {gatewayInfo.steps.map((stepText, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {stepText}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 rounded-xl btn-borneo text-white text-xs font-extrabold shadow-lg active:scale-[0.99] transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? "Memverifikasi Pembayaran..."
                      : "Saya Sudah Bayar (Simulasi Berhasil)"}
                  </span>
                </button>
                <p className="text-[10px] text-center text-white/90 font-medium drop-shadow-xs">
                  Mode simulasi: menekan tombol di atas akan langsung
                  menerbitkan E-Ticket.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
