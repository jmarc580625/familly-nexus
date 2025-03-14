import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const Profile: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1">
        User profile details will be displayed here.
      </Typography>
    </Container>
  );
};

export default Profile;
