import React from "react";
import Header from "../Header/HeaderComponent";
import Navbar from "../NavBar/NavbarComponent";
import Footer from "../Footer/FooterComponent";
import Container from "@mui/material/Container";

interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <Navbar />
      <Container>{children}</Container>
      <Footer />
    </>
  );
};

export default Layout;
