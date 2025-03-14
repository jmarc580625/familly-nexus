import React, { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CustomButton from "../../shared/Button/ButtonComponent";
import CustomTextField from "../../shared/TextField/TextFieldComponent";
import { addPerson } from "../../../services/apiService";

const Registration: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const personData = { email, password, confirmPassword };
      await addPerson(personData);
      // Handle successful registration (e.g., redirect to login page)
    } catch (error) {
      // Handle registration error
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <form onSubmit={handleSubmit}>
        <CustomTextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CustomTextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <CustomTextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <CustomButton type="submit" fullWidth>
          Register
        </CustomButton>
      </form>
    </Container>
  );
};

export default Registration;
