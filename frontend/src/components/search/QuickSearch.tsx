import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Photo, Person } from '../../types';
import { API_BASE_URL } from '../../config';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SearchResult {
  type: 'photo' | 'person';
  item: Photo | Person;
}

interface QuickSearchProps {
  onPhotoClick?: (photo: Photo) => void;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ onPhotoClick }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    setLoading(true);
    setOptions([]); // Clear options while loading
    try {
      const [photosRes, peopleRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/photos/search?q=${encodeURIComponent(query)}`),
        fetch(`${API_BASE_URL}/api/persons/search?q=${encodeURIComponent(query)}`)
      ]);

      if (!photosRes.ok || !peopleRes.ok) {
        throw new Error('Search failed');
      }

      const [photosData, peopleData] = await Promise.all([
        photosRes.json(),
        peopleRes.json()
      ]);
      
      // Transform API response into SearchResult array
      const results: SearchResult[] = [
        ...photosData.data.map((photo: Photo) => ({ type: 'photo', item: photo })),
        ...peopleData.data.map((person: Person) => ({ type: 'person', item: person })),
      ];
      
      setOptions(results);
    } catch (error) {
      console.error('Search error:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      // Parse ISO 8601 date string
      const date = parseISO(dateString);
      return format(date, 'PPP', { locale: fr });
    } catch (error) {
      console.error('Error parsing date:', error);
      return '';
    }
  };

  const handleOptionClick = (result: SearchResult) => {
    if (result.type === 'photo' && onPhotoClick) {
      onPhotoClick(result.item as Photo);
      setOpen(false);
    } else if (result.type === 'person') {
      navigate(`/family-tree/person/${result.item.id}`);
    }
  };

  const renderOption = (props: any, result: SearchResult) => {
    if (result.type === 'photo') {
      const photo = result.item as Photo;
      return (
        <Card {...props} sx={{ width: '100%', mb: 1 }}>
          <CardActionArea onClick={() => handleOptionClick(result)}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CardMedia
                component="img"
                sx={{ width: 100, height: 100, objectFit: 'cover' }}
                image={photo.url}
                alt={photo.title || 'Photo'}
              />
              <CardContent>
                <Typography variant="subtitle1">{photo.title}</Typography>
                {photo.date_taken && (
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(photo.date_taken)}
                  </Typography>
                )}
                {photo.location_name && (
                  <Typography variant="body2" color="text.secondary">
                    {photo.location_name}
                  </Typography>
                )}
              </CardContent>
            </Box>
          </CardActionArea>
        </Card>
      );
    } else {
      const person = result.item as Person;
      return (
        <Card {...props} sx={{ width: '100%', mb: 1 }}>
          <CardActionArea onClick={() => handleOptionClick(result)}>
            <CardContent>
              <Typography variant="subtitle1">{person.name}</Typography>
              {person.bio && (
                <Typography variant="body2" color="text.secondary">
                  {person.bio}
                </Typography>
              )}
            </CardContent>
          </CardActionArea>
        </Card>
      );
    }
  };

  return (
    <Autocomplete
      id="quick-search"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      filterOptions={(x) => x}
      options={options}
      loading={loading}
      inputValue={inputValue}
      value={null}
      autoSelect={false}
      clearOnBlur={false}
      blurOnSelect={false}
      selectOnFocus={false}
      freeSolo
      onInputChange={(_, value) => {
        setInputValue(value);
        handleSearch(value);
      }}
      getOptionLabel={(option: SearchResult | string) => {
        if (typeof option === 'string') return option;
        return option.type === 'photo'
          ? (option.item as Photo).title || 'Sans titre'
          : (option.item as Person).name;
      }}
      renderOption={renderOption}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Rechercher..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      groupBy={(option) => option.type === 'photo' ? 'Photos' : 'Personnes'}
      sx={{ width: 400 }}
    />
  );
};
