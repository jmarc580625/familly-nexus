import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { User, UserRole } from '../../../types';

// Mock react-router hooks
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/photos' };

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: UserRole.Editor,
  avatarUrl: 'https://example.com/avatar.jpg',
};

const mockAdminUser: User = {
  ...mockUser,
  role: UserRole.Admin,
};

const renderSidebar = (props: {
  open?: boolean;
  width?: number;
  user?: User;
}) => {
  const defaultProps = {
    open: true,
    width: 240,
    ...props,
  };

  return render(
    <MemoryRouter>
      <Sidebar {...defaultProps} />
    </MemoryRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders public menu items when no user is logged in', () => {
    renderSidebar({});

    expect(screen.getByRole('button', { name: /photos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /family tree/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /upload/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument();
  });

  it('renders auth-required menu items when user is logged in', () => {
    renderSidebar({ user: mockUser });

    expect(screen.getByRole('button', { name: /photos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /family tree/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument();
  });

  it('renders admin menu items when admin user is logged in', () => {
    renderSidebar({ user: mockAdminUser });

    expect(screen.getByRole('button', { name: /photos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /family tree/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('highlights active menu item based on current path', () => {
    mockLocation.pathname = '/photos';
    renderSidebar({});

    const photosLink = screen.getByRole('button', { name: /photos/i });
    expect(photosLink).toHaveClass('Mui-selected');
  });

  it('navigates when menu item is clicked', () => {
    renderSidebar({});

    const familyTreeLink = screen.getByRole('button', { name: /family tree/i });
    fireEvent.click(familyTreeLink);

    expect(mockNavigate).toHaveBeenCalledWith('/family-tree');
  });

  it('handles sidebar collapse state', () => {
    renderSidebar({ open: false });

    expect(screen.getByRole('navigation')).toHaveStyle({ width: '0px' });
  });
});
