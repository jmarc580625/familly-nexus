import React from "react";
import TextField from "@mui/material/TextField";

const CustomTextField: React.FC<React.ComponentProps<typeof TextField>> = ({
  label,
  ...props
}) => {
  return <TextField label={label} fullWidth margin="normal" {...props} />;
};

export default CustomTextField;
