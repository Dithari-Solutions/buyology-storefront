import { courierClient } from '@/shared/lib/courierClient';

export type CourierStatus = 'ACTIVE' | 'OFFLINE' | 'SUSPENDED';
export type VehicleType = 'BICYCLE' | 'FOOT' | 'SCOOTER' | 'CAR';

export interface LocationSnapshot {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracyMeters: number | null;
  recordedAt: string;
}

export interface CourierMapEntry {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: VehicleType;
  status: CourierStatus;
  isAvailable: boolean;
  rating: number | null;
  profileImageUrl: string | null;
  latestLocation: LocationSnapshot | null;
}

export interface CourierMapFilters {
  status?: CourierStatus;
  vehicleType?: VehicleType;
  isAvailable?: boolean;
}

export async function getCouriersForMap(filters: CourierMapFilters = {}): Promise<CourierMapEntry[]> {
  const params: Record<string, string> = {};
  if (filters.status)      params.status      = filters.status;
  if (filters.vehicleType) params.vehicleType = filters.vehicleType;
  if (filters.isAvailable != null) params.isAvailable = String(filters.isAvailable);

  const { data } = await courierClient.get<CourierMapEntry[]>('/api/v1/couriers/map', { params });
  return data;
}
