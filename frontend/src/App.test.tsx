import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

// Mock child components
jest.mock('./components/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

jest.mock('./pages', () => ({
  Photos: () => <div data-testid="photos-page">Photos Page</div>,
  Upload: () => <div data-testid="upload-page">Upload Page</div>,
}));

describe('App', () => {
  it('renders layout with photos page by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('photos-page')).toBeInTheDocument();
  });

  it('renders upload page on /upload route', () => {
    window.history.pushState({}, '', '/upload');
    render(<App />);
    
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('upload-page')).toBeInTheDocument();
  });

  it('redirects to photos page from root', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('photos-page')).toBeInTheDocument();
  });
});
