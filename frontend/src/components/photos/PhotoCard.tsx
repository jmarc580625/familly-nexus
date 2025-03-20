import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  Share,
  Info,
  PeopleAlt,
  LocationOn,
} from '@mui/icons-material';
import { Photo } from '../../types';
import { format } from 'date-fns';

interface PhotoCardProps {
  photo: Photo;
  onPhotoClick: (photo: Photo) => void;
  onShareClick?: (photo: Photo) => void;
  onLikeClick?: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onPhotoClick,
  onShareClick,
  onLikeClick,
}) => {
  return (
    <Card
      sx={{
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={() => onPhotoClick(photo)}
    >
      <CardMedia
        component="img"
        height="200"
        image={photo.url}
        alt={photo.title}
        sx={{
          objectFit: 'cover',
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {photo.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1,
          }}
        >
          {photo.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {photo.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Add tag click handler
              }}
            />
          ))}
          {photo.tags.length > 3 && (
            <Chip
              label={`+${photo.tags.length - 3}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
      <CardActions disableSpacing>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Tooltip title={format(new Date(photo.takenAt), 'PPP')}>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(photo.takenAt), 'PP')}
              </Typography>
            </Tooltip>
          </Box>
          {photo.people.length > 0 && (
            <Tooltip title={`${photo.people.length} people tagged`}>
              <IconButton size="small">
                <PeopleAlt fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {photo.location && (
            <Tooltip title={photo.location.name || 'View location'}>
              <IconButton size="small">
                <LocationOn fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onLikeClick && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick(photo);
              }}
            >
              <Favorite fontSize="small" />
            </IconButton>
          )}
          {onShareClick && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onShareClick(photo);
              }}
            >
              <Share fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small">
            <Info fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};
