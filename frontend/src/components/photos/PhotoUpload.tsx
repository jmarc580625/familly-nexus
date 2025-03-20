import React, { useCallback, useState } from 'react';
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
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  AddLocation,
  Tag,
  Person,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Photo, Person as PersonType } from '../../types';
import { LocationPicker } from './LocationPicker';

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

interface UploadFile extends File {
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
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
        metadata: {
          title: file.name.split('.')[0],
          description: '',
          tags: [],
          people: [],
        } as FileMetadata,
      })
    ) as UploadFile[];
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 10485760, // 10MB
  });

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleMetadataChange = (
    id: string,
    field: keyof FileMetadata,
    value: any
  ) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id === id) {
          return {
            ...file,
            metadata: {
              ...file.metadata,
              [field]: value,
            },
          };
        }
        return file;
      })
    );
  };

  const uploadSingleFile = async (file: UploadFile): Promise<Photo> => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', file.metadata.title);
    formData.append('description', file.metadata.description);
    
    file.metadata.tags.forEach((tag) => {
      formData.append('tags[]', tag);
    });
    
    file.metadata.people.forEach((personId) => {
      formData.append('people[]', personId);
    });

    if (file.metadata.location) {
      formData.append('location_name', file.metadata.location.name || '');
      formData.append('latitude', file.metadata.location.latitude.toString());
      formData.append('longitude', file.metadata.location.longitude.toString());
    }

    const response = await fetch('/api/photos', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload photo');
    }

    const result = await response.json();
    return result.data;
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const totalFiles = files.length;
      const uploadedPhotos: Photo[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const photo = await uploadSingleFile(file);
        uploadedPhotos.push(photo);
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      onUploadComplete?.(uploadedPhotos);
      setFiles([]);
      setUploadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleLocationSelected = (
    location: { name: string; latitude: number; longitude: number }
  ) => {
    if (selectedFileId) {
      handleMetadataChange(selectedFileId, 'location', location);
    }
    setLocationPickerOpen(false);
    setSelectedFileId(null);
  };

  const openLocationPicker = (fileId: string) => {
    setSelectedFileId(fileId);
    setLocationPickerOpen(true);
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mb: 3,
          textAlign: 'center',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop the photos here'
            : 'Drag and drop photos here, or click to select'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports JPEG, PNG and GIF up to 10MB
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
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
                    {editingFile === file.id ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Title"
                          value={file.metadata.title}
                          onChange={(e) =>
                            handleMetadataChange(file.id, 'title', e.target.value)
                          }
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          label="Description"
                          value={file.metadata.description}
                          onChange={(e) =>
                            handleMetadataChange(
                              file.id,
                              'description',
                              e.target.value
                            )
                          }
                        />
                        <Autocomplete
                          multiple
                          freeSolo
                          options={suggestedTags}
                          value={file.metadata.tags}
                          onChange={(_, newValue) =>
                            handleMetadataChange(file.id, 'tags', newValue)
                          }
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                label={option}
                                {...getTagProps({ index })}
                                size="small"
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Tags" />
                          )}
                        />
                        <Autocomplete
                          multiple
                          options={suggestedPeople}
                          getOptionLabel={(option) => option.name}
                          value={suggestedPeople.filter((p) =>
                            file.metadata.people.includes(p.id)
                          )}
                          onChange={(_, newValue) =>
                            handleMetadataChange(
                              file.id,
                              'people',
                              newValue.map((p) => p.id)
                            )
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="People" />
                          )}
                        />
                        <Button
                          startIcon={<AddLocation />}
                          onClick={() => openLocationPicker(file.id)}
                          variant="outlined"
                          fullWidth
                        >
                          {file.metadata.location
                            ? `Location: ${file.metadata.location.name}`
                            : 'Add Location'}
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          {file.metadata.title}
                        </Typography>
                        {file.metadata.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                            {file.metadata.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" />
                            ))}
                          </Box>
                        )}
                        {file.metadata.location && (
                          <Typography variant="body2" color="text.secondary">
                            📍 {file.metadata.location.name}
                          </Typography>
                        )}
                      </>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setEditingFile(editingFile === file.id ? null : file.id)
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mb: 3 }}>
            {uploading && (
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ mb: 2 }}
              />
            )}
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={uploading}
              fullWidth
            >
              Upload {files.length} Photo{files.length !== 1 && 's'}
            </Button>
          </Box>
        </>
      )}
      <LocationPicker
        open={locationPickerOpen}
        onClose={() => {
          setLocationPickerOpen(false);
          setSelectedFileId(null);
        }}
        onLocationSelected={handleLocationSelected}
        initialLocation={
          selectedFileId
            ? files.find((f) => f.id === selectedFileId)?.metadata.location
            : undefined
        }
      />
    </Box>
  );
};
