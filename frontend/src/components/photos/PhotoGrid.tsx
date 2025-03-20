import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { PhotoCard } from './PhotoCard';
import { Photo } from '../../types';

interface PhotoGridProps {
  photos: Photo[];
  loading?: boolean;
  error?: string;
  onPhotoClick: (photo: Photo) => void;
  onShareClick?: (photo: Photo) => void;
  onLikeClick?: (photo: Photo) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  loading,
  error,
  onPhotoClick,
  onShareClick,
  onLikeClick,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <Typography color="text.secondary">No photos found</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {photos.map((photo) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={3}
          key={photo.id}
          sx={{ display: 'flex' }}
        >
          <PhotoCard
            photo={photo}
            onPhotoClick={onPhotoClick}
            onShareClick={onShareClick}
            onLikeClick={onLikeClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};
