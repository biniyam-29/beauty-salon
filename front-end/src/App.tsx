import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormPage from "./pages/FormPage.tsx";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<FormPage />} />
      {/* Add more routes here if needed */}
    </Routes>
  </Router>
);

export default App;
