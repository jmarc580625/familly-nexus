import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng, Icon, LeafletMouseEvent } from 'leaflet';
import { reverseGeocode, debounce, Location } from '../../services/geocoding';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in webpack environment
const DefaultIcon = new Icon({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

interface LocationPickerProps {
  open: boolean;
  onClose: () => void;
  onLocationSelected: (location: Location) => void;
  initialLocation?: Location;
}

interface MapEventsProps {
  onLocationClick: (latlng: LatLng) => void;
}

const MapEvents: React.FC<MapEventsProps> = ({ onLocationClick }) => {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onLocationClick(e.latlng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  open,
  onClose,
  onLocationSelected,
  initialLocation,
}) => {
  const [location, setLocation] = useState<Location>({
    name: '',
    latitude: initialLocation?.latitude || 51.505,
    longitude: initialLocation?.longitude || -0.09,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  const updateLocationName = useCallback(
    debounce(async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const newLocation = await reverseGeocode(lat, lng);
        setLocation((prev) => ({
          ...prev,
          name: newLocation.name,
        }));
      } finally {
        setLoading(false);
      }
    }, 1000),
    []
  );

  const handleLocationClick = async (latlng: LatLng) => {
    setLocation((prev) => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
    updateLocationName(latlng.lat, latlng.lng);
  };

  const handleCoordinateChange = (
    field: 'latitude' | 'longitude',
    value: number
  ) => {
    setLocation((prev) => ({
      ...prev,
      [field]: value,
    }));
    updateLocationName(
      field === 'latitude' ? value : location.latitude,
      field === 'longitude' ? value : location.longitude
    );
  };

  const handleSave = () => {
    onLocationSelected(location);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Pick Location</DialogTitle>
      <DialogContent>
        <Box sx={{ height: 400, mb: 2 }}>
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker 
              position={[location.latitude, location.longitude]}
              icon={DefaultIcon}
            />
            <MapEvents onLocationClick={handleLocationClick} />
          </MapContainer>
        </Box>
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            label="Location Name"
            value={location.name}
            onChange={(e) =>
              setLocation((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Central Park, New York"
            sx={{ mb: 2 }}
            disabled={loading}
          />
          {loading && (
            <CircularProgress
              size={20}
              sx={{
                position: 'absolute',
                right: 12,
                top: 12,
              }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Click on the map to set the location, or enter coordinates manually:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            label="Latitude"
            type="number"
            value={location.latitude}
            onChange={(e) =>
              handleCoordinateChange('latitude', parseFloat(e.target.value) || 0)
            }
            inputProps={{
              step: 'any',
              min: -90,
              max: 90,
            }}
          />
          <TextField
            label="Longitude"
            type="number"
            value={location.longitude}
            onChange={(e) =>
              handleCoordinateChange('longitude', parseFloat(e.target.value) || 0)
            }
            inputProps={{
              step: 'any',
              min: -180,
              max: 180,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};
