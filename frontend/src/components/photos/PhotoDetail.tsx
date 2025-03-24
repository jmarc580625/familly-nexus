import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Grid,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn,
  Tag as TagIcon,
  Person as PersonIcon,
  CalendarToday,
  LocalOffer,
  PeopleAlt,
} from '@mui/icons-material';
import { Photo, Person } from '../../types';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PhotoDetailProps {
  photo: Photo;
  people: Person[];
  open: boolean;
  onClose: () => void;
  onPersonClick?: (person: Person) => void;
  onTagClick?: (tag: string) => void;
}

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

export const PhotoDetail: React.FC<PhotoDetailProps> = ({
  photo,
  people,
  open,
  onClose,
  onPersonClick,
  onTagClick,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="body"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{photo.title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                overflow: 'hidden',
                borderRadius: 1,
              }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            {photo.description && (
              <Box mb={3}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {photo.description}
                </Typography>
              </Box>
            )}

            <Box mb={3}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CalendarToday fontSize="small" />
                {photo.date_taken && formatDate(photo.date_taken)}
              </Typography>
              {photo.location_name && (
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <LocationOn fontSize="small" />
                  {photo.location_name}
                </Typography>
              )}
            </Box>

            {photo.tags && photo.tags.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocalOffer fontSize="small" />
                  Tags
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {photo.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => onTagClick?.(tag)}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {photo.people && photo.people.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PeopleAlt fontSize="small" />
                  People
                </Typography>
                <List disablePadding>
                  {photo.people.map((personId) => {
                    // Find the person in the people prop
                    const person = people?.find(p => p.id === personId);
                    if (!person) return null;
                    return (
                      <React.Fragment key={person.id}>
                        <ListItem
                          onClick={() => onPersonClick?.(person)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemText primary={person.name} />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
