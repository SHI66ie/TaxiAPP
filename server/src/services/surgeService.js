// Uber-Style Dynamic Surge Pricing & Heatmap Analytics Engine
let districtSurgeData = {
  maitama: { id: 'maitama', name: 'Maitama District', activeDemand: 42, activeDrivers: 14, multiplier: 1.8, level: 'HIGH' },
  wuse2: { id: 'wuse2', name: 'Wuse II Commercial Corridor', activeDemand: 58, activeDrivers: 26, multiplier: 1.4, level: 'MEDIUM' },
  cbd: { id: 'cbd', name: 'Central Business District (CBD)', activeDemand: 65, activeDrivers: 30, multiplier: 1.3, level: 'MEDIUM' },
  gwarinpa: { id: 'gwarinpa', name: 'Gwarinpa Estate', activeDemand: 22, activeDrivers: 20, multiplier: 1.0, level: 'NORMAL' },
  airport: { id: 'airport', name: 'Airport Express Corridor', activeDemand: 34, activeDrivers: 12, multiplier: 2.1, level: 'CRITICAL' },
  utako: { id: 'utako', name: 'Utako Motor Park & Market', activeDemand: 38, activeDrivers: 19, multiplier: 1.2, level: 'NORMAL' }
};

export function getSurgeZones() {
  return Object.values(districtSurgeData);
}

export function updateZoneDemand(zoneId, demandDelta, driverDelta) {
  const zone = districtSurgeData[zoneId];
  if (!zone) return null;

  zone.activeDemand = Math.max(5, zone.activeDemand + (demandDelta || 0));
  zone.activeDrivers = Math.max(2, zone.activeDrivers + (driverDelta || 0));

  const ratio = zone.activeDemand / zone.activeDrivers;
  let mult = 1.0;
  let level = 'NORMAL';

  if (ratio > 3.0) {
    mult = 2.2;
    level = 'CRITICAL';
  } else if (ratio > 2.0) {
    mult = 1.7;
    level = 'HIGH';
  } else if (ratio > 1.3) {
    mult = 1.3;
    level = 'MEDIUM';
  }

  zone.multiplier = Math.round(mult * 10) / 10;
  zone.level = level;

  return zone;
}

export function getSurgeMultiplierForCoords(lat, lng) {
  // Determine closest zone based on coordinates or return max surge if near airport/Maitama
  if (lat > 9.070 && lng > 7.480) {
    return districtSurgeData.maitama.multiplier;
  } else if (lat < 9.030) {
    return districtSurgeData.airport.multiplier;
  } else if (lng > 7.480) {
    return districtSurgeData.cbd.multiplier;
  }
  return districtSurgeData.wuse2.multiplier;
}
