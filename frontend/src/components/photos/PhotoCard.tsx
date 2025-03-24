import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { LocationOn, PeopleAlt } from '@mui/icons-material';
import { Photo } from '../../types';
import { format } from 'date-fns';

interface PhotoCardProps {
  photo: Photo;
  onClick: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onClick,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => onClick(photo)}
      role="article"
      aria-label={photo.title}
    >
      <CardMedia
        component="img"
        height="200"
        image={photo.url}
        alt={photo.title || 'Photo'}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {photo.title}
        </Typography>
        
        {photo.location_name && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {photo.location_name}
            </Typography>
          </Box>
        )}

        {photo.people && photo.people.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PeopleAlt fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {photo.people.length} {photo.people.length === 1 ? 'person' : 'people'}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {photo.tags?.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ maxWidth: 100 }}
            />
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {photo.date_taken ? format(new Date(photo.date_taken), 'MMM d, yyyy') : 'Unknown date'}
        </Typography>
      </CardContent>
    </Card>
  );
};
