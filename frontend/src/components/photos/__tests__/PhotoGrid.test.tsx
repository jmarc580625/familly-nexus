import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoGrid } from '../PhotoGrid';
import { Photo, Person } from '../../../types';

const mockPerson: Person = {
  id: '1',
  name: 'John Doe',
  relationships: [],
  photos: [],
};

const mockPhotos: Photo[] = [
  {
    id: '1',
    title: 'Test Photo 1',
    url: 'https://example.com/photo1.jpg',
    takenAt: '2025-03-20T10:00:00Z',
    uploadedAt: '2025-03-20T12:00:00Z',
    tags: ['family', 'vacation'],
    people: [],
  },
  {
    id: '2',
    title: 'Test Photo 2',
    url: 'https://example.com/photo2.jpg',
    takenAt: '2025-03-20T11:00:00Z',
    uploadedAt: '2025-03-20T13:00:00Z',
    tags: ['family', 'portrait'],
    people: [mockPerson],
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      name: 'New York City',
    },
  },
];

describe('PhotoGrid', () => {
  const onPhotoClick = jest.fn();
  const onShareClick = jest.fn();
  const onLikeClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    render(
      <PhotoGrid
        photos={[]}
        loading={true}
        onPhotoClick={onPhotoClick}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Failed to load photos';
    render(
      <PhotoGrid
        photos={[]}
        error={errorMessage}
        onPhotoClick={onPhotoClick}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <PhotoGrid
        photos={[]}
        onPhotoClick={onPhotoClick}
      />
    );

    expect(screen.getByText('No photos found')).toBeInTheDocument();
  });

  it('renders photos in a grid', () => {
    render(
      <PhotoGrid
        photos={mockPhotos}
        onPhotoClick={onPhotoClick}
        onShareClick={onShareClick}
        onLikeClick={onLikeClick}
      />
    );

    // Check if all photos are rendered
    mockPhotos.forEach(photo => {
      const photoCard = screen.getByRole('article', { name: photo.title });
      expect(photoCard).toBeInTheDocument();
      expect(screen.getByRole('img', { name: photo.title })).toBeInTheDocument();
    });
  });

  it('handles photo click', () => {
    render(
      <PhotoGrid
        photos={mockPhotos}
        onPhotoClick={onPhotoClick}
      />
    );

    const firstPhoto = screen.getByRole('article', { name: mockPhotos[0].title });
    fireEvent.click(firstPhoto);

    expect(onPhotoClick).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('handles share click', () => {
    render(
      <PhotoGrid
        photos={mockPhotos}
        onPhotoClick={onPhotoClick}
        onShareClick={onShareClick}
      />
    );

    const shareButton = screen.getByRole('button', { name: `Share ${mockPhotos[0].title}` });
    fireEvent.click(shareButton);

    expect(onShareClick).toHaveBeenCalledWith(mockPhotos[0]);
    expect(onPhotoClick).not.toHaveBeenCalled();
  });

  it('handles like click', () => {
    render(
      <PhotoGrid
        photos={mockPhotos}
        onPhotoClick={onPhotoClick}
        onLikeClick={onLikeClick}
      />
    );

    const likeButton = screen.getByRole('button', { name: `Like ${mockPhotos[0].title}` });
    fireEvent.click(likeButton);

    expect(onLikeClick).toHaveBeenCalledWith(mockPhotos[0]);
    expect(onPhotoClick).not.toHaveBeenCalled();
  });
});
