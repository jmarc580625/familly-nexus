import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Chip,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Close,
  CalendarToday,
  LocationOn,
  Label,
  PeopleAlt,
} from '@mui/icons-material';
import { Photo, Person } from '../../types';
import { format } from 'date-fns';

interface PhotoDetailProps {
  photo: Photo;
  open: boolean;
  onClose: () => void;
  onPersonClick?: (person: Person) => void;
}

export const PhotoDetail: React.FC<PhotoDetailProps> = ({
  photo,
  open,
  onClose,
  onPersonClick,
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
            <Close />
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
                Taken on {format(new Date(photo.takenAt), 'PPP')}
              </Typography>
              {photo.location && (
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LocationOn fontSize="small" />
                  {photo.location.name || 'View on map'}
                </Typography>
              )}
            </Box>

            {photo.tags.length > 0 && (
              <Box mb={3}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Label fontSize="small" />
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {photo.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {photo.people.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PeopleAlt fontSize="small" />
                  People in this photo
                </Typography>
                <List>
                  {photo.people.map((person) => (
                    <React.Fragment key={person.id}>
                      <ListItem
                        button
                        onClick={() => onPersonClick?.(person)}
                      >
                        <ListItemAvatar>
                          <Avatar src={person.avatarUrl} alt={person.name}>
                            {person.name[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={person.name}
                          secondary={
                            person.birthDate &&
                            `Born ${format(
                              new Date(person.birthDate),
                              'PP'
                            )}`
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};
