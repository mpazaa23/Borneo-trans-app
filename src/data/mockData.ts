import { CatalogItem, RouteItem, ScheduleItem } from '@/types/database';

export interface RegionalCityGroup {
  province: string;
  cities: string[];
}

export const REGIONAL_CITIES: RegionalCityGroup[] = [
  {
    province: 'Kalimantan Tengah',
    cities: [
      'Kota Sampit',
      'Kota Palangkaraya',
      'Pangkalan Bun',
      'Kuala Kapuas',
      'Muara Teweh',
    ],
  },
  {
    province: 'Kalimantan Timur',
    cities: [
      'Samarinda',
      'Balikpapan',
      'Sangatta',
      'Bontang',
      'Tenggarong',
    ],
  },
  {
    province: 'Kalimantan Selatan',
    cities: [
      'Banjarmasin',
      'Banjarbaru',
      'Martapura',
      'Tanjung Tabalong',
    ],
  },
  {
    province: 'Kalimantan Barat',
    cities: [
      'Pontianak',
      'Singkawang',
      'Ketapang',
    ],
  },
  {
    province: 'Kalimantan Utara',
    cities: [
      'Tarakan',
      'Tanjung Selor',
    ],
  },
];

// Daftar datar seluruh kota untuk kompatibilitas pencarian
export const CITIES: string[] = REGIONAL_CITIES.flatMap((group) => group.cities);

const CITY_POOL_ADDRESSES: Record<string, string> = {
  'Kota Sampit': 'Jl. S. Parman No. 28, Sampit',
  'Kota Palangkaraya': 'Jl. Kawitan I No. 68, Sidorejot',
  'Pangkalan Bun': 'Jl. Pangeran Antasari No. 45, Pangkalan Bun',
  'Kuala Kapuas': 'Jl. Pemuda Km. 1,5 No. 14, Kuala Kapuas',
  'Muara Teweh': 'Jl. Tumenggung Surapati No. 22, Muara Teweh',
  Samarinda: 'Jl. Pahlawan No. 19, Samarinda Ulu',
  Balikpapan: 'Jl. MT Haryono No. 88, Balikpapan Selatan',
  Sangatta: 'Jl. Yos Sudarso II No. 31, Sangatta Utara',
  Bontang: 'Jl. Bhayangkara No. 10, Bontang Utara',
  Tenggarong: 'Jl. Wolter Monginsidi No. 17, Tenggarong',
  Banjarmasin: 'Jl. A. Yani Km. 5 No. 12, Banjarmasin',
  Banjarbaru: 'Jl. Panglima Batur Timur No. 9, Banjarbaru',
  Martapura: 'Jl. A. Yani Km. 40 No. 5, Martapura',
  'Tanjung Tabalong': 'Jl. Pangeran Antasari No. 72, Tanjung',
  Pontianak: 'Jl. Ahmad Yani I No. 54, Pontianak Selatan',
  Singkawang: 'Jl. Diponegoro No. 21, Singkawang Barat',
  Ketapang: 'Jl. R. Suprapto No. 33, Ketapang',
  Tarakan: 'Jl. Yos Sudarso No. 40, Tarakan Tengah',
  'Tanjung Selor': 'Jl. Skip I No. 15, Tanjung Selor',
};

export const ROUTES_DATA: RouteItem[] = [
  {
    id: 'route-sampit-palangkaraya',
    origin_city: 'Kota Sampit',
    origin_address: 'Jl. S. Parman No. 28, Sampit',
    destination_city: 'Kota Palangkaraya',
    destination_address: 'Jl. Kawitan I No. 68, Sidorejot',
    base_price: 175000,
    airport_drop_fee: 25000,
    duration_text: '3 jam 10 Menit',
    is_featured: true,
    rating: 4.7,
    image_url: '/images/palangkaraya-night.jpg',
  },
  {
    id: 'route-palangkaraya-sampit',
    origin_city: 'Kota Palangkaraya',
    origin_address: 'Jl. S. Parman No. 28, Palangka',
    destination_city: 'Kota Sampit',
    destination_address: 'Jl. Kawitan I No. 68, Sidorejot',
    base_price: 175000,
    airport_drop_fee: 25000,
    duration_text: '3 jam 55 Menit',
    is_featured: true,
    rating: 4.5,
    image_url: '/images/tugu-sampit.jpg',
  },
  {
    id: 'route-samarinda-balikpapan',
    origin_city: 'Samarinda',
    origin_address: 'Jl. Pahlawan No. 19, Samarinda Ulu',
    destination_city: 'Balikpapan',
    destination_address: 'Jl. MT Haryono No. 88, Balikpapan Selatan',
    base_price: 150000,
    airport_drop_fee: 30000,
    duration_text: '2 jam 15 Menit',
    is_featured: true,
    rating: 4.9,
  },
  {
    id: 'route-samarinda-sangatta',
    origin_city: 'Samarinda',
    origin_address: 'Jl. Pahlawan No. 19, Samarinda Ulu',
    destination_city: 'Sangatta',
    destination_address: 'Jl. Yos Sudarso II No. 31, Sangatta Utara',
    base_price: 185000,
    airport_drop_fee: 25000,
    duration_text: '4 jam 10 Menit',
    is_featured: true,
    rating: 4.7,
  },
  {
    id: 'route-balikpapan-sangatta',
    origin_city: 'Balikpapan',
    origin_address: 'Jl. MT Haryono No. 88, Balikpapan Selatan',
    destination_city: 'Sangatta',
    destination_address: 'Jl. Yos Sudarso II No. 31, Sangatta Utara',
    base_price: 260000,
    airport_drop_fee: 30000,
    duration_text: '6 jam 15 Menit',
    is_featured: false,
    rating: 4.8,
  },
];

