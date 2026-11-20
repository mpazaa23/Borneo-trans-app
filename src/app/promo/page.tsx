'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Mic,
  Bookmark,
  Star,
  X,
  MapPin,
  CheckCircle2,
  Tag,
  Copy,
  Check,
  Compass,
  Calendar,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import BorneoVoiceModal from '@/components/BorneoVoiceModal';
import { REGIONAL_CITIES } from '@/data/mockData';

interface PromoItem {
  id: string;
  title: string;
  category: string;
  image: string;
  stars: number;
  rating: string;
  reviews: string;
  originalPrice: string;
  price: string;
  tag: string;
  promoCode: string;
  validUntil: string;
  city: string;
  defaultOrigin: string;
  description: string;
  inclusions: string[];
}

const PROMO_LIST: PromoItem[] = [
  {
    id: 'promo-1',
    title: 'Swiss-Belhotel Danum Palangka Raya',
    category: 'Paket Hotel + Travel',
    image: '/images/Hotel swiss.jpg',
    stars: 4,
    rating: '8.5/10',
    reviews: '3,3rb ulasan',
    originalPrice: 'Rp 3.450.000',
    price: 'Rp 2.990.423',
    tag: 'Best Price Promo',
    promoCode: 'SWISSBORNEO',
    validUntil: 'Berlaku s/d 30 November 2026',
    city: 'Kota Palangkaraya',
    defaultOrigin: 'Kota Sampit',
    description:
      'Nikmati paket menginap nyaman di hotel bintang 4 pusat Kota Palangka Raya lengkap dengan akses kolam renang, sarapan prasmanan, serta potongan harga perjalanan armada Borneo Trans.',
    inclusions: [
      'Menginap 2 Malam Deluxe Room',
      'Sarapan Pagi untuk 2 Orang',
      'Diskon Travel Antar-Jemput Borneo Trans',
    ],
  },
  {
    id: 'promo-2',
    title: 'Hotel Neo Palma - Palangkaraya',
    category: 'Paket Hotel + Travel',
    image: '/images/Hotel Neo.jpg',
    stars: 3,
    rating: '8.2/10',
    reviews: '2,3rb ulasan',
    originalPrice: 'Rp 2.850.000',
    price: 'Rp 2.490.423',
    tag: 'Best Price Promo',
    promoCode: 'NEOPALMA26',
    validUntil: 'Berlaku s/d 30 November 2026',
    city: 'Kota Palangkaraya',
    defaultOrigin: 'Kota Sampit',
    description:
      'Pilihan menginap modern strategis dekat Bundaran Besar Palangka Raya. Cocok untuk perjalanan bisnis maupun liburan singkat bersama layanan penjemputan langsung di lobi hotel.',
    inclusions: [
      'Menginap 2 Malam Superior Room',
      'Sarapan & Wi-Fi Kecepatan Tinggi',
      'Prioritas Drop-off Lobi Hotel',
    ],
  },
  {
    id: 'promo-3',
    title: 'Wisata Orangutan Kalimantan',
    category: 'Paket Wisata + Travel',
    image: '/images/Wisata Utan.jpg',
    stars: 4,
    rating: '8.5/10',
    reviews: '3,3rb ulasan',
    originalPrice: 'Rp 450.000',
    price: 'Rp 350.423',
    tag: 'Best Price Promo',
    promoCode: 'ORANGUTANTRIP',
    validUntil: 'Berlaku s/d 15 Desember 2026',
    city: 'Kota Pangkalan Bun',
    defaultOrigin: 'Kota Sampit',
    description:
      'Paket hemat eksplorasi ekowisata Taman Nasional Tanjung Puting untuk melihat langsung konservasi orangutan di habitat aslinya lengkap dengan koneksi travel darat ke Pangkalan Bun.',
    inclusions: [
      'Tiket Masuk Kawasan Ekowisata',
      'Pemandu Lokal & Dokumentasi',
      'Potongan Tarif Travel ke Pangkalan Bun',
    ],
  },
  {
    id: 'promo-4',
    title: 'Rumah Betang Khas Suku Dayak',
    category: 'Paket Budaya + Travel',
    image: '/images/Rumah Betang.jpg',
    stars: 4,
    rating: '8.5/10',
    reviews: '3,3rb ulasan',
    originalPrice: 'Rp 410.000',
    price: 'Rp 320.503',
    tag: 'Best Price Promo',
    promoCode: 'BETANGDAYAK',
    validUntil: 'Berlaku s/d 15 Desember 2026',
    city: 'Kota Palangkaraya',
    defaultOrigin: 'Kota Sampit',
    description:
      'Jelajahi kekayaan sejarah dan arsitektur rumah panjang tradisional suku Dayak lengkap dengan tur budaya, kerajinan ukir lokal, serta pengantaran pulang-pergi armada Borneo Trans.',
    inclusions: [
      'Tur Edukasi Budaya & Seni Ukir',
      'Camilan Tradisional Khas Kalimantan',
      'Antar-Jemput Door to Door Borneo Trans',
    ],
  },
];

