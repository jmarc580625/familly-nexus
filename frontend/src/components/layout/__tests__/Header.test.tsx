import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from '../Header';
import { MemoryRouter } from 'react-router-dom';
import { User, UserRole } from '../../../types';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  role: UserRole.Admin
};

const renderHeader = (props: {
  user?: User;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}) => {
  const defaultProps = {
    onToggleSidebar: jest.fn(),
    onLogout: jest.fn(),
    ...props,
  };

  return render(
    <MemoryRouter>
      <Header {...defaultProps} />
    </MemoryRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app title', () => {
    renderHeader({});
    expect(screen.getByText('Family Nexus')).toBeInTheDocument();
  });

  it('shows login button when no user is provided', () => {
    renderHeader({});
    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();
    
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows user avatar when user is provided', () => {
    renderHeader({ user: mockUser });
    
    // Avatar should be visible
    const avatar = screen.getByLabelText('account of current user');
    expect(avatar).toBeInTheDocument();
    expect(screen.getByAltText(mockUser.name)).toBeInTheDocument();
  });

  it('shows menu items when avatar is clicked', async () => {
    renderHeader({ user: mockUser });
    
    // Click avatar to show menu
    const avatar = screen.getByLabelText('account of current user');
    fireEvent.click(avatar);
    
    // Menu items should be visible after clicking
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Logout' })).toBeInTheDocument();
    });
  });

  it('calls onToggleSidebar when menu icon is clicked', () => {
    const onToggleSidebar = jest.fn();
    renderHeader({ onToggleSidebar });
    
    const menuButton = screen.getByLabelText('open drawer');
    fireEvent.click(menuButton);
    
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('handles profile navigation', async () => {
    renderHeader({ user: mockUser });
    
    // Open menu
    const avatar = screen.getByLabelText('account of current user');
    fireEvent.click(avatar);
    
    // Wait for menu to appear and click profile
    const profileItem = await waitFor(() => screen.getByRole('menuitem', { name: 'Profile' }));
    fireEvent.click(profileItem);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('handles logout', async () => {
    const onLogout = jest.fn();
    renderHeader({ user: mockUser, onLogout });
    
    // Open menu
    const avatar = screen.getByLabelText('account of current user');
    fireEvent.click(avatar);
    
    // Wait for menu to appear and click logout
    const logoutItem = await waitFor(() => screen.getByRole('menuitem', { name: 'Logout' }));
    fireEvent.click(logoutItem);
    
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
