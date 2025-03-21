import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhotoCard } from '../PhotoCard';
import { Photo, Person, RelationType } from '../../../types';
import { format } from 'date-fns';

const mockPerson: Person = {
  id: '1',
  name: 'John Doe',
  photos: [],
  relationships: [],
};

const mockPhoto: Photo = {
  id: '1',
  title: 'Test Photo',
  description: 'A test photo description',
  url: 'https://example.com/photo.jpg',
  takenAt: '2025-03-20T15:30:00Z',
  uploadedAt: '2025-03-20T15:35:00Z',
  tags: ['family', 'vacation', 'summer', 'beach'],
  people: [mockPerson],
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'Beach Resort'
  }
};

describe('PhotoCard', () => {
  const onPhotoClick = jest.fn();
  const onShareClick = jest.fn();
  const onLikeClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders photo information correctly', () => {
    render(
      <PhotoCard
        photo={mockPhoto}
        onPhotoClick={onPhotoClick}
        onShareClick={onShareClick}
        onLikeClick={onLikeClick}
      />
    );

    // Check basic information
    expect(screen.getByText(mockPhoto.title)).toBeInTheDocument();
    expect(screen.getByText(mockPhoto.description!)).toBeInTheDocument();
    expect(screen.getByAltText(mockPhoto.title)).toHaveAttribute('src', mockPhoto.url);

    // Check date formatting
    const formattedDate = format(new Date(mockPhoto.takenAt), 'PP');
    expect(screen.getByText(formattedDate)).toBeInTheDocument();

    // Check tags (only first 3 should be visible)
    mockPhoto.tags.slice(0, 3).forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
    expect(screen.getByText('+1')).toBeInTheDocument(); // Extra tags indicator
  });

  it('calls onPhotoClick when card is clicked', () => {
    render(
      <PhotoCard
        photo={mockPhoto}
        onPhotoClick={onPhotoClick}
      />
    );

    fireEvent.click(screen.getByRole('img'));
    expect(onPhotoClick).toHaveBeenCalledWith(mockPhoto);
  });

  it('shows people icon when photo has tagged people', () => {
    render(
      <PhotoCard
        photo={mockPhoto}
        onPhotoClick={onPhotoClick}
      />
    );

    const peopleIcon = screen.getByLabelText(`${mockPhoto.people.length} people tagged in ${mockPhoto.title}`);
    expect(peopleIcon).toBeInTheDocument();
  });

  it('shows location icon when photo has location', () => {
    render(
      <PhotoCard
        photo={mockPhoto}
        onPhotoClick={onPhotoClick}
      />
    );

    const locationIcon = screen.getByLabelText(`View location of ${mockPhoto.title}`);
    expect(locationIcon).toBeInTheDocument();
  });

  it('does not show like/share buttons when handlers are not provided', () => {
    render(
      <PhotoCard
        photo={mockPhoto}
        onPhotoClick={onPhotoClick}
      />
    );

    expect(screen.queryByLabelText(`Like ${mockPhoto.title}`)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(`Share ${mockPhoto.title}`)).not.toBeInTheDocument();
  });

  it('calls onShareClick when share button is clicked', () => {
    render(
      <PhotoCard
        photo={mockPhoto}
        onPhotoClick={onPhotoClick}
        onShareClick={onShareClick}
      />
    );

    const shareButton = screen.getByLabelText(`Share ${mockPhoto.title}`);
    fireEvent.click(shareButton);

    expect(onShareClick).toHaveBeenCalledWith(mockPhoto);
    expect(onPhotoClick).not.toHaveBeenCalled(); // Should not trigger card click
  });

  it('calls onLikeClick when like button is clicked', () => {
    render(
      <PhotoCard
        photo={mockPhoto}
        onPhotoClick={onPhotoClick}
        onLikeClick={onLikeClick}
      />
    );

    const likeButton = screen.getByLabelText(`Like ${mockPhoto.title}`);
    fireEvent.click(likeButton);

    expect(onLikeClick).toHaveBeenCalledWith(mockPhoto);
    expect(onPhotoClick).not.toHaveBeenCalled(); // Should not trigger card click
  });
});
