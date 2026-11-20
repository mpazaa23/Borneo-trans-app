'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Mic,
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  Star,
  Clock,
  Compass,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import BorneoVoiceModal from '@/components/BorneoVoiceModal';
import { REGIONAL_CITIES } from '@/data/mockData';

interface ExploreDestinationItem {
  id: string;
  title: string;
  location: string;
  province: string;
  category: string;
  image: string;
  rating: string;
  reviews: string;
  bestTime: string;
  description: string;
  highlights: string[];
  defaultOrigin: string;
  destinationCity: string;
  featured?: boolean;
  gradient: string;
}

const EXPLORE_CATALOG: ExploreDestinationItem[] = [
  {
    id: 'bundaran-besar',
    title: 'Menara Bundaran Besar',
    location: 'Kota Palangka Raya, Kalimantan Tengah',
    province: 'Kalimantan Tengah',
    category: 'Ikon & Landmark Kota',
    image: '/images/Bundaran Besar.jpg',
    rating: '4.7',
    reviews: '1,4rb ulasan',
    bestTime: '17.00 – 22.00 WIB',
    description:
      'Ikon arsitektur modern jantung Kota Cantik Palangka Raya dengan taman kota luas, air mancur, dan panorama lampu malam yang memukau.',
    highlights: ['Panorama Lampu Malam', 'Spot Foto Ikonik', 'Pusat Kuliner Kota'],
    defaultOrigin: 'Kota Sampit',
    destinationCity: 'Kota Palangkaraya',
    featured: true,
    gradient: 'from-[#1E1B4B] via-[#312E81] to-[#4C1D95]',
  },
  {
    id: 'tanjung-puting',
    title: 'Taman Nasional Tanjung Puting',
    location: 'Kotawaringin Barat, Kalimantan Tengah',
    province: 'Kalimantan Tengah',
    category: 'Ekowisata & Satwa',
    image: '/images/Taman Nasional Tanjung Puting.jpg',
    rating: '4.9',
    reviews: '1,8rb ulasan',
    bestTime: '08.00 – 16.00 WIB',
    description:
      'Kawasan konservasi orangutan terbesar di dunia dengan pengalaman susur Sungai Sekonyer menggunakan perahu klotok menuju Camp Leakey.',
    highlights: ['Observasi Orangutan', 'Susur Sungai Klotok', 'Camp Leakey'],
    defaultOrigin: 'Kota Sampit',
    destinationCity: 'Kota Pangkalan Bun',
    featured: true,
    gradient: 'from-[#0F5132] via-[#1B4332] to-[#081C15]',
  },
  {
    id: 'pasar-terapung',
    title: 'Pasar Terapung Lok Baintan',
    location: 'Kab. Banjar, Kalimantan Selatan',
    province: 'Kalimantan Selatan',
    category: 'Budaya & Kuliner',
    image: '/images/Pasar Terapung.jpg',
    rating: '4.8',
    reviews: '2,1rb ulasan',
    bestTime: '06.00 – 09.00 WITA',
    description:
      'Pasar tradisional di atas aliran Sungai Martapura tempat pedagang menjajakan hasil kebun, kue khas Banjar, dan soto Banjar dari atas jukung.',
    highlights: ['Kuliner Soto Banjar', 'Wisata Jukung Pagi', 'Foto Sunrise Sungai'],
    defaultOrigin: 'Kota Palangkaraya',
    destinationCity: 'Kota Banjarmasin',
    featured: true,
    gradient: 'from-[#7C2D12] via-[#9A3412] to-[#431407]',
  },
  {
    id: 'derawan',
    title: 'Kepulauan Derawan',
    location: 'Kab. Berau, Kalimantan Timur',
    province: 'Kalimantan Timur',
    category: 'Wisata Bahari',
    image: '/images/Above.jpg',
    rating: '4.9',
    reviews: '2,6rb ulasan',
    bestTime: '07.00 – 17.00 WITA',
    description:
      'Surga bahari Kalimantan Timur dengan pasir putih, air laut berwarna toska jernih, penginapan di atas air, serta habitat penyu hijau.',
    highlights: ['Snorkeling Terumbu Karang', 'Konservasi Penyu', 'Villa Atas Air'],
    defaultOrigin: 'Kota Samarinda',
    destinationCity: 'Kota Balikpapan',
    featured: true,
    gradient: 'from-[#0C4A6E] via-[#0369A1] to-[#082F49]',
  },
  {
    id: 'rumah-betang',
    title: 'Rumah Betang Sungai Pasah',
    location: 'Kapuas & Palangka Raya, Kalteng',
    province: 'Kalimantan Tengah',
    category: 'Warisan Budaya',
    image: '/images/Rumah Betang.jpg',
    rating: '4.6',
    reviews: '920 ulasan',
    bestTime: '09.00 – 17.00 WIB',
    description:
      'Rumah adat tradisional suku Dayak berbentuk panggung panjang yang menyimpan sejarah kekeluargaan, seni ukir, dan tradisi budaya Kalimantan.',
    highlights: ['Arsitektur Adat Dayak', 'Galeri Seni Ukir', 'Wisata Edukasi Budaya'],
    defaultOrigin: 'Kota Sampit',
    destinationCity: 'Kota Palangkaraya',
    gradient: 'from-[#14532D] via-[#166534] to-[#052E16]',
  },
  {
    id: 'bukit-bangkirai',
    title: 'Wisata Alam Bukit Bangkirai',
    location: 'Samboja, Kutai Kartanegara, Kaltim',
    province: 'Kalimantan Timur',
    category: 'Hutan Hujan Tropis',
    image: '/images/Bukit Bangkirai.jpg',
    rating: '4.7',
    reviews: '1,2rb ulasan',
    bestTime: '08.00 – 16.00 WITA',
    description:
      'Kawasan konservasi hutan hujan tropis yang ikonik dengan jembatan gantung tajuk pohon (Canopy Bridge) setinggi 30 meter.',
    highlights: ['Canopy Bridge 30m', 'Trekking Hutan Tropis', 'Pohon Bangkirai Raksasa'],
    defaultOrigin: 'Kota Samarinda',
    destinationCity: 'Kota Balikpapan',
    gradient: 'from-[#064E3B] via-[#047857] to-[#022C22]',
  },
  {
    id: 'pulau-kembang',
    title: 'Wisata Pulau Kembang',
    location: 'Barito Kuala, Kalimantan Selatan',
    province: 'Kalimantan Selatan',
    category: 'Ekowisata Sungai',
    image: '/images/Pulau Kembang.jpg',
    rating: '4.6',
    reviews: '1,1rb ulasan',
    bestTime: '07.30 – 16.30 WITA',
    description:
      'Delta alami di tengah Sungai Barito yang menjadi habitat bekantan dan kera ekor panjang, mudah dijangkau dengan perahu motor dari Banjarmasin.',
    highlights: ['Habitat Bekantan', 'Susur Sungai Barito', 'Hutan Mangrove Alami'],
    defaultOrigin: 'Kota Palangkaraya',
    destinationCity: 'Kota Banjarmasin',
    gradient: 'from-[#365314] via-[#4D7C0F] to-[#1A2E05]',
  },
  {
    id: 'pantai-pasir-panjang',
    title: 'Pantai Pasir Panjang Singkawang',
    location: 'Kota Singkawang, Kalimantan Barat',
    province: 'Kalimantan Barat',
    category: 'Pantai & Sunset',
    image: '/images/Pantai Singkawang.jpg',
    rating: '4.8',
    reviews: '1,9rb ulasan',
    bestTime: '15.00 – 18.30 WIB',
    description:
      'Garis pantai berpasir putih halus menghadap Laut Natuna dengan panorama matahari terbenam yang memukau serta kuliner khas Singkawang.',
    highlights: ['Panorama Sunset', 'Kuliner Kota Amoy', 'Pantai Pasir Putih'],
    defaultOrigin: 'Kota Pontianak',
    destinationCity: 'Kota Singkawang',
    gradient: 'from-[#1E3A8A] via-[#1D4ED8] to-[#172554]',
  },
];

