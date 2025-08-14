import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui";

// =================================================================================
// FILE: src/pages/WelcomePage.tsx
// =================================================================================

export const WelcomePage: React.FC = () => {
  return (
    <div className="text-center animate-fade-in">
      <h1 className="text-5xl font-bold font-display text-pink-900 mb-4">
        Customer Management
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Welcome. Please choose an option below to begin.
      </p>
      <div className="flex flex-col md:flex-row gap-6 justify-center">
        <Link to="/reception/find" className="flex-1 max-w-sm no-underline">
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-pink-300/50 h-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-display text-pink-800 mb-4">
                Find a Customer
              </h2>
              <p className="text-gray-600 mb-6">
                Look up an existing customer by their phone number to view their
                profile or start a new session.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link
          to="/reception/customers"
          className="flex-1 max-w-sm no-underline"
        >
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-pink-300/50 h-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-display text-pink-800 mb-4">
                View All Customers
              </h2>
              <p className="text-gray-600 mb-6">
                Browse and search through the complete list of all registered
                customers in the system.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/WelcomePage.tsx
// =================================================================================