const ROUTE_ESTIMATES: Record<string, { price: string; duration: string }> = {
  'Kota Sampit|Kota Palangkaraya': {
    price: 'Rp 175.000',
    duration: '± 3j 10m via darat',
  },
  'Kota Sampit|Kota Pangkalan Bun': {
    price: 'Rp 210.000',
    duration: '± 4j 30m via darat',
  },
  'Kota Palangkaraya|Kota Banjarmasin': {
    price: 'Rp 220.000',
    duration: '± 4j 30m via darat',
  },
  'Kota Samarinda|Kota Palangkaraya': {
    price: 'Rp 325.000',
    duration: '± 8j 30m lintas provinsi',
  },
  'Kota Samarinda|Kota Pangkalan Bun': {
    price: 'Rp 325.000',
    duration: '± 8j 30m lintas provinsi',
  },
};

function getDynamicRouteEstimate(fromCity: string, toCity: string) {
  if (fromCity === toCity) {
    return {
      price: 'Rp 85.000',
      duration: '± 45m antar-jemput dalam kota',
    };
  }

  const keyForward = `${fromCity}|${toCity}`;
  const keyReverse = `${toCity}|${fromCity}`;
  if (ROUTE_ESTIMATES[keyForward]) return ROUTE_ESTIMATES[keyForward];
  if (ROUTE_ESTIMATES[keyReverse]) return ROUTE_ESTIMATES[keyReverse];

  const fromProvince = REGIONAL_CITIES.find((g) =>
    g.cities.includes(fromCity)
  )?.province;
  const toProvince = REGIONAL_CITIES.find((g) =>
    g.cities.includes(toCity)
  )?.province;

  if (fromProvince && toProvince && fromProvince === toProvince) {
    return {
      price: 'Rp 195.000',
      duration: '± 4j 00m dalam provinsi',
    };
  }

  return {
    price: 'Rp 325.000',
    duration: '± 8j 30m lintas provinsi',
  };
}

function formatShortCity(city: string) {
  return city.replace(/^Kota\s+/i, '');
}

