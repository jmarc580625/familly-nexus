import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Search, FilterList, Clear } from '@mui/icons-material';
import { PhotoGrid } from '../components/photos/PhotoGrid';
import { PhotoDetail } from '../components/photos/PhotoDetail';
import { Photo } from '../types';

// TODO: Replace with actual API call
const MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://picsum.photos/800/600',
    title: 'Family Reunion 2024',
    description: 'Annual family gathering at Grandma\'s house',
    takenAt: '2024-07-04T15:30:00Z',
    uploadedAt: '2024-07-05T10:00:00Z',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      name: 'New York, NY'
    },
    tags: ['family', 'reunion', 'summer'],
    people: [
      {
        id: '1',
        name: 'John Smith',
        birthDate: '1950-03-15',
        relationships: [],
        photos: []
      },
      {
        id: '2',
        name: 'Jane Smith',
        birthDate: '1952-06-22',
        relationships: [],
        photos: []
      }
    ]
  },
  // Add more mock photos as needed
];

export const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    // TODO: Implement search functionality
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    // TODO: Implement sorting functionality
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // TODO: Reset search results
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseDetail = () => {
    setSelectedPhoto(null);
  };

  const handleShareClick = (photo: Photo) => {
    // TODO: Implement share functionality
    console.log('Share photo:', photo);
  };

  const handleLikeClick = (photo: Photo) => {
    // TODO: Implement like functionality
    console.log('Like photo:', photo);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar
        sx={{
          mb: 2,
          px: { sm: 3 },
          gap: 2,
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder="Search photos..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="sort-select-label">Sort by</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="Sort by"
            onChange={handleSortChange}
            startAdornment={
              <InputAdornment position="start">
                <FilterList />
              </InputAdornment>
            }
          >
            <MenuItem value="date">Date Taken</MenuItem>
            <MenuItem value="upload">Date Uploaded</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="people">Number of People</MenuItem>
          </Select>
        </FormControl>
      </Toolbar>

      <Typography variant="h5" gutterBottom>
        Family Photos
      </Typography>

      <PhotoGrid
        photos={photos}
        loading={loading}
        error={error}
        onPhotoClick={handlePhotoClick}
        onShareClick={handleShareClick}
        onLikeClick={handleLikeClick}
      />

      {selectedPhoto && (
        <PhotoDetail
          photo={selectedPhoto}
          open={Boolean(selectedPhoto)}
          onClose={handleCloseDetail}
        />
      )}
    </Box>
  );
};
