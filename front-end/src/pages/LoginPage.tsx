import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // A mock user for the demo login
  const demoUser = {
    email: "receptionist@clinic.com",
    password: "demoPassword123",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a network request
    setTimeout(() => {
      // In a real app, you'd verify credentials against a server.
      // For this demo, we'll just navigate on any submission.
      console.log(`Logging in with ${email}`);
      setIsLoading(false);
      navigate("/reception");
    }, 1000);
  };

  const handleDemoLogin = () => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold font-display text-pink-900">
          SkinCare Clinic
        </h1>
        <p className="text-xl text-gray-600 mt-2">Management Portal</p>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-pink-800">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., your.email@example.com"
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button onClick={handleDemoLogin} variant="outline" size="sm">
              Login as Demo User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// =================================================================================
// END FILE: src/pages/LoginPage.tsx
// =================================================================================
