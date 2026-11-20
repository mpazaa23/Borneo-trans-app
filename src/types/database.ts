export interface RouteItem {
  id: string;
  origin_city: string;
  origin_address: string;
  destination_city: string;
  destination_address: string;
  base_price: number;
  airport_drop_fee: number;
  duration_text: string;
  is_featured: boolean;
  rating: number;
  image_url?: string;
}

export interface ScheduleItem {
  id: string;
  route_id: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  time_category: 'Pagi' | 'Siang' | 'Malam';
  service_class: string;
  vehicle_model: string;
  total_seats: number;
  priority_seats: string[];
  booked_seats?: string[];
  route?: RouteItem;
}

export interface PassengerSeat {
  seat_code: string;
  passenger_name: string;
}

export interface BookingTicket {
  id: string;
  ticket_code: string;
  origin_city: string;
  destination_city: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  booker_salutation: string;
  booker_name: string;
  booker_email: string;
  booker_phone: string;
  is_airport_drop: boolean;
  ticket_subtotal: number;
  airport_drop_total: number;
  admin_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'PAID' | 'PENDING';
  barcode_number: string;
  passengers: PassengerSeat[];
  created_at: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  category: 'HOTEL' | 'WISATA' | 'PROMO';
  location?: string;
  rating: number;
  review_count_text: string;
  price: number;
  badge_text: string;
  image_url: string;
}