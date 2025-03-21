import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Layout } from '../Layout';
import { User, UserRole } from '../../../types';

// Mock child components
jest.mock('../Header', () => ({
  Header: ({ onToggleSidebar, onLogout, user }: { 
    onToggleSidebar: () => void;
    onLogout: () => void;
    user?: User;
  }) => (
    <header>
      <button onClick={onToggleSidebar} data-testid="toggle-sidebar">
        Toggle Sidebar
      </button>
      <button onClick={onLogout} data-testid="logout">
        Logout
      </button>
      {user && <span>Welcome {user.name}</span>}
    </header>
  ),
}));

jest.mock('../Sidebar', () => ({
  Sidebar: ({ open, user }: { open: boolean; user?: User; width: number }) => (
    <nav data-testid="sidebar" data-open={open}>
      {user && <span>Sidebar User: {user.name}</span>}
    </nav>
  ),
}));

describe('Layout', () => {
  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.Admin,
    avatarUrl: 'http://example.com/avatar.jpg',
  };

  const defaultProps = {
    onLogout: jest.fn(),
    children: <div data-testid="content">Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with user', () => {
    render(<Layout {...defaultProps} user={mockUser} />);

    // Check header content
    expect(screen.getByText(/Welcome John Doe/)).toBeInTheDocument();

    // Check sidebar content
    expect(screen.getByText(/Sidebar User: John Doe/)).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true');

    // Check main content
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders without user', () => {
    render(<Layout {...defaultProps} />);

    // User-specific content should not be present
    expect(screen.queryByText(/Welcome John Doe/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sidebar User: John Doe/)).not.toBeInTheDocument();

    // But structure should still be there
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  test('toggles sidebar', () => {
    render(<Layout {...defaultProps} user={mockUser} />);

    // Sidebar should be open by default
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true');

    // Click toggle button
    fireEvent.click(screen.getByTestId('toggle-sidebar'));

    // Sidebar should be closed
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'false');

    // Click toggle button again
    fireEvent.click(screen.getByTestId('toggle-sidebar'));

    // Sidebar should be open again
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-open', 'true');
  });

  test('handles logout', () => {
    render(<Layout {...defaultProps} user={mockUser} />);

    // Click logout button
    fireEvent.click(screen.getByTestId('logout'));

    // Check if onLogout was called
    expect(defaultProps.onLogout).toHaveBeenCalledTimes(1);
  });

  test('renders children', () => {
    const testChildren = (
      <div>
        <h1>Test Heading</h1>
        <p>Test Paragraph</p>
      </div>
    );

    render(<Layout {...defaultProps}>{testChildren}</Layout>);

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Paragraph')).toBeInTheDocument();
  });
});
