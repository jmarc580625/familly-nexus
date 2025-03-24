import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  CircularProgress
} from '@mui/material';
import { API_BASE_URL } from '../config';
import { Photo, Person } from '../types';
import { SearchFilters } from '../components/search/SearchFilters';
import { PhotoGrid } from '../components/photos/PhotoGrid';
import { PersonList } from '../components/persons';
import { PhotoDetail } from '../components/photos/PhotoDetail';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface PhotoFilters {
  startDate: Date | null;
  endDate: Date | null;
  tags: string[];
  people: number[];
  location: string;
}

interface PersonFilters {
  birthDateStart: Date | null;
  birthDateEnd: Date | null;
  deathDateStart: Date | null;
  deathDateEnd: Date | null;
  living: boolean;
  relatedTo?: number;
}

interface SearchResults {
  photos: Photo[];
  persons: Person[];
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [results, setResults] = useState<SearchResults>({ photos: [], persons: [] });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availablePeople, setAvailablePeople] = useState<Person[]>([]);

  // Filtres pour les photos
  const [photoFilters, setPhotoFilters] = useState<PhotoFilters>({
    startDate: null,
    endDate: null,
    tags: [],
    people: [],
    location: ''
  });

  // Filtres pour les personnes
  const [personFilters, setPersonFilters] = useState<PersonFilters>({
    birthDateStart: null,
    birthDateEnd: null,
    deathDateStart: null,
    deathDateEnd: null,
    living: false,
    relatedTo: undefined
  });

  // Charger les tags et personnes disponibles
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [tagsRes, peopleRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/photos/tags`),
          fetch(`${API_BASE_URL}/api/persons`)
        ]);

        const [tagsData, peopleData] = await Promise.all([
          tagsRes.json(),
          peopleRes.json()
        ]);

        setAvailableTags(tagsData.data);
        setAvailablePeople(peopleData.data);
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchFilterData();
  }, []);

  // Effectuer la recherche
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        // Update URL params
        const newParams = new URLSearchParams();
        if (query) newParams.set('q', query);
        if (activeTab === 0) {
          // Photo filters
          if (photoFilters.startDate) newParams.set('start_date', photoFilters.startDate.toISOString());
          if (photoFilters.endDate) newParams.set('end_date', photoFilters.endDate.toISOString());
          if (photoFilters.tags.length > 0) photoFilters.tags.forEach(tag => newParams.append('tags[]', tag));
          if (photoFilters.people.length > 0) photoFilters.people.forEach(id => newParams.append('people[]', id.toString()));
          if (photoFilters.location) newParams.set('location', photoFilters.location);
        } else {
          // Person filters
          if (personFilters.birthDateStart) newParams.set('birth_date_start', personFilters.birthDateStart.toISOString());
          if (personFilters.birthDateEnd) newParams.set('birth_date_end', personFilters.birthDateEnd.toISOString());
          if (personFilters.deathDateStart) newParams.set('death_date_start', personFilters.deathDateStart.toISOString());
          if (personFilters.deathDateEnd) newParams.set('death_date_end', personFilters.deathDateEnd.toISOString());
          if (personFilters.living) newParams.set('living', 'true');
          if (personFilters.relatedTo) newParams.set('related_to', personFilters.relatedTo.toString());
        }
        setSearchParams(newParams);

        // Perform search
        const [photosRes, personsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/photos/search?${newParams}`),
          fetch(`${API_BASE_URL}/api/persons/search?${newParams}`)
        ]);

        const [photosData, personsData] = await Promise.all([
          photosRes.json(),
          personsRes.json()
        ]);

        setResults({
          photos: photosData.data,
          persons: personsData.data
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, photoFilters, personFilters, activeTab, setSearchParams]);

  // Load initial state from URL params
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);

    // Load photo filters
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const tags = searchParams.getAll('tags[]');
    const people = searchParams.getAll('people[]').map(Number);
    const location = searchParams.get('location') || '';

    setPhotoFilters({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      tags,
      people,
      location
    });

    // Load person filters
    const birthDateStart = searchParams.get('birth_date_start');
    const birthDateEnd = searchParams.get('birth_date_end');
    const deathDateStart = searchParams.get('death_date_start');
    const deathDateEnd = searchParams.get('death_date_end');
    const living = searchParams.get('living') === 'true';
    const relatedTo = searchParams.get('related_to');

    setPersonFilters({
      birthDateStart: birthDateStart ? new Date(birthDateStart) : null,
      birthDateEnd: birthDateEnd ? new Date(birthDateEnd) : null,
      deathDateStart: deathDateStart ? new Date(deathDateStart) : null,
      deathDateEnd: deathDateEnd ? new Date(deathDateEnd) : null,
      living,
      relatedTo: relatedTo ? Number(relatedTo) : undefined
    });
  }, [searchParams]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Barre de recherche */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Rechercher"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Filtres */}
        <Grid item xs={12} md={3}>
          <SearchFilters
            type={activeTab === 0 ? 'photos' : 'persons'}
            filters={activeTab === 0 ? photoFilters : personFilters}
            availableTags={availableTags}
            availablePeople={availablePeople}
            onFilterChange={(filters) => {
              if (activeTab === 0) {
                setPhotoFilters(filters as PhotoFilters);
              } else {
                setPersonFilters(filters as PersonFilters);
              }
            }}
            onReset={() => {
              if (activeTab === 0) {
                setPhotoFilters({
                  startDate: null,
                  endDate: null,
                  tags: [],
                  people: [],
                  location: ''
                });
              } else {
                setPersonFilters({
                  birthDateStart: null,
                  birthDateEnd: null,
                  deathDateStart: null,
                  deathDateEnd: null,
                  living: false,
                  relatedTo: undefined
                });
              }
            }}
          />
        </Grid>

        {/* Résultats */}
        <Grid item xs={12} md={9}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label={`Photos (${results.photos.length})`} />
              <Tab label={`Personnes (${results.persons.length})`} />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={activeTab} index={0}>
                {results.photos.length > 0 ? (
                  <PhotoGrid photos={results.photos} onPhotoClick={handlePhotoClick} />
                ) : (
                  <Typography variant="body1" sx={{ p: 2 }}>
                    Aucune photo trouvée
                  </Typography>
                )}
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {results.persons.length > 0 ? (
                  <PersonList persons={results.persons} />
                ) : (
                  <Typography variant="body1" sx={{ p: 2 }}>
                    Aucune personne trouvée
                  </Typography>
                )}
              </TabPanel>
            </>
          )}
        </Grid>
      </Grid>

      {/* Photo Detail Dialog */}
      {selectedPhoto && (
        <PhotoDetail
          photo={selectedPhoto}
          people={[]} // TODO: Load people data
          open={true}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </Container>
  );
}
