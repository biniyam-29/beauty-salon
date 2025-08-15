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
        Reception Dashboard
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
        Welcome. Please choose an option below to begin.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center">
        <Link to="/reception/find" className="no-underline">
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-pink-300/50 h-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-display text-pink-800 mb-4">
                Find a Customer
              </h2>
              <p className="text-gray-600">
                Look up an existing customer by their phone number.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/reception/customers" className="no-underline">
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-pink-300/50 h-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-display text-pink-800 mb-4">
                View All Customers
              </h2>
              <p className="text-gray-600">
                Browse and search the complete list of customers.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/reception/reminders" className="no-underline">
          <Card className="transition-all duration-300 hover:scale-105 hover:shadow-pink-300/50 h-full bg-pink-100/50 border-pink-200">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-display text-pink-800 mb-4">
                Follow-Up Reminders
              </h2>
              <p className="text-gray-600">
                View patients who are due for a follow-up visit.
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
