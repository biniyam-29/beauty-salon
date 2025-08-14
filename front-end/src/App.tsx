import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import InventoryPage from "./pages/Inventorypage.tsx";
import ProfessionalPage from "./pages/ProfessionalPage.tsx";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/reception" element={<InventoryPage />} />
      <Route path="/professionals" element={<ProfessionalPage />} />
    </Routes>
  </Router>
);

export default App;
