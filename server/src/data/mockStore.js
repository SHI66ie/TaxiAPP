// Initial Mock Store for Abuja Taxi & Carpool Platform

export const ABUJA_ZONES = [
  { id: 'cbd', name: 'Central Business District (CBD)', baseFare: 800, perKm: 250 },
  { id: 'wuse2', name: 'Wuse II', baseFare: 750, perKm: 240 },
  { id: 'maitama', name: 'Maitama', baseFare: 900, perKm: 280 },
  { id: 'gwarinpa', name: 'Gwarinpa Estate', baseFare: 700, perKm: 220 },
  { id: 'kubwa', name: 'Kubwa', baseFare: 600, perKm: 200 },
  { id: 'lugbe', name: 'Lugbe Corridor', baseFare: 550, perKm: 190 },
  { id: 'airport', name: 'Nnamdi Azikiwe Airport Express', baseFare: 2500, perKm: 300 }
];

export const VEHICLE_TYPES = {
  STANDARD: { id: 'standard', name: 'Standard Sedan', multiplier: 1.0, capacity: 4 },
  COMFORT: { id: 'comfort', name: 'Comfort Executive', multiplier: 1.35, capacity: 4 },
  OKADA: { id: 'okada', name: 'Express Okada / Bike', multiplier: 0.65, capacity: 1 }
};

export const INITIAL_DRIVERS = [
  {
    id: 'drv_101',
    name: 'Ibrahim Danladi',
    phone: '+234 803 111 2233',
    vehicle: 'Toyota Corolla 2018 (Abuja ABJ-482-AA)',
    type: 'standard',
    rating: 4.9,
    tripsCompleted: 412,
    location: { lat: 9.05785, lng: 7.49508, zone: 'wuse2' }, // Wuse II
    status: 'AVAILABLE',
    kycStatus: 'VERIFIED',
    walletBalance: 14500
  },
  {
    id: 'drv_102',
    name: 'Chidi Okonkwo',
    phone: '+234 802 999 4455',
    vehicle: 'Honda Accord 2017 (Abuja GWA-119-XY)',
    type: 'comfort',
    rating: 4.85,
    tripsCompleted: 289,
    location: { lat: 9.07648, lng: 7.39857, zone: 'gwarinpa' }, // Gwarinpa
    status: 'AVAILABLE',
    kycStatus: 'VERIFIED',
    walletBalance: 22100
  },
  {
    id: 'drv_103',
    name: 'Musa Abdullahi',
    phone: '+234 814 333 7788',
    vehicle: 'TVS Max 125 Bike (Abuja LUG-772-BK)',
    type: 'okada',
    rating: 4.78,
    tripsCompleted: 560,
    location: { lat: 9.03333, lng: 7.48333, zone: 'cbd' }, // CBD
    status: 'AVAILABLE',
    kycStatus: 'VERIFIED',
    walletBalance: 8300
  },
  {
    id: 'drv_104',
    name: 'Usman Garba',
    phone: '+234 809 444 1122',
    vehicle: 'Hyundai Elantra 2019 (Abuja KUB-334-ZZ)',
    type: 'standard',
    rating: 4.6,
    tripsCompleted: 94,
    location: { lat: 9.06000, lng: 7.49000, zone: 'wuse2' },
    status: 'PENDING_APPROVAL',
    kycStatus: 'SUBMITTED',
    walletBalance: 0
  }
];

export const INITIAL_RIDES = [
  {
    id: 'ride_901',
    passengerName: 'Amina Bello',
    passengerPhone: '+234 812 000 1111',
    pickupLocation: 'Wuse Market, Abuja',
    dropoffLocation: 'Nnamdi Azikiwe Airport',
    pickupCoords: { lat: 9.0620, lng: 7.4720 },
    dropoffCoords: { lat: 9.0068, lng: 7.2631 },
    vehicleType: 'standard',
    isCarpool: true,
    carpoolPartner: 'Femi Adebayo',
    status: 'IN_PROGRESS',
    fare: 3800,
    originalFare: 5500,
    driverId: 'drv_101',
    qrCode: 'ABJ-QR-901-X7',
    paymentMethod: 'Paystack',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  }
];

export const INITIAL_KYC_DOCS = [
  {
    driverId: 'drv_104',
    driverName: 'Usman Garba',
    nin: '12345678901',
    licenseNo: 'ABJ-DL-99210',
    vehicleReg: 'Abuja KUB-334-ZZ',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'PENDING'
  }
];
