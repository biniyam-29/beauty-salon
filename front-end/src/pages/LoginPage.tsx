import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "../components/ui";

// =================================================================================
// FILE: src/pages/LoginPage.tsx
// =================================================================================

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would have authentication logic here.
    // For this demo, we'll just navigate to the reception page.
    navigate("/reception");
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in space-y-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold font-display text-pink-900">
          SkinCare Clinic
        </h1>
        <p className="text-xl text-gray-600 mt-2">Management Portal</p>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-pink-800">Receptionist Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" defaultValue="receptionist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="password" />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="text-center space-y-2">
        <Link
          to="/professional-login"
          className="text-sm text-pink-700 hover:underline"
        >
          Are you a Professional? Login here
        </Link>
        <span className="mx-2 text-gray-400">|</span>
        <Link
          to="/admin-login"
          className="text-sm text-pink-700 hover:underline"
        >
          Super Admin Login
        </Link>
      </div>
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/LoginPage.tsx
// =================================================================================
