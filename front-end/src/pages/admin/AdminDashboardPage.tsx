import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Button } from "../../components/ui";

// =================================================================================
// FILE: src/pages/AdminDashboardPage.tsx
// =================================================================================

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display text-pink-900">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage clinic-wide settings and data.
          </p>
        </div>
        <Button onClick={() => navigate("/")} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/reception/products" className="no-underline">
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-pink-300/50 h-full">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-display text-pink-800 mb-4">
                Product Management
              </h2>
              <p className="text-gray-600">
                Add, edit, and manage the clinic's product inventory.
              </p>
            </CardContent>
          </Card>
        </Link>
        {/* You can add more admin-specific cards here in the future */}
      </div>
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/AdminDashboardPage.tsx
// =================================================================================
