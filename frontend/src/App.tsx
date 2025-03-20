import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { Photos, Upload } from './pages';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | undefined>(undefined);

  const handleLogout = () => {
    setUser(undefined);
    // Add logout logic here
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/photos" element={<Photos />} />
          <Route path="/upload" element={<Upload />} />
          {/* Add more routes here */}
          <Route path="/" element={<Navigate to="/photos" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
