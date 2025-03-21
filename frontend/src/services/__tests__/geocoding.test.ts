import { reverseGeocode, debounce } from '../geocoding';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('geocoding service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('reverseGeocode', () => {
    const mockLatitude = 40.7128;
    const mockLongitude = -74.0060;

    it('returns formatted location data when API call succeeds', async () => {
      const mockResponse = {
        display_name: 'Manhattan, New York, USA',
        address: {
          neighbourhood: 'Financial District',
          city: 'New York',
          state: 'New York',
          country: 'USA',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await reverseGeocode(mockLatitude, mockLongitude);

      // Verify the result
      expect(result).toEqual({
        name: 'Financial District, New York',
        latitude: mockLatitude,
        longitude: mockLongitude,
      });

      // Verify API call
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain(`lat=${mockLatitude}`);
      expect(url).toContain(`lon=${mockLongitude}`);
      expect(url).toContain('format=json');
      expect(url).toContain('addressdetails=1');

      // Verify headers
      const options = mockFetch.mock.calls[0][1];
      expect(options.headers['User-Agent']).toBe('FamilyNexus/1.0');
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await reverseGeocode(mockLatitude, mockLongitude);

      // Should return coordinates as name when API fails
      expect(result).toEqual({
        name: '40.712800, -74.006000',
        latitude: mockLatitude,
        longitude: mockLongitude,
      });
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await reverseGeocode(mockLatitude, mockLongitude);

      // Should return coordinates as name when network fails
      expect(result).toEqual({
        name: '40.712800, -74.006000',
        latitude: mockLatitude,
        longitude: mockLongitude,
      });
    });

    it('formats location name correctly with different address combinations', async () => {
      const testCases = [
        {
          address: {
            neighbourhood: 'SoHo',
            city: 'New York',
            state: 'New York',
            country: 'USA',
          },
          expected: 'SoHo, New York',
        },
        {
          address: {
            city: 'New York',
            state: 'New York',
            country: 'USA',
          },
          expected: 'New York, New York',
        },
        {
          address: {
            state: 'New York',
            country: 'USA',
          },
          expected: 'New York, USA',
        },
      ];

      for (const testCase of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ address: testCase.address }),
        });

        const result = await reverseGeocode(mockLatitude, mockLongitude);
        expect(result.name).toBe(testCase.expected);
      }
    });
  });

  describe('debounce', () => {
    it('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      // Call the debounced function
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward time by 500ms
      jest.advanceTimersByTime(500);
      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward remaining time
      jest.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      // Call multiple times
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Fast forward time
      jest.advanceTimersByTime(1000);

      // Should only be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('preserves function arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);

      // Call with arguments
      debouncedFn('test', 123);

      // Fast forward time
      jest.advanceTimersByTime(1000);

      // Should be called with correct arguments
      expect(mockFn).toHaveBeenCalledWith('test', 123);
    });
  });
});
