import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { User } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User;
  onLogout: () => void;
}

const DRAWER_WIDTH = 240;

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header
        user={user}
        onToggleSidebar={handleToggleSidebar}
        onLogout={onLogout}
      />
      <Sidebar open={sidebarOpen} width={DRAWER_WIDTH} user={user} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { sm: sidebarOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Box component="div" sx={{ height: (theme) => theme.mixins.toolbar }} />
        {children}
      </Box>
    </Box>
  );
};
