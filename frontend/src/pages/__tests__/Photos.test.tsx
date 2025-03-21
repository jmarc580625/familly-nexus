import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Photos } from '../Photos';
import { Photo } from '../../types';

// Mock child components
jest.mock('../../components/photos/PhotoGrid', () => ({
  PhotoGrid: ({ photos, onPhotoClick, onShareClick, onLikeClick }: {
    photos: Photo[];
    loading?: boolean;
    error?: string;
    onPhotoClick: (photo: Photo) => void;
    onShareClick: (photo: Photo) => void;
    onLikeClick: (photo: Photo) => void;
  }) => (
    <div data-testid="photo-grid">
      {photos.map((photo) => (
        <div key={photo.id} data-testid={`photo-${photo.id}`}>
          <button onClick={() => onPhotoClick(photo)}>View {photo.title}</button>
          <button onClick={() => onShareClick(photo)}>Share</button>
          <button onClick={() => onLikeClick(photo)}>Like</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../components/photos/PhotoDetail', () => ({
  PhotoDetail: ({ photo, open, onClose }: {
    photo: Photo;
    open: boolean;
    onClose: () => void;
  }) => (
    open ? (
      <div data-testid="photo-detail">
        <h2>{photo.title}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

describe('Photos', () => {
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('search functionality', () => {
    it('renders search input', () => {
      render(<Photos />);
      expect(screen.getByPlaceholderText('Search photos...')).toBeInTheDocument();
    });

    it('updates search query on input', async () => {
      render(<Photos />);
      const searchInput = screen.getByPlaceholderText('Search photos...');
      await userEvent.type(searchInput, 'Family');
      expect(searchInput).toHaveValue('Family');
    });

    it('shows clear button only when search has input', async () => {
      render(<Photos />);
      const searchInput = screen.getByPlaceholderText('Search photos...');

      // Initially, clear button should not be visible
      expect(screen.queryByTestId('clear-search')).not.toBeInTheDocument();

      // Type in search
      await userEvent.type(searchInput, 'test');

      // Clear button should now be visible
      expect(screen.getByTestId('clear-search')).toBeInTheDocument();
    });

    it('clears search input when clear button is clicked', async () => {
      render(<Photos />);
      const searchInput = screen.getByPlaceholderText('Search photos...');

      // Type in search
      await userEvent.type(searchInput, 'test');
      expect(searchInput).toHaveValue('test');

      // Click clear button
      const clearButton = screen.getByTestId('clear-search');
      await userEvent.click(clearButton);

      // Input should be cleared
      expect(searchInput).toHaveValue('');
    });
  });

  describe('sort functionality', () => {
    it('renders sort dropdown with all options', () => {
      render(<Photos />);
      const sortSelect = screen.getByLabelText('Sort by');
      expect(sortSelect).toBeInTheDocument();

      // Open dropdown
      fireEvent.mouseDown(sortSelect);
      
      // Check all options are present
      const listbox = screen.getByRole('listbox');
      expect(within(listbox).getByText('Date Taken')).toBeInTheDocument();
      expect(within(listbox).getByText('Date Uploaded')).toBeInTheDocument();
      expect(within(listbox).getByText('Title')).toBeInTheDocument();
      expect(within(listbox).getByText('Number of People')).toBeInTheDocument();
    });

    it('changes sort value when new option is selected', async () => {
      render(<Photos />);
      const sortSelect = screen.getByLabelText('Sort by');

      // Open dropdown
      fireEvent.mouseDown(sortSelect);
      
      // Select new option
      const titleOption = screen.getByText('Title');
      await userEvent.click(titleOption);

      // Check if value is updated - look for the selected text inside the Select
      expect(screen.getByLabelText('Sort by')).toHaveTextContent('Title');
    });
  });

  describe('photo interaction', () => {
    it('opens photo detail when photo is clicked', async () => {
      render(<Photos />);
      
      // Click on a photo
      const viewButton = screen.getByRole('button', { name: /view family reunion/i });
      await userEvent.click(viewButton);

      // Photo detail should be visible
      const photoDetail = screen.getByTestId('photo-detail');
      expect(photoDetail).toBeInTheDocument();
      expect(within(photoDetail).getByText('Family Reunion 2024')).toBeInTheDocument();
    });

    it('closes photo detail when close button is clicked', async () => {
      render(<Photos />);
      
      // Open photo detail
      const viewButton = screen.getByRole('button', { name: /view family reunion/i });
      await userEvent.click(viewButton);
      
      // Close photo detail
      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);

      // Photo detail should not be visible
      expect(screen.queryByTestId('photo-detail')).not.toBeInTheDocument();
    });

    it('handles share click', async () => {
      render(<Photos />);
      
      const shareButton = screen.getByRole('button', { name: /share/i });
      await userEvent.click(shareButton);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Share photo:',
        expect.objectContaining({ id: '1', title: 'Family Reunion 2024' })
      );
    });

    it('handles like click', async () => {
      render(<Photos />);
      
      const likeButton = screen.getByRole('button', { name: /like/i });
      await userEvent.click(likeButton);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Like photo:',
        expect.objectContaining({ id: '1', title: 'Family Reunion 2024' })
      );
    });
  });
});
