import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const Footer: React.FC = () => {
  return (
    <Box mt={5} mb={2} textAlign="center">
      <Typography variant="body2" color="textSecondary">
        © 2023 FamilyNexus. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
