import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage.tsx";
import UsersPage from "./pages/UsersPage.tsx";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  </Router>
);

export default App;
