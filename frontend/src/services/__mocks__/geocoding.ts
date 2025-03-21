import { Location } from '../geocoding';

export const reverseGeocode = jest.fn(
  async (latitude: number, longitude: number): Promise<Location> => ({
    name: 'Mocked Location Name',
    latitude,
    longitude,
  })
);

export const debounce = (fn: Function) => fn; // Disable debounce in tests
