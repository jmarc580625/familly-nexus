import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const Dashboard: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to FamilyNexus! Here you can manage your family photos and
        genealogy.
      </Typography>
    </Container>
  );
};

export default Dashboard;
