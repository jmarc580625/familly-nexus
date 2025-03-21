import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhotoDetail } from '../PhotoDetail';
import { Photo, Person } from '../../../types';
import { format } from 'date-fns';

describe('PhotoDetail', () => {
  const mockPerson: Person = {
    id: '1',
    name: 'John Doe',
    birthDate: '1990-01-01',
    relationships: [],
    photos: [],
  };

  const mockPhoto: Photo = {
    id: '1',
    title: 'Test Photo',
    description: 'A test photo description',
    url: 'http://example.com/test.jpg',
    takenAt: '2024-03-21T10:00:00Z',
    location: {
      name: 'Test Location',
      latitude: 0,
      longitude: 0,
    },
    tags: ['vacation', 'family'],
    people: [mockPerson],
    uploadedAt: '2024-03-21T10:00:00Z',
  };

  const defaultProps = {
    photo: mockPhoto,
    open: true,
    onClose: jest.fn(),
    onPersonClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders photo details correctly', () => {
    render(<PhotoDetail {...defaultProps} />);

    // Check title and description
    expect(screen.getByText('Test Photo')).toBeInTheDocument();
    expect(screen.getByText('A test photo description')).toBeInTheDocument();

    // Check date
    expect(screen.getByText(/Taken on/)).toHaveTextContent(
      `Taken on ${format(new Date(mockPhoto.takenAt), 'PPP')}`
    );

    // Check location
    expect(screen.getByText('Test Location')).toBeInTheDocument();

    // Check tags
    expect(screen.getByText('Tags')).toBeInTheDocument();
    mockPhoto.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });

    // Check people
    expect(screen.getByText('People in this photo')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check birth date if present
    if (mockPerson.birthDate) {
      expect(screen.getByText(/Born/)).toHaveTextContent(
        `Born ${format(new Date(mockPerson.birthDate), 'PP')}`
      );
    }
  });

  test('handles missing optional data', () => {
    const photoWithoutOptionals: Photo = {
      ...mockPhoto,
      description: undefined,
      location: undefined,
      tags: [],
      people: [],
    };

    render(<PhotoDetail {...defaultProps} photo={photoWithoutOptionals} />);

    // Description should not be present
    expect(screen.queryByText('A test photo description')).not.toBeInTheDocument();

    // Location should not be present
    expect(screen.queryByText('Test Location')).not.toBeInTheDocument();

    // Tags section should not be present
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();

    // People section should not be present
    expect(screen.queryByText('People in this photo')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(<PhotoDetail {...defaultProps} />);

    // The IconButton is rendered with a Close icon
    const closeButton = screen.getByTestId('CloseIcon').closest('button');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onPersonClick when a person is clicked', () => {
    render(<PhotoDetail {...defaultProps} />);

    // ListItem is rendered as a button with the person's name
    const personButton = screen.getByRole('button', { name: /john doe/i });
    fireEvent.click(personButton);

    expect(defaultProps.onPersonClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.onPersonClick).toHaveBeenCalledWith(mockPerson);
  });
});
