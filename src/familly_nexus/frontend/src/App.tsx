import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { PhotoGrid } from "./components/PhotoGrid";
import { PersonList } from "./components/PersonList";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>
            Photos
          </Link>
          <Link to="/persons">Persons</Link>
        </nav>

        <main style={{ padding: "1rem" }}>
          <Routes>
            <Route path="/" element={<PhotoGrid />} />
            <Route path="/persons" element={<PersonList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};
