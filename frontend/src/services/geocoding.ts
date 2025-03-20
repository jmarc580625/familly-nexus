interface NominatimResponse {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Get a formatted location name from address components
 */
const formatLocationName = (address: NominatimResponse['address']): string => {
  // Try to get the most specific location name first
  const locationParts = [
    address.neighbourhood,
    address.suburb,
    address.village,
    address.town,
    address.city,
  ].filter(Boolean);

  const regionParts = [address.county, address.state, address.country].filter(Boolean);

  if (locationParts.length > 0) {
    return `${locationParts[0]}, ${regionParts[0]}`;
  }

  return regionParts.join(', ');
};

/**
 * Get location details from coordinates using OpenStreetMap's Nominatim service
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<Location> => {
  try {
    // Add a random number to avoid caching issues
    const timestamp = Date.now();
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/reverse?` +
        `format=json&` +
        `lat=${latitude}&` +
        `lon=${longitude}&` +
        `zoom=18&` +  // Higher zoom level for more specific results
        `addressdetails=1&` +  // Include address details
        `_=${timestamp}`,  // Cache buster
      {
        headers: {
          'User-Agent': 'FamilyNexus/1.0',  // Required by Nominatim ToS
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data: NominatimResponse = await response.json();
    
    return {
      name: formatLocationName(data.address),
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return {
      name: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      latitude,
      longitude,
    };
  }
};

/**
 * Debounce a function call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
