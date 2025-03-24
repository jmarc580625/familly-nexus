import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { PhotoCard } from './PhotoCard';
import { Photo } from '../../types';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
}) => {
  return (
    <Grid container spacing={2}>
      {photos.map((photo) => (
        <Grid item key={photo.id} xs={12} sm={6} md={4} lg={3}>
          <PhotoCard
            photo={photo}
            onClick={() => onPhotoClick(photo)}
          />
        </Grid>
      ))}
    </Grid>
  );
};
