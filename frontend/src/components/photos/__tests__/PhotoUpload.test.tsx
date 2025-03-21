import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhotoUpload } from '../PhotoUpload';
import { Person } from '../../../types';
import { DropzoneOptions, FileRejection } from 'react-dropzone';

// Mock LocationPicker component
jest.mock('../LocationPicker', () => ({
  LocationPicker: () => <div data-testid="location-picker">Location Picker</div>
}));

// Store onDrop callback
let dropCallback: ((acceptedFiles: File[], fileRejections: FileRejection[], event: Event) => void) | null = null;

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop }: DropzoneOptions) => {
    // Store the callback for later use
    dropCallback = onDrop || null;
    
    return {
      getRootProps: () => ({ 
        'data-testid': 'dropzone'
      }),
      getInputProps: () => ({}),
      isDragActive: false
    };
  }
}));

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('PhotoUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dropCallback = null;
  });

  // Test Case 1: Basic Rendering
  test('renders upload area with correct text', () => {
    render(<PhotoUpload />);
    
    expect(screen.getByText(/Drag and drop photos here, or click to select/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports JPEG, PNG and GIF up to 10MB/i)).toBeInTheDocument();
  });

  // Test Case 2: Renders with suggested tags and people
  test('renders with provided suggested tags and people', () => {
    const suggestedTags = ['vacation', 'family'];
    const suggestedPeople: Person[] = [
      { id: '1', name: 'John Doe', relationships: [], photos: [] },
      { id: '2', name: 'Jane Doe', relationships: [], photos: [] }
    ];

    render(
      <PhotoUpload
        suggestedTags={suggestedTags}
        suggestedPeople={suggestedPeople}
      />
    );

    expect(screen.getByText(/Drag and drop photos here/i)).toBeInTheDocument();
  });

  // Test Case 3: Handles file drop
  test('handles file drop correctly', async () => {
    const mockFile = new File(['mock content'], 'test.jpg', { type: 'image/jpeg' });
    
    render(<PhotoUpload />);

    // Verify dropzone is rendered
    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone).toBeInTheDocument();

    // Verify we captured the onDrop callback
    expect(dropCallback).toBeTruthy();

    // Call onDrop with the mock file
    await act(async () => {
      const fileRejections: FileRejection[] = [];
      dropCallback!([mockFile], fileRejections, new Event('drop'));
    });

    // Wait for the file to be processed
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument(); // The title defaults to filename without extension
    });
  });
});