export default function PromoPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // State Pop-up Detail Promo
  const [selectedPromo, setSelectedPromo] = useState<PromoItem | null>(null);
  const [modalOrigin, setModalOrigin] = useState('Kota Sampit');
  const [modalDate, setModalDate] = useState('2026-11-20');
  const [copiedCode, setCopiedCode] = useState(false);

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenPromoModal = (item: PromoItem) => {
    setSelectedPromo(item);
    setModalOrigin(item.defaultOrigin);
    setModalDate('2026-11-20');
    setCopiedCode(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleProceedPromoBooking = (item: PromoItem) => {
    if (modalOrigin === item.city) {
      alert('Pilih kota keberangkatan yang berbeda dari kota lokasi promo.');
      return;
    }
    if (!modalDate) {
      alert('Silakan pilih tanggal keberangkatan terlebih dahulu.');
      return;
    }

    sessionStorage.setItem(
      'borneo_selected_promo',
      JSON.stringify({
        id: item.id,
        title: item.title,
        promoCode: item.promoCode,
        price: item.price,
      })
    );

    setSelectedPromo(null);
    const params = new URLSearchParams({
      origin: modalOrigin,
      destination: item.city,
      date: modalDate,
    });
    router.push(`/search?${params.toString()}`);
  };

  // Bersihkan kata sambung umum dari hasil suara (mis. "Ke Palangkaraya" -> "palangkaraya")
  const normalizedQuery = searchQuery
    .toLowerCase()
    .replace(/^(ke|cari|promo)\s+/i, '')
    .trim();

  const filteredPromos = PROMO_LIST.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.city.toLowerCase().includes(normalizedQuery) ||
      item.tag.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery)
  );

  const modalEstimate = selectedPromo
    ? getDynamicRouteEstimate(modalOrigin, selectedPromo.city)
    : null;

  return (
    <AppShell showBottomNav={true} darkHeaderIcon={true}>
      <div className="flex-1 relative min-h-screen bg-gradient-to-b from-[#74B49B] via-[#8EC5AD] to-[#A7D7C5] pt-16 pb-28 px-5 overflow-hidden">
        {/* Background Hutan Kalimantan */}
        <img
          src="/images/bg utama.png"
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90 pointer-events-none"
        />
        <div className="absolute inset-0 bg-emerald-950/15 pointer-events-none" />

        <div className="relative z-10">
          {/* Search Bar & Tombol Mic */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-md">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find places, food, trips.."
                className="w-full text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              aria-label="Pencarian Suara"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-md hover:text-[#15803D] active:scale-95 transition shrink-0"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Judul Halaman */}
          <div className="flex items-center justify-between mb-3.5">
            <h1 className="text-lg font-extrabold text-gray-900">
              Promo Untukmu
            </h1>
            <span className="text-[11px] font-semibold text-gray-800/80">
            </span>
          </div>

          {/* Grid Kartu Promo */}
          {filteredPromos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredPromos.map((item) => {
                const isSaved = bookmarkedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenPromoModal(item)}
                    className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.12)] cursor-pointer group flex flex-col hover:-translate-y-0.5 transition-all"
                  >
                    {/* Thumbnail Promo */}
                    <div className="relative h-32 bg-[#0B4635] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(e, item.id)}
                        aria-label="Simpan Promo"
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/95 flex items-center justify-center shadow hover:scale-105 transition"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isSaved
                              ? 'fill-[#15803D] text-[#15803D]'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Detail Kartu */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xs font-extrabold text-gray-900 leading-snug line-clamp-2">
                          {item.title}
                        </h2>

                        {/* Bintang */}
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: item.stars }).map((_, idx) => (
                            <Star
                              key={idx}
                              className="w-3 h-3 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>

                        {/* Rating & Ulasan */}
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          <span className="font-bold text-[#15803D]">
                            {item.rating}
                          </span>{' '}
                          &bull; {item.reviews}
                        </p>
                      </div>

                      {/* Harga & Label Promo */}
                      <div className="mt-2.5">
                        <p className="text-sm font-extrabold text-[#8B1E24]">
                          {item.price}
                        </p>
                        <p className="text-[10px] font-semibold text-[#15803D]">
                          {item.tag}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/95 rounded-2xl p-6 text-center shadow">
              <p className="text-xs font-bold text-gray-800">
                Promo &ldquo;{searchQuery}&rdquo; tidak ditemukan
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2.5 px-4 py-1.5 rounded-full btn-borneo text-white text-[11px] font-bold"
              >
                Tampilkan Semua Promo
              </button>
            </div>
          )}
        </div>

        {/* Pop-up Informasi Lengkap Promo */}
        {selectedPromo && modalEstimate && (
          <div
            onClick={() => setSelectedPromo(null)}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Header Gambar Promo */}
              <div className="relative h-48 bg-gradient-to-br from-[#0B4635] via-[#1B4332] to-[#081C15] shrink-0">
                <img
                  src={selectedPromo.image}
                  alt={selectedPromo.title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15" />

                {/* Badge Kategori & Tombol Tutup */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-[10px] font-extrabold text-[#15803D] shadow-xs">
                    {selectedPromo.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(e, selectedPromo.id)}
                      aria-label="Simpan Promo"
                      className="w-8 h-8 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center backdrop-blur-xs transition"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          bookmarkedIds.includes(selectedPromo.id)
                            ? 'fill-emerald-400 text-emerald-400'
                            : 'text-white'
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPromo(null)}
                      aria-label="Tutup detail promo"
                      className="w-8 h-8 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center backdrop-blur-xs transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rating & Judul Promo */}
                <div className="absolute bottom-3.5 inset-x-4 text-white">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: selectedPromo.stars }).map(
                        (_, idx) => (
                          <Star
                            key={idx}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        )
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-200">
                      {selectedPromo.rating} ({selectedPromo.reviews})
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold leading-tight">
                    {selectedPromo.title}
                  </h3>
                  <p className="text-[11px] text-emerald-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedPromo.city}</span>
                  </p>
                </div>
              </div>

              {/* Isi Detail Promo Scrollable */}
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Harga Paket & Kode Voucher */}
                <div className="flex items-center justify-between gap-2 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3">
                  <div>
                    <p className="text-[10px] text-gray-400 line-through">
                      {selectedPromo.originalPrice}
                    </p>
                    <p className="text-base font-extrabold text-[#8B1E24] leading-tight">
                      {selectedPromo.price}
                    </p>
                    <p className="text-[10px] font-semibold text-[#15803D] mt-0.5">
                      {selectedPromo.validUntil}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedPromo.promoCode)}
                    className="px-3 py-2 rounded-xl bg-white border border-dashed border-[#15803D] text-left hover:bg-emerald-50 transition shrink-0"
                  >
                    <span className="block text-[9px] text-gray-500 font-semibold">
                      Kode Promo
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#15803D] mt-0.5">
                      <Tag className="w-3 h-3" />
                      {selectedPromo.promoCode}
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Deskripsi Promo */}
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 mb-1">
                    Detail Penawaran Promo
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedPromo.description}
                  </p>
                </div>

                {/* Fasilitas yang Termasuk */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Keuntungan Paket
                  </h4>
                  <div className="space-y-1.5">
                    {selectedPromo.inclusions.map((inc) => (
                      <div
                        key={inc}
                        className="flex items-center gap-2 text-xs text-gray-700 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pengaturan Rute & Tanggal Travel Borneo Trans */}
                <div className="bg-[#F4F7F5] rounded-2xl p-3.5 border border-emerald-950/5 space-y-2.5">
                  <p className="text-[11px] font-extrabold text-gray-800">
                    Atur Perjalanan Travel ke Lokasi Promo
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="promo-origin-select"
                      className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#15803D]" />
                      Berangkat dari
                    </label>
                    <select
                      id="promo-origin-select"
                      value={modalOrigin}
                      onChange={(e) => setModalOrigin(e.target.value)}
                      className="bg-white border border-emerald-700/25 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#15803D] cursor-pointer max-w-[185px]"
                    >
                      {REGIONAL_CITIES.map((group) => (
                        <optgroup
                          key={group.province}
                          label={`── ${group.province} ──`}
                          className="font-bold text-[#15803D]"
                        >
                          {group.cities.map((city) => (
                            <option
                              key={city}
                              value={city}
                              className="font-medium text-gray-800"
                            >
                              {city}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="promo-date-input"
                      className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
                      Tanggal Berangkat
                    </label>
                    <input
                      id="promo-date-input"
                      type="date"
                      value={modalDate}
                      onChange={(e) => setModalDate(e.target.value)}
                      className="bg-white border border-emerald-700/25 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#15803D] cursor-pointer max-w-[185px]"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Rute ({modalEstimate.duration})
                    </span>
                    <span className="font-extrabold text-gray-800">
                      {formatShortCity(modalOrigin)} &rarr;{' '}
                      {formatShortCity(selectedPromo.city)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Estimasi Tiket Travel</span>
                    <span className="font-extrabold text-[#15803D]">
                      Mulai {modalEstimate.price} / kursi
                    </span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Utama */}
              <div className="p-4 pt-2 border-t border-gray-100 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => handleProceedPromoBooking(selectedPromo)}
                  className="w-full py-3 px-4 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-[0.99] transition"
                >
                  Cari Travel &amp; Gunakan Promo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Borneo Voice Assistant */}
        <BorneoVoiceModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onApplyText={(spoken) => setSearchQuery(spoken)}
          promptText="Mendengarkan... Sebutkan nama hotel, wisata, atau kota"
          sampleCommands={[
            'Palangkaraya',
            'Hotel',
            'Wisata Orangutan',
            'Rumah Betang',
          ]}
        />
      </div>
    </AppShell>
  );
}