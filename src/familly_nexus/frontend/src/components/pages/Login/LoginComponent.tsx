import React, { useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CustomButton from "../../shared/Button/ButtonComponent";
import CustomTextField from "../../shared/TextField/TextFieldComponent";
import { getPersons } from "../../../services/apiService";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const persons = await getPersons();
      const user = persons.find(
        (person: any) => person.email === email && person.password === password
      );
      if (user) {
        // Handle successful login (e.g., redirect to dashboard)
      } else {
        // Handle login error (e.g., show error message)
      }
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Login
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
        <CustomButton type="submit" fullWidth>
          Login
        </CustomButton>
      </form>
    </Container>
  );
};

export default Login;