function getProvinceOfCity(cityName: string): string {
  const found = REGIONAL_CITIES.find((group) =>
    group.cities.some((c) => c.toLowerCase() === cityName.toLowerCase())
  );
  return found ? found.province : 'Kalimantan';
}

// Mencari rute terdaftar atau otomatis menghitung tarif & durasi berdasarkan provinsi
export function findOrBuildRoute(
  originCity: string,
  destinationCity: string
): RouteItem {
  const existing = ROUTES_DATA.find(
    (r) =>
      r.origin_city.toLowerCase() === originCity.toLowerCase() &&
      r.destination_city.toLowerCase() === destinationCity.toLowerCase()
  );

  if (existing) return existing;

  const originProv = getProvinceOfCity(originCity);
  const destProv = getProvinceOfCity(destinationCity);
  const isSameProvince = originProv === destProv;

  return {
    id: `custom-${originCity}-${destinationCity}`
      .toLowerCase()
      .replace(/\s+/g, '-'),
    origin_city: originCity,
    origin_address:
      CITY_POOL_ADDRESSES[originCity] || `Pool Borneo Trans ${originCity}`,
    destination_city: destinationCity,
    destination_address:
      CITY_POOL_ADDRESSES[destinationCity] ||
      `Pool Borneo Trans ${destinationCity}`,
    base_price: isSameProvince ? 195000 : 325000,
    airport_drop_fee: 25000,
    duration_text: isSameProvince ? '3 jam 45 Menit' : '7 jam 30 Menit',
    is_featured: false,
    rating: 4.7,
  };
}

export function getSchedulesForRoute(
  routeId: string,
  date: string
): ScheduleItem[] {
  return [
    {
      id: `${routeId}-pagi`,
      route_id: routeId,
      departure_date: date,
      departure_time: '01:00',
      arrival_time: '04:45',
      time_category: 'Pagi',
      service_class: 'PREMIUM',
      vehicle_model: 'Toyota Hiace Commuter',
      total_seats: 8,
      priority_seats: ['B', 'E'],
      booked_seats: ['F'],
    },
    {
      id: `${routeId}-siang`,
      route_id: routeId,
      departure_date: date,
      departure_time: '06:00',
      arrival_time: '09:45',
      time_category: 'Siang',
      service_class: 'PREMIUM',
      vehicle_model: 'Toyota Hiace Commuter',
      total_seats: 8,
      priority_seats: ['B', 'E'],
      booked_seats: ['A', 'D', 'F', 'H'],
    },
  ];
}

export const EXPLORE_DESTINATIONS = [
  {
    id: 'dest-1',
    title: 'Menara Bundaran Besar Palangka Raya',
    location: 'Kota Palangka Raya, Kalimantan Tengah',
    description:
      'Ikon arsitektur modern jantung Kota Cantik Palangka Raya dengan panorama lampu malam yang memukau.',
    image_url: '/images/palangkaraya-night.jpg',
    fallback_gradient: 'from-indigo-950 via-purple-900 to-slate-900',
  },
  {
    id: 'dest-2',
    title: 'Tugu Ikan Jelawat Sampit',
    location: 'Kotawaringin Timur, Kalimantan Tengah',
    description:
      'Landmark kebanggaan masyarakat Sampit di tepian Sungai Mentaya.',
    image_url: '/images/tugu-sampit.jpg',
    fallback_gradient: 'from-emerald-900 via-teal-800 to-cyan-950',
  },
  {
    id: 'dest-3',
    title: 'Taman Nasional Tanjung Puting',
    location: 'Kotawaringin Barat, Kalimantan Tengah',
    description:
      'Susur sungai kelotok melihat habitat asli Orangutan Kalimantan di hutan hujan tropis.',
    image_url: '/images/wisata-orangutan.jpg',
    fallback_gradient: 'from-green-950 via-emerald-800 to-lime-950',
  },
  {
    id: 'dest-4',
    title: 'Rumah Betang Suku Dayak',
    location: 'Kalimantan Tengah',
    description:
      'Rumah panjang tradisional Suku Dayak yang menyimpan kearifan budaya dan sejarah Borneo.',
    image_url: '/images/rumah-betang.jpg',
    fallback_gradient: 'from-amber-950 via-stone-800 to-emerald-950',
  },
];

export const PROMO_ITEMS: CatalogItem[] = [
  {
    id: 'promo-1',
    title: 'Swiss-Belhotel Danum Palangka Raya',
    category: 'HOTEL',
    location: 'Palangka Raya',
    rating: 8.5,
    review_count_text: '3,3rb ulasan',
    price: 2990423,
    badge_text: 'Best Price Promo',
    image_url: '/images/hotel-swissbel.jpg',
  },
  {
    id: 'promo-2',
    title: 'Hotel Neo Palma - Palangkaraya',
    category: 'HOTEL',
    location: 'Palangka Raya',
    rating: 8.2,
    review_count_text: '2,3rb ulasan',
    price: 2490423,
    badge_text: 'Best Price Promo',
    image_url: '/images/hotel-neo.jpg',
  },
  {
    id: 'promo-3',
    title: 'Wisata Orangutan Kalimantan',
    category: 'WISATA',
    location: 'Tanjung Puting',
    rating: 8.5,
    review_count_text: '3,3rb ulasan',
    price: 350423,
    badge_text: 'Best Price Promo',
    image_url: '/images/wisata-orangutan.jpg',
  },
  {
    id: 'promo-4',
    title: 'Rumah Betang Khas Suku Dayak',
    category: 'WISATA',
    location: 'Kalimantan Tengah',
    rating: 8.5,
    review_count_text: '3,3rb ulasan',
    price: 120503,
    badge_text: 'Best Price Promo',
    image_url: '/images/rumah-betang.jpg',
  },
];