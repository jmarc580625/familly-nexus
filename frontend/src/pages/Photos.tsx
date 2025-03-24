import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { PhotoGrid } from '../components/photos/PhotoGrid';
import { API_BASE_URL } from '../config';
import { Photo, Person } from '../types';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { QuickSearch } from '../components/search/QuickSearch';
import { PhotoDetail } from '../components/photos/PhotoDetail';

const Photos: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(() => {
    // Check if we have a previously selected photo
    const savedPhoto = localStorage.getItem('selectedPhoto');
    return savedPhoto ? JSON.parse(savedPhoto) : null;
  });
  const [sortBy, setSortBy] = useState<'date_taken' | 'upload_date' | 'title' | 'location' | 'author' | 'tags' | 'people'>('date_taken');

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/photos`);
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        setPhotos(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    localStorage.setItem('selectedPhoto', JSON.stringify(photo));
  };

  const handleCloseDetail = () => {
    setSelectedPhoto(null);
    localStorage.removeItem('selectedPhoto');
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = parse(dateString, "yyyy-MM-dd'T'HH:mm:ssX", new Date());
      return format(date, 'PPP', { locale: fr });
    } catch (error) {
      console.error('Error parsing date:', error);
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  const sortedPhotos = [...photos].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'location':
        return (a.location_name || '').localeCompare(b.location_name || '');
      case 'author':
        return (a.author || '').localeCompare(b.author || '');
      case 'tags':
        return (b.tags?.length || 0) - (a.tags?.length || 0);
      case 'people':
        return (b.people?.length || 0) - (a.people?.length || 0);
      case 'upload_date':
        if (!a.upload_date && !b.upload_date) return 0;
        if (!a.upload_date) return 1;
        if (!b.upload_date) return -1;
        try {
          const dateA = parse(a.upload_date, "yyyy-MM-dd'T'HH:mm:ssX", new Date());
          const dateB = parse(b.upload_date, "yyyy-MM-dd'T'HH:mm:ssX", new Date());
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Error parsing date:', error);
          return 0;
        }
      case 'date_taken':
      default:
        if (!a.date_taken && !b.date_taken) return 0;
        if (!a.date_taken) return 1;
        if (!b.date_taken) return -1;
        try {
          const dateA = parse(a.date_taken, "yyyy-MM-dd'T'HH:mm:ssX", new Date());
          const dateB = parse(b.date_taken, "yyyy-MM-dd'T'HH:mm:ssX", new Date());
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.error('Error parsing date:', error);
          return 0;
        }
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <QuickSearch onPhotoClick={handlePhotoClick} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Photos</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="sort-select-label">Sort by</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="Sort by"
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <MenuItem value="date_taken">Date Taken</MenuItem>
            <MenuItem value="upload_date">Upload Date</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="location">Location</MenuItem>
            <MenuItem value="author">Author</MenuItem>
            <MenuItem value="tags">Most Tagged</MenuItem>
            <MenuItem value="people">Most People</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {sortedPhotos.length > 0 ? (
        <PhotoGrid photos={sortedPhotos} onPhotoClick={handlePhotoClick} />
      ) : (
        <Typography>Aucune photo trouvée</Typography>
      )}
      {selectedPhoto && (
        <PhotoDetail
          photo={selectedPhoto}
          people={[]} // TODO: Load people data
          open={true}
          onClose={handleCloseDetail}
        />
      )}
    </Box>
  );
};

export default Photos;
