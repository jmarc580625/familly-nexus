import React from "react";
import Button from "@mui/material/Button";

const CustomButton: React.FC<React.ComponentProps<typeof Button>> = ({
  children,
  ...props
}) => {
  return (
    <Button variant="contained" color="primary" {...props}>
      {children}
    </Button>
  );
};

export default CustomButton;
