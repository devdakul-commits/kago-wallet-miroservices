export interface RideRequestPayload {
  firebaseUid: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  serviceType: string;
  notes?: string;
  scheduledAt?: string;
}

export interface RideMeta {
  rideId: string;
  firebaseUid: string;
  status: string;
  riderUid: string;
  riderName: string;
  estimatedArrivalMinutes: number;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  serviceType: string;
  notes?: string;
  scheduledAt?: string;
  requestedAt: string;
  updatedAt: string;
}

export interface RideLocation {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export interface RideRequestResponse {
  rideId: string;
  status: string;
  riderName: string;
  estimatedArrivalMinutes: number;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  serviceType: string;
  notes?: string;
  scheduledAt?: string;
  requestedAt: string;
}

export interface RideAssignmentPayload {
  rideId: string;
  firebaseUid: string;
  riderUid: string;
  currentLat: number;
  currentLng: number;
}
