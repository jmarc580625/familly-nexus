/** @jsxImportSource @emotion/react */
import { useState, useCallback, useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  Chip,
  Autocomplete,
  Alert,
  AutocompleteRenderInputParams,
  AutocompleteRenderGetTagProps,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  AddLocation,
  Tag,
  Person,
} from '@mui/icons-material';
import { useDropzone, DropzoneOptions, FileRejection } from 'react-dropzone';
import { Photo, Person as PersonType } from '../../types';
import { LocationPicker } from './LocationPicker';
import { API_BASE_URL, MAX_UPLOAD_SIZE, SUPPORTED_IMAGE_TYPES, SUPPORTED_IMAGE_EXTENSIONS } from '../../config';

interface PhotoUploadProps {
  onUploadComplete?: (photos: Photo[]) => void;
  suggestedTags?: string[];
  suggestedPeople?: PersonType[];
}

interface FileMetadata {
  title: string;
  description: string;
  tags: string[];
  people: string[];
  location?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface UploadFile {
  file: File;
  preview: string;
  id: string;
  metadata: FileMetadata;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onUploadComplete,
  suggestedTags = [],
  suggestedPeople = [],
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map((file) =>
        file.errors.map((error) => `${file.file.name}: ${error.message}`).join(', ')
      );
      setError(errors.join('\n'));
      return;
    }

    const newFiles = acceptedFiles.map((file) => {
      const newUploadFile: UploadFile = {
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
        metadata: {
          title: file.name.split('.')[0],
          description: '',
          tags: [],
          people: [],
        },
      };
      return newUploadFile;
    });
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': SUPPORTED_IMAGE_EXTENSIONS },
    maxSize: MAX_UPLOAD_SIZE,
    multiple: true,
  });

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateMetadata = (id: string, metadata: Partial<FileMetadata>) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, metadata: { ...f.metadata, ...metadata } } : f
      )
    );
  };

  const handleTextFieldChange = (id: string, field: keyof FileMetadata) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleUpdateMetadata(id, { [field]: e.target.value });
  };

  const handleTagsChange = (_event: unknown, newValue: string[], id: string) => {
    handleUpdateMetadata(id, { tags: newValue });
  };

  const handlePeopleChange = (_event: unknown, newValue: string[], id: string) => {
    handleUpdateMetadata(id, { people: newValue });
  };

  const handleLocationClick = (id: string) => {
    setCurrentFileId(id);
    setLocationPickerOpen(true);
  };

  const handleLocationSelected = (location: {
    name: string;
    latitude: number;
    longitude: number;
  }) => {
    if (currentFileId) {
      handleUpdateMetadata(currentFileId, { location });
    }
    setLocationPickerOpen(false);
    setCurrentFileId(null);
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const uploadedPhotos: Photo[] = [];
      let progress = 0;

      for (const uploadFile of files) {
        if (!uploadFile.metadata.title) {
          throw new Error('Please provide a title for all photos');
        }

        const formData = new FormData();
        formData.append('photo', uploadFile.file);
        formData.append('title', uploadFile.metadata.title);
        formData.append('description', uploadFile.metadata.description);
        uploadFile.metadata.tags.forEach((tag) => formData.append('tags[]', tag));
        uploadFile.metadata.people.forEach((person) => formData.append('people[]', person));

        if (uploadFile.metadata.location) {
          formData.append('location_name', uploadFile.metadata.location.name);
          formData.append('latitude', uploadFile.metadata.location.latitude.toString());
          formData.append('longitude', uploadFile.metadata.location.longitude.toString());
        }

        const response = await fetch(`${API_BASE_URL}/api/photos`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to upload ${uploadFile.metadata.title}`);
        }

        const result = await response.json();
        uploadedPhotos.push(result.data);

        progress += 100 / files.length;
        setUploadProgress(Math.round(progress));
      }

      onUploadComplete?.(uploadedPhotos);
      setFiles([]);
      setUploadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h6" align="center">
            {isDragActive
              ? 'Drop the photos here...'
              : 'Drag and drop photos here, or click to select files'}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Supported formats: {SUPPORTED_IMAGE_TYPES.join(', ')}
            <br />
            Maximum file size: {MAX_UPLOAD_SIZE / (1024 * 1024)}MB
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {files.map((file) => (
          <Grid item xs={12} sm={6} md={4} key={file.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={file.preview}
                alt={file.metadata.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <TextField
                  fullWidth
                  label="Title"
                  value={file.metadata.title}
                  onChange={handleTextFieldChange(file.id, 'title')}
                  margin="dense"
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={file.metadata.description}
                  onChange={handleTextFieldChange(file.id, 'description')}
                  margin="dense"
                  multiline
                  rows={2}
                />
                <Autocomplete
                  multiple
                  freeSolo
                  options={suggestedTags}
                  value={file.metadata.tags}
                  onChange={(e, newValue) => handleTagsChange(e, newValue, file.id)}
                  renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        size="small"
                        icon={<Tag />}
                      />
                    ))
                  }
                  renderInput={(params: AutocompleteRenderInputParams) => (
                    <TextField {...params} label="Tags" margin="dense" />
                  )}
                  sx={{ mt: 1 }}
                />
                <Autocomplete
                  multiple
                  freeSolo
                  options={suggestedPeople.map((p) => p.name)}
                  value={file.metadata.people}
                  onChange={(e, newValue) => handlePeopleChange(e, newValue, file.id)}
                  renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                      />
                    ))
                  }
                  renderInput={(params: AutocompleteRenderInputParams) => (
                    <TextField {...params} label="People" margin="dense" />
                  )}
                  sx={{ mt: 1 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<AddLocation />}
                  onClick={() => handleLocationClick(file.id)}
                >
                  {file.metadata.location ? 'Change Location' : 'Add Location'}
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveFile(file.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
              {file.metadata.location && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Location: {file.metadata.location.name}
                  </Typography>
                </Box>
              )}
              {file.metadata.people.length > 0 && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {suggestedPeople
                      .filter((person) =>
                        file.metadata.people.includes(person.name)
                      )
                      .map((person) => person.name)
                      .join(', ')}
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Photos'}
          </Button>
          {uploading && (
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
          )}
        </Box>
      )}

      <LocationPicker
        open={locationPickerOpen}
        onClose={() => {
          setLocationPickerOpen(false);
          setCurrentFileId(null);
        }}
        onLocationSelected={handleLocationSelected}
        initialLocation={
          currentFileId
            ? files.find((f) => f.id === currentFileId)?.metadata.location
            : undefined
        }
      />
    </Box>
  );
};
