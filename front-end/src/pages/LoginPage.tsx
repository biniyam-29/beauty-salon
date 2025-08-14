import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.tsx"
import { Input } from "../components/ui/input.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card.tsx";
import { Label } from "../components/ui/label.tsx";
import { Alert, AlertDescription } from "../components/ui/alert.tsx";
import { login, getRoleDashboardRoute, mockUsers } from "../lib/auth"
import { Stethoscope, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("") 
  const [isLoading, setIsLoading] = useState(false)
  const router = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await login(email)
      if (user) {
        const dashboardRoute = getRoleDashboardRoute(user.role)
        router(dashboardRoute)
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (userEmail: string) => {
    setEmail(userEmail)
    setPassword("demo123")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-teal-600 rounded-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SkinCare Clinic</h1>
          </div>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the clinic management system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">Click to auto-fill credentials for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockUsers.map((user) => (
              <Button
                key={user.id}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs bg-transparent"
                onClick={() => handleDemoLogin(user.email)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{user.name}</span>
                  <span className="text-teal-600 capitalize">{user.role.replace("-", " ")}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