const PROVINCE_TABS = [
  'Semua',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Barat',
  'Favorit',
];

const ROUTE_ESTIMATES: Record<string, { price: string; duration: string }> = {
  'Kota Sampit|Kota Pangkalan Bun': {
    price: 'Rp 210.000',
    duration: '± 4j 30m via darat',
  },
  'Kota Samarinda|Kota Pangkalan Bun': {
    price: 'Rp 325.000',
    duration: '± 8j 30m lintas provinsi',
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
  'Kota Samarinda|Kota Balikpapan': {
    price: 'Rp 150.000',
    duration: '± 2j 15m via tol',
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

function CatalogDestinationCard({
  item,
  isLiked,
  onToggleLike,
  onSelect,
}: {
  item: ExploreDestinationItem;
  isLiked: boolean;
  onToggleLike: (e: React.MouseEvent) => void;
  onSelect: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const estimate = getDynamicRouteEstimate(
    item.defaultOrigin,
    item.destinationCity
  );

  return (
    <div
      onClick={onSelect}
      className="bg-white p-2.5 rounded-2xl shadow-[0_6px_18px_rgba(8,28,21,0.08)] border border-emerald-950/5 cursor-pointer group hover:-translate-y-0.5 transition-all flex flex-col"
    >
      <div
        className={`relative h-32 rounded-xl overflow-hidden bg-gradient-to-br ${item.gradient} mb-2`}
      >
        {!imgFailed && (
          <img
            src={item.image}
            alt={item.title}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />

        {/* Tombol Like */}
        <button
          type="button"
          onClick={onToggleLike}
          aria-label="Sukai Destinasi"
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-xs flex items-center justify-center hover:scale-110 transition"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isLiked ? 'fill-red-500 text-red-500' : 'fill-white text-white'
            }`}
          />
        </button>

        {/* Rating */}
        <div className="absolute top-2 right-2 bg-white/95 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-gray-800">
            {item.rating}
          </span>
        </div>

        {/* Badge Tarif Mulai */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
          <span className="text-[9px] font-extrabold text-[#15803D]">
            Mulai {estimate.price}
          </span>
        </div>
      </div>

      <h3 className="text-xs font-extrabold text-gray-900 leading-snug px-0.5 line-clamp-1">
        {item.title}
      </h3>
      <p className="text-[10px] text-gray-500 flex items-start gap-1 mt-1 px-0.5">
        <MapPin className="w-3 h-3 text-[#15803D] shrink-0 mt-0.5" />
        <span className="line-clamp-1">{item.location}</span>
      </p>
    </div>
  );
}

export default function ExploreBorneoPage() {
  const router = useRouter();
  const featuredItems = EXPLORE_CATALOG.filter((item) => item.featured);

  const [activeIndex, setActiveIndex] = useState(0);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Semua');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // State Pop-up Detail Destinasi & Pemesanan Rute
  const [selectedDestination, setSelectedDestination] =
    useState<ExploreDestinationItem | null>(null);
  const [modalOrigin, setModalOrigin] = useState('Kota Sampit');
  const [modalDate, setModalDate] = useState('2026-11-20');

  // Tangkap parameter ?q=... jika pengguna mencari dari halaman Home
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qParam = new URLSearchParams(window.location.search).get('q');
      if (qParam) {
        handleSearchAndJump(qParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentFeatured = featuredItems[activeIndex] || featuredItems[0];
  const isCurrentLiked = likedIds.includes(currentFeatured.id);

  const toggleLikeById = (id: string) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDestinationModal = (item: ExploreDestinationItem) => {
    setSelectedDestination(item);
    setModalOrigin(item.defaultOrigin);
    setModalDate('2026-11-20');
  };

  const handleDirectSearchDestination = (item: ExploreDestinationItem) => {
    if (modalOrigin === item.destinationCity) {
      alert('Pilih kota keberangkatan yang berbeda dari kota tujuan wisata.');
      return;
    }
    if (!modalDate) {
      alert('Silakan pilih tanggal keberangkatan terlebih dahulu.');
      return;
    }
    setSelectedDestination(null);
    const params = new URLSearchParams({
      origin: modalOrigin,
      destination: item.destinationCity,
      date: modalDate,
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleSearchAndJump = (rawText: string) => {
    setQuery(rawText);
    const cleaned = rawText
      .toLowerCase()
      .replace(/^(ke|cari|wisata)\s+/i, '')
      .trim();

    if (!cleaned) return;

    setSelectedProvince('Semua');

    const matchedFeaturedIdx = featuredItems.findIndex(
      (dest) =>
        dest.title.toLowerCase().includes(cleaned) ||
        dest.location.toLowerCase().includes(cleaned) ||
        dest.province.toLowerCase().includes(cleaned)
    );

    if (matchedFeaturedIdx !== -1) {
      setHeroImgFailed(false);
      setActiveIndex(matchedFeaturedIdx);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeroImgFailed(false);
    setActiveIndex((prev) => (prev + 1) % featuredItems.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeroImgFailed(false);
    setActiveIndex((prev) =>
      prev === 0 ? featuredItems.length - 1 : prev - 1
    );
  };

  const normalizedQuery = query
    .toLowerCase()
    .replace(/^(ke|cari|wisata)\s+/i, '')
    .trim();

  const filteredCatalog = EXPLORE_CATALOG.filter((item) => {
    const matchesTab =
      selectedProvince === 'Semua'
        ? true
        : selectedProvince === 'Favorit'
        ? likedIds.includes(item.id)
        : item.province === selectedProvince;

    const matchesQuery =
      !normalizedQuery ||
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.location.toLowerCase().includes(normalizedQuery) ||
      item.province.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery);

    return matchesTab && matchesQuery;
  });

  const modalEstimate = selectedDestination
    ? getDynamicRouteEstimate(modalOrigin, selectedDestination.destinationCity)
    : null;

  return (
    <AppShell showBottomNav={true}>
      <div className="relative flex-1 bg-[#F4F7F5] pb-28 min-h-screen flex flex-col">
        {/* Header Hijau Khas Borneo */}
        <div className="relative bg-gradient-to-b from-[#5E9F83] via-[#4C8A70] to-[#2F634E] pt-16 pb-9 px-5 overflow-hidden">
          <img
            src="/images/bg utama.png"
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-35 pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-emerald-950/30 pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-white font-extrabold text-2xl leading-tight drop-shadow">
              Jelajahi Pesona
              <br />
              Kalimantan
            </h1>
            <p className="text-emerald-100 font-bold text-xs mt-1 mb-4 drop-shadow">
              #TemukanCeritaBersamaBorneo
            </p>

            {/* Search Bar & Tombol Mic */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-md">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearchAndJump(e.target.value)}
                  placeholder="Cari wisata, kota, atau provinsi..."
                  className="w-full text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
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

            {/* Filter Chip Provinsi & Favorit */}
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {PROVINCE_TABS.map((tab) => {
                const isActive = selectedProvince === tab;
                const displayLabel =
                  tab === 'Favorit'
                    ? `Favorit (${likedIds.length})`
                    : tab.replace('Kalimantan ', 'Kal-');
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedProvince(tab)}
                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition ${
                      isActive
                        ? 'bg-white text-[#081C15] shadow-md'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs'
                    }`}
                  >
                    {tab === 'Semua' ? 'Semua Wilayah' : displayLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Layered Sheet Konten Explore */}
        <div className="relative z-20 -mt-5 rounded-t-[28px] bg-[#F4F7F5] px-5 pt-5 space-y-6 flex-1 shadow-[0_-8px_24px_rgba(8,28,21,0.08)]">
          {/* 1. Destinasi Sorotan (Carousel Utama) */}
          {selectedProvince === 'Semua' && !normalizedQuery && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">
                    Destinasi Pilihan Minggu Ini
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    Ketuk kartu untuk lihat detail &amp; jadwal travel
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#15803D] bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  {activeIndex + 1} / {featuredItems.length}
                </span>
              </div>

              <div
                onClick={() => handleOpenDestinationModal(currentFeatured)}
                className={`relative h-[265px] rounded-3xl overflow-hidden shadow-lg bg-gradient-to-b ${currentFeatured.gradient} cursor-pointer group`}
              >
                {!heroImgFailed && (
                  <img
                    src={currentFeatured.image}
                    alt={currentFeatured.title}
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />

                {/* Badge Provinsi & Tombol Like */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/95 text-[10px] font-extrabold text-[#15803D] shadow-xs">
                    {currentFeatured.province}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeById(currentFeatured.id);
                    }}
                    aria-label="Sukai Destinasi"
                    className="p-2 rounded-full bg-black/30 backdrop-blur-xs hover:scale-110 transition"
                  >
                    <Heart
                      className={`w-5 h-5 transition ${
                        isCurrentLiked
                          ? 'fill-red-500 text-red-500'
                          : 'fill-white text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Panah Kiri & Kanan */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Sebelumnya"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/35 text-white hover:bg-black/55 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Selanjutnya"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/35 text-white hover:bg-black/55 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Info Destinasi & Tombol Aksi */}
                <div className="absolute bottom-3.5 inset-x-4 text-white">
                  <p className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1 mb-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{currentFeatured.location}</span>
                  </p>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-extrabold leading-snug truncate">
                        {currentFeatured.title}
                      </h3>
                      <p className="text-[11px] text-gray-200 line-clamp-1 mt-0.5">
                        {currentFeatured.description}
                      </p>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 bg-white text-[#081C15] px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold shadow">
                      Rute
                      <ArrowUpRight className="w-3 h-3 text-[#15803D]" />
                    </span>
                  </div>

                  {/* Dots Indikator */}
                  <div className="flex justify-center mt-2.5">
                    <div className="bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      {featuredItems.map((dest, idx) => (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroImgFailed(false);
                            setActiveIndex(idx);
                          }}
                          aria-label={`Slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            idx === activeIndex
                              ? 'w-4 bg-white'
                              : 'w-1.5 bg-white/45'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Katalog Lengkap Destinasi Kalimantan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                  {selectedProvince === 'Semua'
                    ? 'Semua Destinasi Kalimantan'
                    : selectedProvince === 'Favorit'
                    ? 'Destinasi Favoritmu'
                    : `Wisata ${selectedProvince}`}
                </h2>
                <p className="text-[10px] text-gray-500">
                  Pilih destinasi untuk cek tarif &amp; jadwal keberangkatan
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#15803D]">
                {filteredCatalog.length} tempat
              </span>
            </div>

            {filteredCatalog.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredCatalog.map((item) => (
                  <CatalogDestinationCard
                    key={item.id}
                    item={item}
                    isLiked={likedIds.includes(item.id)}
                    onToggleLike={(e) => {
                      e.stopPropagation();
                      toggleLikeById(item.id);
                    }}
                    onSelect={() => handleOpenDestinationModal(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center shadow-xs border border-emerald-950/5">
                <p className="text-xs font-bold text-gray-800">
                  {selectedProvince === 'Favorit'
                    ? 'Belum ada destinasi yang kamu sukai'
                    : `Destinasi "${query}" tidak ditemukan`}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  {selectedProvince === 'Favorit'
                    ? 'Ketuk ikon hati pada kartu wisata untuk menyimpannya di sini.'
                    : 'Coba pilih wilayah lain atau hapus kata kunci pencarian.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedProvince('Semua');
                  }}
                  className="mt-3 px-4 py-1.5 rounded-full btn-borneo text-white text-[11px] font-bold"
                >
                  Tampilkan Semua Destinasi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gradasi Halus di Tepi Bawah untuk Floating Nav */}
        <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-20 bg-gradient-to-t from-[#F4F7F5] via-[#F4F7F5]/65 to-transparent z-20" />

        {/* Pop-up Informasi Lengkap Destinasi + Pilih Rute & Tanggal */}
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
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLikeById(selectedDestination.id)}
                      aria-label="Sukai Destinasi"
                      className="w-8 h-8 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center backdrop-blur-xs transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          likedIds.includes(selectedDestination.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-white'
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDestination(null)}
                      aria-label="Tutup detail destinasi"
                      className="w-8 h-8 rounded-full bg-black/45 text-white hover:bg-black/65 flex items-center justify-center backdrop-blur-xs transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rating & Judul */}
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
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 mb-1">
                    Tentang Destinasi
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedDestination.description}
                  </p>
                </div>

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

                {/* Pilihan Keberangkatan, Tanggal & Tarif */}
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

                  <div className="pt-2 border-t border-gray-200/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="explore-origin-select"
                        className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 shrink-0"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#15803D]" />
                        Berangkat dari
                      </label>
                      <select
                        id="explore-origin-select"
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
                        htmlFor="explore-date-input"
                        className="text-xs text-gray-600 font-semibold flex items-center gap-1.5 shrink-0"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#15803D]" />
                        Tanggal Berangkat
                      </label>
                      <input
                        id="explore-date-input"
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
                        {formatShortCity(selectedDestination.destinationCity)}
                      </span>
                    </div>
                  </div>

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

              {/* Tombol Cari Travel */}
              <div className="p-4 pt-2 border-t border-gray-100 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleDirectSearchDestination(selectedDestination)
                  }
                  className="w-full py-3 px-4 rounded-xl btn-borneo text-white text-xs font-bold shadow-md active:scale-[0.99] transition"
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
          onApplyText={(spoken) => handleSearchAndJump(spoken)}
          promptText="Mendengarkan... Sebutkan destinasi wisata atau kota"
          sampleCommands={[
            'Palangka Raya',
            'Tanjung Puting',
            'Pasar Terapung',
            'Derawan',
            'Singkawang',
          ]}
        />
      </div>
    </AppShell>
  );
}