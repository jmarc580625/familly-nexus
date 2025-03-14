import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout/LayoutComponent";
import Dashboard from "../components/pages/Dashboard/DashboardComponent";
import Login from "../components/pages/Login/LoginComponent";
import Registration from "../components/pages/Registration/RegistrationComponent";
import Profile from "../components/pages/Profile/ProfileComponent";

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default AppRoutes;
