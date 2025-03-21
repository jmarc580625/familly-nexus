import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LocationPicker } from '../LocationPicker';
import { Location } from '../../../services/geocoding';

// Mock leaflet modules
jest.mock('react-leaflet', () => {
  let mapClickHandler: ((e: any) => void) | null = null;

  const MapContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  );
  MapContainer.displayName = 'MapContainer';

  const TileLayer = () => null;
  TileLayer.displayName = 'TileLayer';

  const Marker = () => null;
  Marker.displayName = 'Marker';

  const useMapEvents = (events: { click: (e: any) => void }) => {
    mapClickHandler = events.click;
    return null;
  };

  return {
    MapContainer: (props: any) => <MapContainer {...props} />,
    TileLayer: () => <TileLayer />,
    Marker: () => <Marker />,
    useMapEvents,
    __triggerMapClick: (e: any) => mapClickHandler?.(e),
  };
});

// Mock leaflet Icon and other leaflet dependencies
jest.mock('leaflet', () => {
  const Icon = function(options: any) {
    return Object.assign({}, options);
  };

  Object.assign(Icon, {
    Default: {
      mergeOptions: jest.fn(),
    },
  });

  class LatLng {
    lat: number;
    lng: number;
    constructor(lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    }
  }

  return { Icon, LatLng };
});

// Mock image imports
jest.mock('leaflet/dist/images/marker-icon-2x.png', () => 'marker-icon-2x.png');
jest.mock('leaflet/dist/images/marker-icon.png', () => 'marker-icon.png');
jest.mock('leaflet/dist/images/marker-shadow.png', () => 'marker-shadow.png');

// Mock geocoding service
const mockReverseGeocode = jest.fn().mockResolvedValue({
  name: 'Test Location',
  latitude: 51.505,
  longitude: -0.09,
});

jest.mock('../../../services/geocoding', () => ({
  reverseGeocode: (...args: any[]) => mockReverseGeocode(...args),
  debounce: (fn: Function) => fn,
}));

describe('LocationPicker', () => {
  const mockOnClose = jest.fn();
  const mockOnLocationSelected = jest.fn();
  const mockInitialLocation: Location = {
    name: 'Test Location',
    latitude: 51.505,
    longitude: -0.09,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockReverseGeocode.mockClear();
  });

  it('renders with initial location', () => {
    render(
      <LocationPicker
        open={true}
        onClose={mockOnClose}
        onLocationSelected={mockOnLocationSelected}
        initialLocation={mockInitialLocation}
      />
    );

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toHaveValue(51.505);
    expect(screen.getByLabelText(/longitude/i)).toHaveValue(-0.09);
    expect(screen.getByLabelText(/location name/i)).toHaveValue('Test Location');
  });

  it('handles map click', async () => {
    mockReverseGeocode.mockResolvedValueOnce({
      name: 'New Location',
      latitude: 51.5,
      longitude: -0.1,
    });

    render(
      <LocationPicker
        open={true}
        onClose={mockOnClose}
        onLocationSelected={mockOnLocationSelected}
      />
    );

    const clickEvent = { latlng: { lat: 51.5, lng: -0.1 } };
    const reactLeaflet = jest.requireMock('react-leaflet');
    
    await act(async () => {
      reactLeaflet.__triggerMapClick(clickEvent);
      await Promise.resolve(); // Wait for state updates
    });

    await waitFor(() => {
      expect(mockReverseGeocode).toHaveBeenCalledWith(51.5, -0.1);
      expect(screen.getByLabelText(/latitude/i)).toHaveValue(51.5);
      expect(screen.getByLabelText(/longitude/i)).toHaveValue(-0.1);
      expect(screen.getByLabelText(/location name/i)).toHaveValue('New Location');
    });
  });

  it('handles manual coordinate input', async () => {
    mockReverseGeocode.mockResolvedValueOnce({
      name: 'New Location',
      latitude: 52,
      longitude: 1,
    });

    render(
      <LocationPicker
        open={true}
        onClose={mockOnClose}
        onLocationSelected={mockOnLocationSelected}
      />
    );

    const latInput = screen.getByLabelText(/latitude/i);
    const lngInput = screen.getByLabelText(/longitude/i);

    await act(async () => {
      fireEvent.change(latInput, { target: { value: '52' } });
      await Promise.resolve(); // Wait for state updates
      fireEvent.change(lngInput, { target: { value: '1' } });
      await Promise.resolve(); // Wait for state updates
    });

    await waitFor(() => {
      expect(mockReverseGeocode).toHaveBeenCalledWith(52, 1);
      expect(latInput).toHaveValue(52);
      expect(lngInput).toHaveValue(1);
      expect(screen.getByLabelText(/location name/i)).toHaveValue('New Location');
    });
  });

  it('handles location name input', async () => {
    render(
      <LocationPicker
        open={true}
        onClose={mockOnClose}
        onLocationSelected={mockOnLocationSelected}
      />
    );

    const nameInput = screen.getByLabelText(/location name/i);
    
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New York' } });
      await Promise.resolve(); // Wait for state updates
    });

    expect(screen.getByLabelText(/location name/i)).toHaveValue('New York');
  });

  it('shows loading state during geocoding', async () => {
    mockReverseGeocode.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        name: 'New Location',
        latitude: 51.5,
        longitude: -0.1,
      }), 100))
    );

    render(
      <LocationPicker
        open={true}
        onClose={mockOnClose}
        onLocationSelected={mockOnLocationSelected}
      />
    );

    const clickEvent = { latlng: { lat: 51.5, lng: -0.1 } };
    const reactLeaflet = jest.requireMock('react-leaflet');
    
    await act(async () => {
      reactLeaflet.__triggerMapClick(clickEvent);
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByLabelText(/location name/i)).toHaveValue('New Location');
    });
  });

  it('handles location selection', async () => {
    render(
      <LocationPicker
        open={true}
        onClose={mockOnClose}
        onLocationSelected={mockOnLocationSelected}
        initialLocation={mockInitialLocation}
      />
    );

    const selectButton = screen.getByRole('button', { name: /save location/i });
    
    await act(async () => {
      fireEvent.click(selectButton);
      await Promise.resolve(); // Wait for state updates
    });

    expect(mockOnLocationSelected).toHaveBeenCalledWith(mockInitialLocation);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
