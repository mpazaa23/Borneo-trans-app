'use client';

import React, { useState,useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Mic,
  MapPin,
  Calendar,
  Star,
  X,
  CarFront,
  ShieldCheck,
  Plane,
  Headphones,
  ArrowRight,
  Sparkles,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import BorneoVoiceModal from '@/components/BorneoVoiceModal';
import { CITIES, REGIONAL_CITIES } from '@/data/mockData';

const SERVICE_HIGHLIGHTS = [
  {
    icon: CarFront,
    title: 'Hiace Premio',
    subtitle: 'Kabin armada lega',
  },
  {
    icon: ShieldCheck,
    title: 'Door to Door',
    subtitle: 'Antar jemput',
  },
  {
    icon: Plane,
    title: 'Drop Bandara',
    subtitle: 'Tepat waktu',
  },
  {
    icon: Headphones,
    title: 'CS 24 Jam',
    subtitle: 'Siap Melayani',
  },
];

interface TopDestinationItem {
  id: string;
  title: string;
  location: string;
  category: string;
  image: string;
  rating: string;
  reviews: string;
  bestTime: string;
  description: string;
  highlights: string[];
  defaultOrigin: string;
  destination: string;
  gradient: string;
}

const TOP_DESTINATIONS: TopDestinationItem[] = [
  {
    id: 'tanjung-puting',
    title: 'Taman Nasional Tanjung Puting',
    location: 'Kotawaringin Barat, Kalimantan Tengah',
    category: 'Ekowisata & Satwa',
    image: '/images/Taman Nasional Tanjung Puting.jpg',
    rating: '4.9',
    reviews: '1,8rb ulasan',
    bestTime: '08.00 – 16.00 WIB',
    description:
      'Kawasan konservasi orangutan terbesar di dunia yang terkenal dengan wisata susur Sungai Sekonyer menggunakan perahu klotok tradisional menuju Camp Leakey.',
    highlights: ['Observasi Orangutan', 'Susur Sungai Klotok', 'Camp Leakey'],
    defaultOrigin: 'Kota Sampit',
    destination: 'Kota Pangkalan Bun',
    gradient: 'from-[#0F5132] via-[#1B4332] to-[#081C15]',
  },
  {
    id: 'pasar-terapung',
    title: 'Pasar Terapung Lok Baintan',
    location: 'Kab. Banjar, Kalimantan Selatan',
    category: 'Budaya & Kuliner',
    image: '/images/Pasar Terapung.jpg',
    rating: '4.8',
    reviews: '2,1rb ulasan',
    bestTime: '06.00 – 09.00 WITA',
    description:
      'Pasar tradisional di atas aliran Sungai Martapura di mana para pedagang menjajakan hasil kebun, kue khas Banjar, dan soto Banjar langsung dari atas jukung (perahu kayu).',
    highlights: ['Kuliner Soto Banjar', 'Wisata Jukung Pagi', 'Foto Sunrise Sungai'],
    defaultOrigin: 'Kota Palangkaraya',
    destination: 'Kota Banjarmasin',
    gradient: 'from-[#7C2D12] via-[#9A3412] to-[#431407]',
  },
  {
    id: 'bundaran-besar',
    title: 'Menara Bundaran Besar',
    location: 'Kota Palangka Raya, Kalimantan Tengah',
    category: 'Ikon & Landmark Kota',
    image: '/images/Bundaran Besar.jpg',
    rating: '4.7',
    reviews: '1,4rb ulasan',
    bestTime: '17.00 – 22.00 WIB',
    description:
      'Ikon arsitektur modern di jantung Kota Cantik Palangka Raya dengan taman kota luas, air mancur, dan pencahayaan artistik yang memukau saat malam hari.',
    highlights: ['Panorama Lampu Malam', 'Spot Foto Ikonik', 'Pusat Kuliner Kota'],
    defaultOrigin: 'Kota Sampit',
    destination: 'Kota Palangkaraya',
    gradient: 'from-[#1E1B4B] via-[#312E81] to-[#4C1D95]',
  },
  {
    id: 'derawan',
    title: 'Kepulauan Derawan',
    location: 'Kab. Berau, Kalimantan Timur',
    category: 'Wisata Bahari',
    image: '/images/Above.jpg',
    rating: '4.9',
    reviews: '2,6rb ulasan',
    bestTime: '07.00 – 17.00 WITA',
    description:
      'Surga bahari Kalimantan Timur dengan pasir putih, air laut jernih berwarna toska, penginapan di atas air, serta habitat penyu hijau dan terumbu karang eksotis.',
    highlights: ['Snorkeling Terumbu Karang', 'Konservasi Penyu', 'Villa Atas Air'],
    defaultOrigin: 'Kota Samarinda',
    destination: 'Kota Balikpapan',
    gradient: 'from-[#0C4A6E] via-[#0369A1] to-[#082F49]',
  },
];

const POPULAR_ROUTES = [
  {
    origin: 'Kota Sampit',
    destination: 'Kota Palangkaraya',
    labelFrom: 'Sampit',
    labelTo: 'Palangkaraya',
    price: 'Rp 175rb',
    duration: '3j 10m',
  },
  {
    origin: 'Kota Palangkaraya',
    destination: 'Kota Banjarmasin',
    labelFrom: 'Palangkaraya',
    labelTo: 'Banjarmasin',
    price: 'Rp 220rb',
    duration: '4j 30m',
  },
  {
    origin: 'Kota Samarinda',
    destination: 'Kota Balikpapan',
    labelFrom: 'Samarinda',
    labelTo: 'Balikpapan',
    price: 'Rp 150rb',
    duration: '2j 15m',
  },
  {
    origin: 'Kota Pontianak',
    destination: 'Kota Singkawang',
    labelFrom: 'Pontianak',
    labelTo: 'Singkawang',
    price: 'Rp 140rb',
    duration: '3j 00m',
  },
];

// Tarif & durasi diselaraskan dengan data pencarian rute Borneo Trans
const ROUTE_ESTIMATES: Record<string, { price: string; duration: string }> = {
  'Kota Sampit|Kota Pangkalan Bun': {
    price: 'Rp 210.000',
    duration: '± 4j 30m via darat',
  },
  'Kota Samarinda|Kota Pangkalan Bun': {
    price: 'Rp 325.000',
    duration: '± 8j 30m lintas provinsi',
  },
  'Kota Balikpapan|Kota Pangkalan Bun': {
    price: 'Rp 325.000',
    duration: '± 8j 00m lintas provinsi',
  },
  'Kota Palangkaraya|Kota Sampit': {
    price: 'Rp 175.000',
    duration: '± 3j 10m via darat',
  },
  'Kota Palangkaraya|Kota Pangkalan Bun': {
    price: 'Rp 280.000',
    duration: '± 7j 30m via darat',
  },
  'Kota Palangkaraya|Kota Banjarmasin': {
    price: 'Rp 220.000',
    duration: '± 4j 30m via darat',
  },
  'Kota Sampit|Kota Banjarmasin': {
    price: 'Rp 325.000',
    duration: '± 7j 45m via darat',
  },
  'Kota Samarinda|Kota Balikpapan': {
    price: 'Rp 150.000',
    duration: '± 2j 15m via tol',
  },
  'Kota Banjarmasin|Kota Balikpapan': {
    price: 'Rp 325.000',
    duration: '± 9j 00m lintas provinsi',
  },
  'Kota Pontianak|Kota Singkawang': {
    price: 'Rp 140.000',
    duration: '± 3j 00m via darat',
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

function DestinationCard({
  item,
  onSelect,
}: {
  item: TopDestinationItem;
  onSelect: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      onClick={onSelect}
      className="bg-white p-2.5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-emerald-950/5 cursor-pointer group hover:-translate-y-0.5 transition-all flex flex-col"
    >
      <div
        className={`relative h-36 rounded-xl overflow-hidden bg-gradient-to-br ${item.gradient} mb-2.5`}
      >
        {!imgFailed && (
          <img
            src={item.image}
            alt={item.title}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-gray-800">
            {item.rating}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/55 backdrop-blur-xs px-2 py-0.5 rounded-md">
          <span className="text-[9px] font-semibold text-white">
            Lihat Detail
          </span>
        </div>
      </div>

      <h3 className="text-xs font-extrabold text-gray-900 leading-snug px-0.5 line-clamp-1">
        {item.title}
      </h3>
      <p className="text-[10px] text-gray-500 flex items-start gap-1 mt-1 px-0.5">
        <MapPin className="w-3 h-3 text-[#15803D] shrink-0 mt-0.5" />
        <span className="line-clamp-2">{item.location}</span>
      </p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [routeNotice, setRouteNotice] = useState<string | null>(null);

  // State Pop-up Detail Destinasi (Rute & Tanggal Pilihan Pengguna)
  const [selectedDestination, setSelectedDestination] =
    useState<TopDestinationItem | null>(null);
  const [modalOrigin, setModalOrigin] = useState('Kota Sampit');
  const [modalDate, setModalDate] = useState('2026-11-20');

  // State Voice Assistant
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');

  const handleOpenDestinationModal = (item: TopDestinationItem) => {
    setSelectedDestination(item);
    setModalOrigin(origin !== item.destination ? origin : item.defaultOrigin);
    setModalDate(date || '2026-11-20');
  };

  const handleSelectQuickRoute = (
    newOrigin: string,
    newDestination: string,
    shortLabel: string,
    chosenDate?: string
  ) => {
    setOrigin(newOrigin);
    setDestination(newDestination);
    if (chosenDate) {
      setDate(chosenDate);
    }
    setRouteNotice(`Rute ${shortLabel} siap dicari`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setRouteNotice(null), 2800);
  };

  const handleDirectSearchDestination = (item: TopDestinationItem) => {
    if (modalOrigin === item.destination) {
      alert('Pilih kota keberangkatan yang berbeda dari kota tujuan wisata.');
      return;
    }
    if (!modalDate) {
      alert('Silakan pilih tanggal keberangkatan terlebih dahulu.');
      return;
    }

    const finalDate = modalDate;
    setOrigin(modalOrigin);
    setDestination(item.destination);
    setDate(finalDate);
    setSelectedDestination(null);

    const params = new URLSearchParams({
      origin: modalOrigin,
      destination: item.destination,
      date: finalDate,
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) {
      alert('Lengkapi kota keberangkatan, tujuan, dan tanggal terlebih dahulu.');
      return;
    }
    if (origin === destination) {
      alert('Kota keberangkatan dan tujuan tidak boleh sama.');
      return;
    }
    const params = new URLSearchParams({
      origin,
      destination,
      date,
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleApplyVoiceText = (spokenText: string) => {
    const cleaned = spokenText.trim();
    if (!cleaned) return;

    setSearchQuery(cleaned);

    const matchedCity = CITIES.find((city) => {
      const shortName = city.replace(/^Kota\s+/i, '').toLowerCase();
      return (
        cleaned.toLowerCase().includes(city.toLowerCase()) ||
        cleaned.toLowerCase().includes(shortName)
      );
    });

    if (matchedCity) {
      if (matchedCity !== origin) {
        setDestination(matchedCity);
        setVoiceFeedback(`Tujuan otomatis diatur ke ${matchedCity}`);
      } else {
        setVoiceFeedback(`${matchedCity} sudah dipilih sebagai keberangkatan`);
      }
    } else {
      setVoiceFeedback(`Kata kunci "${cleaned}" dimasukkan ke pencarian`);
    }
  };

  const modalEstimate = selectedDestination
    ? getDynamicRouteEstimate(modalOrigin, selectedDestination.destination)
    : null;

  return (
    <AppShell showBottomNav={true}>
      <div className="flex-1 bg-[#F4F7F5] pb-28 relative">
        {/* Hero Header dengan Latar Hutan & Satwa Kalimantan */}
        <div className="relative bg-gradient-to-b from-[#74B49B] via-[#8EC5AD] to-[#A7D7C5] pt-14 pb-11 px-5 overflow-hidden">
          <img
            src="/images/bg utama.png"
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-emerald-950/30" />

          <div className="relative z-10">
            {/* Judul Utama */}
            <h1 className="text-white font-extrabold text-[19px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] mb-4 pl-6">
              Ke Mana Pun Tujuanmu, BorneoTrans Teman Perjalananmu
              <span className="block text-[16px] font-bold mt-0.5">
                #JelajahBersamaBorneoTrans
              </span>
            </h1>

            {/* Search Bar & Tombol Mic */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-md">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      router.push('/explore');
                    }
                  }}
                  placeholder="Find places, food, trips.."
                  className="w-full text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus teks pencarian"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setVoiceFeedback('');
                  setIsVoiceOpen(true);
                }}
                aria-label="Pencarian Suara"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-md hover:text-[#15803D] active:scale-95 transition"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Kartu Form Pencarian Travel */}
            <form
              onSubmit={handleSearchTrip}
              className="bg-white rounded-2xl p-4 shadow-[0_12px_30px_rgba(8,28,21,0.16)] space-y-3"
            >
              {routeNotice && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#15803D] flex items-center justify-between">
                  <span>{routeNotice}</span>
                  <span className="text-[10px] font-semibold text-emerald-700">
                    Klik Cari &darr;
                  </span>
                </div>
              )}

              {/* Keberangkatan */}
              <div className="border-b border-gray-200 pb-2">
                <label className="block text-[11px] font-bold text-gray-800 mb-1">
                  Keberangkatan
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#15803D] shrink-0" />
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-xs font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Pilih kota keberangkatan
                    </option>
                    {REGIONAL_CITIES.map((group) => (
                      <optgroup
                        key={group.province}
                        label={`── ${group.province} ──`}
                        className="font-bold text-[#15803D] bg-emerald-50/40"
                      >
                        {group.cities.map((city) => (
                          <option
                            key={city}
                            value={city}
                            className="font-medium text-gray-800 bg-white"
                          >
                            {city}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tujuan */}
              <div className="border-b border-gray-200 pb-2">
                <label className="block text-[11px] font-bold text-gray-800 mb-1">
                  Tujuan
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#15803D] shrink-0" />
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-xs font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Pilih kota tujuan
                    </option>
                    {REGIONAL_CITIES.map((group) => (
                      <optgroup
                        key={group.province}
                        label={`── ${group.province} ──`}
                        className="font-bold text-[#15803D] bg-emerald-50/40"
                      >
                        {group.cities.map((city) => (
                          <option
                            key={city}
                            value={city}
                            className="font-medium text-gray-800 bg-white"
                          >
                            {city}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tanggal */}
              <div className="border-b border-gray-200 pb-2">
                <label className="block text-[11px] font-bold text-gray-800 mb-1">
                  Tanggal
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#15803D] shrink-0" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-medium text-gray-700 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Tombol Cari */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-[0.99] transition mt-1"
              >
                Cari
              </button>
            </form>
          </div>
        </div>

        {/* Layered Sheet Bawah */}
        <div className="relative z-20 -mt-5 rounded-t-[28px] bg-[#F4F7F5] px-5 pt-5 space-y-5 shadow-[0_-8px_24px_rgba(8,28,21,0.08)]">
          {/* 1. Strip Keunggulan Layanan */}
          <div className="grid grid-cols-4 gap-2">
            {SERVICE_HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl py-2.5 px-1.5 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-emerald-950/5"
                >
                  <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center mb-1.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-extrabold text-gray-800 leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 2. Top Destinations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                  Top Destinations
                </h2>
                <p className="text-[10px] text-gray-500">
                  Ketuk destinasi untuk lihat informasi &amp; jadwal rute
                </p>
              </div>
              <button
                onClick={() => router.push('/explore')}
                className="text-[11px] font-bold text-[#15803D] hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {TOP_DESTINATIONS.map((item) => (
                <DestinationCard
                  key={item.id}
                  item={item}
                  onSelect={() => handleOpenDestinationModal(item)}
                />
              ))}
            </div>
          </div>

          {/* 3. Hot Promo */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-base font-extrabold text-gray-900">
                Hot Promo
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-[#15803D] text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                Paket Hemat
              </span>
            </div>

            <div
              onClick={() => router.push('/promo')}
              className="relative w-full rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-emerald-950/5 cursor-pointer group bg-[#1B4332]"
            >
              <img
                src="/images/Rectangle 40.png"
                alt="Travel to Palangkaraya"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
                className="w-full h-auto block group-hover:scale-[1.02] transition duration-300"
              />
              <div
                style={{ display: 'none' }}
                className="h-32 bg-gradient-to-r from-[#8EC5FC] via-[#A8E6CF] to-[#1B4332] flex-col justify-center px-5"
              >
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-950">
                  Special Paket 4 Days
                </span>
                <h3 className="text-xl font-black text-white drop-shadow leading-tight">
                  Travel to Palangkaraya
                </h3>
                <p className="text-[11px] text-white/95 mt-0.5">
                  Explore the beauty of Palangka &bull; Nov 7 - Nov 10
                </p>
              </div>
            </div>
          </div>

          {/* 4. Most Popular Route */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-extrabold text-gray-900">
                Most popular route
              </h2>
              <span className="text-[10px] text-gray-400 font-medium">
                Geser &rarr;
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {POPULAR_ROUTES.map((route) => (
                <button
                  key={`${route.origin}-${route.destination}`}
                  type="button"
                  onClick={() =>
                    handleSelectQuickRoute(
                      route.origin,
                      route.destination,
                      `${route.labelFrom} → ${route.labelTo}`
                    )
                  }
                  className="shrink-0 bg-white rounded-2xl px-3.5 py-2.5 shadow-[0_3px_12px_rgba(0,0,0,0.05)] border border-emerald-950/5 hover:border-[#15803D]/40 active:scale-95 transition text-left"
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-800">
                    <span>{route.labelFrom}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>{route.labelTo}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <span className="text-[10px] font-bold text-[#15803D]">
                      {route.price}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {route.duration}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gradasi Halus di Tepi Bawah untuk Floating Nav */}
        <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-20 bg-gradient-to-t from-[#F4F7F5] via-[#F4F7F5]/65 to-transparent z-20" />

        {/* Pop-up Informasi Lengkap Destinasi + Pilih Rute & Tanggal Keberangkatan */}
        {selectedDestination && modalEstimate && (
          <div
            onClick={() => setSelectedDestination(null)}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Foto Header Destinasi */}
              <div
                className={`relative h-52 bg-gradient-to-br ${selectedDestination.gradient} shrink-0`}
              >
                <img
                  src={selectedDestination.image}
                  alt={selectedDestination.title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/20" />

                {/* Kategori & Tombol Tutup */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-[10px] font-extrabold text-[#15803D] shadow-xs">
                    {selectedDestination.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDestination(null)}
                    aria-label="Tutup detail destinasi"
                    className="w-8 h-8 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center backdrop-blur-xs transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Rating & Judul di Bawah Foto */}
                <div className="absolute bottom-3.5 inset-x-4 text-white">
                  <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{selectedDestination.rating}</span>
                    <span className="text-white/80">
                      ({selectedDestination.reviews})
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold leading-tight">
                    {selectedDestination.title}
                  </h3>
                  <p className="text-[11px] text-emerald-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedDestination.location}</span>
                  </p>
                </div>
              </div>

              {/* Konten Detail Scrollable */}
              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Deskripsi */}
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 mb-1">
                    Tentang Destinasi
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedDestination.description}
                  </p>
                </div>

                {/* Highlight Aktivitas */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Daya Tarik Utama
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDestination.highlights.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-[#15803D] text-[11px] font-semibold border border-emerald-200/70"
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Simulasi Rute, Tanggal & Tarif Dinamis */}
                <div className="bg-[#F4F7F5] rounded-2xl p-3.5 border border-emerald-950/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#15803D]" />
                      Waktu Terbaik
                    </span>
                    <span className="font-bold text-gray-800">
                      {selectedDestination.bestTime}
                    </span>
                  </div>

                  {/* Pilihan Kota Keberangkatan & Tanggal Berangkat */}
                  <div className="pt-2 border-t border-gray-200/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="modal-origin-select"
                        className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 shrink-0"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#15803D]" />
                        Berangkat dari
                      </label>
                      <select
                        id="modal-origin-select"
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
                        htmlFor="modal-date-input"
                        className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 shrink-0"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
                        Tanggal Berangkat
                      </label>
                      <input
                        id="modal-date-input"
                        type="date"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        className="bg-white border border-emerald-700/25 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#15803D] cursor-pointer max-w-[185px]"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-gray-500">Rute Borneo Trans</span>
                      <span className="font-extrabold text-gray-800">
                        {formatShortCity(modalOrigin)} &rarr;{' '}
                        {formatShortCity(selectedDestination.destination)}
                      </span>
                    </div>
                  </div>

                  {/* Harga & Durasi Dinamis */}
                  <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500">
                        Estimasi Tarif Travel ({modalEstimate.duration})
                      </p>
                      <p className="text-sm font-extrabold text-[#15803D]">
                        Mulai {modalEstimate.price}
                        <span className="text-[10px] font-medium text-gray-500">
                          {' '}
                          / kursi
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi di Bagian Bawah Pop-up */}
              <div className="p-4 pt-2 border-t border-gray-100 bg-white flex gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedDestination;
                    const chosenOrigin = modalOrigin;
                    const chosenDate = modalDate;
                    setSelectedDestination(null);
                    handleSelectQuickRoute(
                      chosenOrigin,
                      item.destination,
                      `${formatShortCity(chosenOrigin)} → ${formatShortCity(
                        item.destination
                      )}`,
                      chosenDate
                    );
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#15803D] text-[#15803D] text-xs font-bold hover:bg-emerald-50 active:scale-[0.99] transition"
                >
                  Isi Form Rute
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDirectSearchDestination(selectedDestination)
                  }
                  className="flex-1 py-2.5 px-3 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-[0.99] transition"
                >
                  Cari Travel ke Sini
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Borneo Voice Assistant */}
        <BorneoVoiceModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          onApplyText={handleApplyVoiceText}
          promptText="Mendengarkan... Sebutkan kota tujuan"
          feedbackMessage={voiceFeedback}
          sampleCommands={[
            'Ke Palangkaraya',
            'Ke Samarinda',
            'Ke Balikpapan',
            'Ke Banjarmasin',
            'Wisata Tanjung Puting',
          ]}
        />
      </div>
    </AppShell>
  );
}