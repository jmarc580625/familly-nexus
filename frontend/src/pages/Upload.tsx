import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { PhotoUpload } from '../components/photos/PhotoUpload';
import { Photo, Person } from '../types';

export const Upload: React.FC = () => {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedPeople, setSuggestedPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Fetch tags
        const tagsResponse = await fetch('/api/photos/tags');
        if (!tagsResponse.ok) {
          throw new Error('Failed to fetch tags');
        }
        const tagsResult = await tagsResponse.json();
        setSuggestedTags(tagsResult.data);

        // Fetch people
        const peopleResponse = await fetch('/api/persons');
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
