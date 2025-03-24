import React from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  Stack,
  Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Person } from '../../types';

interface PhotoFilters {
  startDate?: Date | null;
  endDate?: Date | null;
  tags: string[];
  people: number[];
  location?: string;
}

interface PersonFilters {
  birthDateStart?: Date | null;
  birthDateEnd?: Date | null;
  deathDateStart?: Date | null;
  deathDateEnd?: Date | null;
  living?: boolean;
  relatedTo?: number;
}

interface SearchFiltersProps {
  type: 'photos' | 'persons';
  filters: PhotoFilters | PersonFilters;
  availableTags?: string[];
  availablePeople?: Person[];
  onFilterChange: (filters: PhotoFilters | PersonFilters) => void;
  onReset: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  type,
  filters,
  availableTags = [],
  availablePeople = [],
  onFilterChange,
  onReset
}) => {
  const handlePhotoFilterChange = (updates: Partial<PhotoFilters>) => {
    if (type === 'photos') {
      onFilterChange({ ...filters as PhotoFilters, ...updates });
    }
  };

  const handlePersonFilterChange = (updates: Partial<PersonFilters>) => {
    if (type === 'persons') {
      onFilterChange({ ...filters as PersonFilters, ...updates });
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Stack spacing={3}>
        <Typography variant="h6">
          Filtres {type === 'photos' ? 'Photos' : 'Personnes'}
        </Typography>

        {type === 'photos' ? (
          // Filtres pour les photos
          <>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Date de prise de vue
              </Typography>
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Du"
                  value={(filters as PhotoFilters).startDate}
                  onChange={(date) => handlePhotoFilterChange({ startDate: date })}
                />
                <DatePicker
                  label="Au"
                  value={(filters as PhotoFilters).endDate}
                  onChange={(date) => handlePhotoFilterChange({ endDate: date })}
                />
              </Stack>
            </Box>

            <FormControl fullWidth>
              <Autocomplete
                multiple
                value={availableTags.filter(tag => 
                  (filters as PhotoFilters).tags.includes(tag)
                )}
                onChange={(_, newValue) => 
                  handlePhotoFilterChange({ tags: newValue })
                }
                options={availableTags}
                renderTags={(value, getTagProps) =>
                  value.map((tag, index) => (
                    <Chip
                      label={tag}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Sélectionner des tags"
                  />
                )}
              />
            </FormControl>

            <FormControl fullWidth>
              <Autocomplete
                multiple
                value={availablePeople.filter(person => 
                  (filters as PhotoFilters).people.includes(person.id)
                )}
                onChange={(_, newValue) => 
                  handlePhotoFilterChange({ 
                    people: newValue.map(person => person.id) 
                  })
                }
                options={availablePeople}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) =>
                  value.map((person, index) => (
                    <Chip
                      label={person.name}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Personnes"
                    placeholder="Sélectionner des personnes"
                  />
                )}
              />
            </FormControl>

            <TextField
              fullWidth
              label="Lieu"
              value={(filters as PhotoFilters).location || ''}
              onChange={(e) => 
                handlePhotoFilterChange({ location: e.target.value })
              }
            />
          </>
        ) : (
          // Filtres pour les personnes
          <>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Date de naissance
              </Typography>
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Du"
                  value={(filters as PersonFilters).birthDateStart}
                  onChange={(date) => 
                    handlePersonFilterChange({ birthDateStart: date })
                  }
                />
                <DatePicker
                  label="Au"
                  value={(filters as PersonFilters).birthDateEnd}
                  onChange={(date) => 
                    handlePersonFilterChange({ birthDateEnd: date })
                  }
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Date de décès
              </Typography>
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Du"
                  value={(filters as PersonFilters).deathDateStart}
                  onChange={(date) => 
                    handlePersonFilterChange({ deathDateStart: date })
                  }
                />
                <DatePicker
                  label="Au"
                  value={(filters as PersonFilters).deathDateEnd}
                  onChange={(date) => 
                    handlePersonFilterChange({ deathDateEnd: date })
                  }
                />
              </Stack>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={(filters as PersonFilters).living || false}
                  onChange={(e) => 
                    handlePersonFilterChange({ living: e.target.checked })
                  }
                />
              }
              label="Personnes vivantes uniquement"
            />

            <FormControl fullWidth>
              <Autocomplete
                value={availablePeople.find(
                  person => person.id === (filters as PersonFilters).relatedTo
                ) || null}
                onChange={(_, newValue) => 
                  handlePersonFilterChange({ 
                    relatedTo: newValue ? newValue.id : undefined 
                  })
                }
                options={availablePeople}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="En relation avec"
                    placeholder="Sélectionner une personne"
                  />
                )}
              />
            </FormControl>
          </>
        )}

        <Button
          variant="outlined"
          onClick={onReset}
          fullWidth
        >
          Réinitialiser les filtres
        </Button>
      </Stack>
    </Paper>
  );
};
