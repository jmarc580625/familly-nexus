import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  Photo as PhotoIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../../types';

interface SidebarProps {
  open: boolean;
  width: number;
  user?: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, width, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Photos', icon: <PhotoIcon />, path: '/photos' },
    { text: 'Family Tree', icon: <PeopleIcon />, path: '/family-tree' },
    { text: 'Search', icon: <SearchIcon />, path: '/search' },
    { text: 'Upload', icon: <UploadIcon />, path: '/upload', requiresAuth: true },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      requiresAuth: true,
      requiresAdmin: true,
    },
  ];

  const isAdmin = user?.role === UserRole.Admin;

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
        },
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <Toolbar />
      <List>
        {menuItems.map(
          (item) =>
            // Only show items that don't require auth, or user is logged in,
            // and don't require admin or user is admin
            (!item.requiresAuth || user) &&
            (!item.requiresAdmin || isAdmin) && (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
        )}
      </List>
      <Divider />
    </Drawer>
  );
};
