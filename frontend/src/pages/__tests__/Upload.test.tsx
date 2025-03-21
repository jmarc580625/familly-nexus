import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Upload } from '../Upload';
import { Photo, Person } from '../../types';

// Mock PhotoUpload component
jest.mock('../../components/photos/PhotoUpload', () => ({
  PhotoUpload: ({ onUploadComplete, suggestedTags, suggestedPeople }: {
    onUploadComplete: (photos: Photo[]) => void;
    suggestedTags: string[];
    suggestedPeople: Person[];
  }) => (
    <div data-testid="photo-upload">
      <div>Tags: {suggestedTags.join(', ')}</div>
      <div>People: {suggestedPeople.map(p => p.name).join(', ')}</div>
      <button
        onClick={() => onUploadComplete([{
          id: '1',
          url: 'test.jpg',
          title: 'Test Photo',
          takenAt: '2024-03-21T00:00:00Z',
          uploadedAt: '2024-03-21T00:00:00Z',
          tags: [],
          people: []
        }])}
      >
        Upload
      </button>
    </div>
  ),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Upload', () => {
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup any pending effects
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  it('renders upload page with title and description', async () => {
    await act(async () => {
      render(<Upload />);
    });
    
    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
    expect(screen.getByText(/Upload your family photos/)).toBeInTheDocument();
  });

  it('fetches and passes suggestions to PhotoUpload', async () => {
    // Mock successful API responses
    const mockTags = ['family', 'vacation', 'birthday'];
    const mockPeople = [
      { id: '1', name: 'John Doe', relationships: [], photos: [] },
      { id: '2', name: 'Jane Doe', relationships: [], photos: [] }
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockTags })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockPeople })
      });

    await act(async () => {
      render(<Upload />);
    });

    // Wait for suggestions to be loaded
    await waitFor(() => {
      const uploadComponent = screen.getByTestId('photo-upload');
      expect(uploadComponent).toHaveTextContent('Tags: family, vacation, birthday');
      expect(uploadComponent).toHaveTextContent('People: John Doe, Jane Doe');
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith('/api/photos/tags');
    expect(mockFetch).toHaveBeenCalledWith('/api/persons');
  });

  it('handles API errors gracefully', async () => {
    // Mock failed API responses
    mockFetch.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<Upload />);
    });

    // Wait for error alert to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('API Error');
    });
  });

  it('handles non-ok API responses', async () => {
    // Mock non-ok API response
    mockFetch.mockResolvedValue({
      ok: false
    });

    await act(async () => {
      render(<Upload />);
    });

    // Wait for error alert to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch tags');
    });
  });

  it('allows dismissing error message', async () => {
    // Mock API error
    mockFetch.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<Upload />);
    });

    // Wait for error alert to appear
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    // Error should be dismissed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('handles upload completion', async () => {
    // Mock successful API responses for suggestions
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      });

    await act(async () => {
      render(<Upload />);
    });

    // Click upload button
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    // Verify upload completion handler was called
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Upload completed:',
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          title: 'Test Photo'
        })
      ])
    );
  });
});
