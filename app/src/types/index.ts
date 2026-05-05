export interface User {
  id: string;
  email: string;
  full_name: string;
  profile_photo_url?: string;
  faculty?: string;
  phone?: string;
  roles: UserRole[];
  status: UserStatus;
  rating?: number;
  trips_count?: number;
}

export type UserRole = 'driver' | 'passenger';
export type UserStatus = 'active' | 'suspended' | 'deactivated';

export interface Trip {
  id: string;
  driver: User;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  departure_time: Date;
  total_seats: number;
  available_seats: number;
  price: number;
  status: TripStatus;
  notes?: string;
  created_at: Date;
}

export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  trip: Trip;
  passenger: User;
  status: BookingStatus;
  meeting_point_name?: string;
  meeting_point_lat?: number;
  meeting_point_lng?: number;
  booked_at: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at?: Date;
}

export type PaymentMethod = 'pse' | 'card' | 'sabana_points';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Review {
  id: string;
  trip_id: string;
  reviewer: User;
  reviewed_user: User;
  rating: number;
  comment?: string;
  tags?: string[];
  created_at: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'trip_cancelled'
  | 'trip_modified'
  | 'payment_received'
  | 'rating_received'
  | 'sabana_coins_earned';

export interface SabanaCoinsBalance {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface SearchFilters {
  origin: string;
  destination: string;
  date: Date;
  time?: string;
  seats?: number;
}

export interface PaymentCard {
  id: string;
  last_four: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}
