import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Upload from '../Upload';
import { Photo, Person } from '../../types';
import { API_BASE_URL } from '../../config';

// Mock PhotoUpload component
jest.mock('../../components/photos/PhotoUpload', () => ({
  PhotoUpload: ({ onUploadComplete, suggestedTags, suggestedPeople }: {
    onUploadComplete?: (photos: Photo[]) => void;
    suggestedTags?: string[];
    suggestedPeople?: Person[];
  }) => (
    <div data-testid="photo-upload">
      <div>Tags: {suggestedTags?.join(', ') || 'No tags'}</div>
      <div>People: {suggestedPeople?.map(p => p.name).join(', ') || 'No people'}</div>
      <button
        onClick={() => onUploadComplete?.([{
          id: 1,
          file_name: 'test.jpg',
          s3_key: 'photos/test.jpg',
          url: 'http://example.com/test.jpg',
          title: 'Test Photo',
          description: 'A test photo',
          upload_date: '2025-03-22T15:55:48+01:00',
          date_taken: '2025-03-22T15:55:48+01:00',
          author: 'Test User',
          location_name: 'Test Location',
          latitude: 48.8566,
          longitude: 2.3522,
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

jest.mock('../../config', () => ({
  API_BASE_URL: 'http://localhost:5000'
}));

describe('Upload component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders file upload section', () => {
    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    expect(screen.getByText(/Déposer vos photos/i)).toBeInTheDocument();
  });

  it('handles file selection', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockPhoto: Photo = {
      id: 1,
      file_name: 'beach.jpg',
      s3_key: 'photos/beach.jpg',
      url: 'http://localhost:9000/family-nexus-photos/photos/beach.jpg',
      title: 'Beach Resort',
      description: 'A beautiful beach resort',
      upload_date: '2024-03-22T10:00:00Z',
      date_taken: '2024-03-20T15:30:00Z',
      author: 'John Doe',
      location_name: 'Maldives',
      latitude: 3.2028,
      longitude: 73.2207,
      tags: ['vacation', 'beach'],
      people: [1, 2]
    };

    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/Déposer vos photos/i);
    fireEvent.change(input, { target: { files: [mockFile] } });

    // Add assertions for file selection behavior
  });

  test('fetches and displays suggestions', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: ['vacation', 'family']
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: '1', name: 'John Doe', relationships: [], photos: [] },
            { id: '2', name: 'Jane Doe', relationships: [], photos: [] }
          ]
        })
      });

    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tags: vacation, family')).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => {
      expect(screen.getByText('People: John Doe, Jane Doe')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/photos/tags`);
    expect(mockFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/persons`);
  });

  test('handles fetch errors gracefully', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

    render(
      <BrowserRouter>
        <Upload />
      </BrowserRouter>
    );

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Failed to fetch tags');
    }, { timeout: 2000 });
  });
});
