import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { PhotoUpload } from '../components/photos/PhotoUpload';
import { Photo, Person } from '../types';
import { API_BASE_URL } from '../config';

const Upload = (): JSX.Element => {
  const [suggestedTags, setSuggestedTags] = React.useState<string[]>([]);
  const [suggestedPeople, setSuggestedPeople] = React.useState<Person[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Fetch tags
        const tagsResponse = await fetch(`${API_BASE_URL}/api/photos/tags`);
        if (!tagsResponse.ok) {
          throw new Error('Failed to fetch tags');
        }
        const tagsResult = await tagsResponse.json();
        setSuggestedTags(tagsResult.data);

        // Fetch people
        const peopleResponse = await fetch(`${API_BASE_URL}/api/persons`);
        if (!peopleResponse.ok) {
          throw new Error('Failed to fetch people');
        }
        const peopleResult = await peopleResponse.json();
        setSuggestedPeople(peopleResult.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      }
    };

    fetchSuggestions();
  }, []);

  const handleUploadComplete = (photos: Photo[]) => {
    // TODO: Show success message and redirect to photos page
    console.log('Upload completed:', photos);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Upload Photos
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload your family photos and add details like who's in them, when they
        were taken, and any special memories they capture.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <PhotoUpload
          onUploadComplete={handleUploadComplete}
          suggestedTags={suggestedTags}
          suggestedPeople={suggestedPeople}
        />
      </Paper>
    </Box>
  );
};

export default Upload;
