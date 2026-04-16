const AMENITY_PATTERNS: Array<{pattern: RegExp; icon: string}> = [
  {pattern: /wifi|internet/i, icon: 'wifi-outline'},
  {pattern: /agua caliente|caliente/i, icon: 'thermometer-outline'},
  {pattern: /ba[nñ]o|bath|accesorios/i, icon: 'water-outline'},
  {pattern: /restaurante|restaurant|comida|desayuno/i, icon: 'restaurant-outline'},
  {pattern: /aire|ac\b|cooling|clima/i, icon: 'snow-outline'},
  {pattern: /piscina|pool/i, icon: 'water'},
  {pattern: /parking|parqueadero|estacionamiento/i, icon: 'car-outline'},
  {pattern: /tv|televisi[oó]n/i, icon: 'tv-outline'},
  {pattern: /gym|gimnasio/i, icon: 'barbell-outline'},
  {pattern: /mascotas|pet/i, icon: 'paw-outline'},
];

const DEFAULT_ICON = 'checkmark-circle-outline';

export const getAmenityIcon = (name: string): string => {
  if (!name) {
    return DEFAULT_ICON;
  }
  for (const {pattern, icon} of AMENITY_PATTERNS) {
    if (pattern.test(name)) {
      return icon;
    }
  }
  return DEFAULT_ICON;
};
