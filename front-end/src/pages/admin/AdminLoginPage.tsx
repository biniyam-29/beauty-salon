import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { dbUrl } from "../../config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from "../../components/ui";

// =================================================================================
// FILE: src/pages/AdminLoginPage.tsx
// =================================================================================

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // In a real app, you'd have more secure authentication.
      // For this demo, we'll just check against the first admin in the db.
      const response = await fetch(`${dbUrl}/admins?email=${email}`);
      if (!response.ok) throw new Error("Server error.");

      const data = await response.json();
      if (data.length > 0) {
        // NOTE: Password is not checked for this demo.
        navigate("/admin/dashboard");
      } else {
        setError("Invalid admin credentials.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail("admin@clinic.com");
    setPassword("supersecret");
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold font-display text-pink-900">
          Admin Portal
        </h1>
        <p className="text-xl text-gray-600 mt-2">Super Admin Login</p>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-pink-800">Admin Access</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In as Admin"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button onClick={handleDemoLogin} variant="outline" size="sm">
              Use Demo Admin Credentials
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-pink-700 hover:underline">
              Back to Receptionist Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
