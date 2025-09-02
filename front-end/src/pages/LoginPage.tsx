import React, { useState, useRef, type SyntheticEvent, type FormEvent } from "react";
import loginBg from "../assets/login-page-bg.png";

// Define the props for the LoginPage component for type safety.
interface LoginPageProps {
  navigate: (path: string) => void;
  onLoginSuccess: () => void;
}

// The LoginPage component handles the authentication logic.
const LoginPage: React.FC<LoginPageProps> = ({ navigate, onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Type the refs to specify they will hold HTMLInputElement objects.
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the error event for the background image.
   * @param {SyntheticEvent<HTMLImageElement, Event>} e - The synthetic event from React.
   */
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loops
    target.src = "./image/login-page-bg.png";
  };

  /**
   * Handles the form submission and API call.
   * @param {FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://beauty-api.biniyammarkos.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        // Ensure errorData.message is a string, provide a fallback.
        const message =
          typeof errorData.message === "string"
            ? errorData.message
            : `Login failed with status: ${response.status}`;
        throw new Error(message);
      }

      const data = await response.json();

      if (data && typeof data.token === "string") {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("role", data.payload.role);
        localStorage.setItem("user", JSON.stringify(data.payload));
        onLoginSuccess(); // Notify parent (App.tsx) of success
        switch (data.payload.role) {
          case "reception":
            navigate("/reception");
            break;
          case "super-admin":
            navigate("/admin/dashboard");
            break;
          case "doctor":
            navigate("/professional");
            break;

          default:
            break;
        }
         // Redirect to the protected page
      } else {
        throw new Error("Token not found in response.");
      }
    } catch (err) {
      // Type guard to ensure 'err' is an instance of Error.
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen font-serif overflow-hidden">
      <div className="relative w-full h-full">
        {/* Background Image */}
        <img
          src={loginBg}
          alt="A modern and clean beauty salon interior."
          className="absolute inset-0 w-full h-full object-cover"
          onError={handleImageError}
        />

        {/* Login Form Container */}
        <div className="absolute top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-rose-300/60 flex flex-col justify-center p-8 md:p-12 lg:p-16 backdrop-blur-sm">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-4xl text-white font-bold mb-2 text-center md:text-left drop-shadow-lg">
              Welcome Back!
            </h1>
            <p className="text-white/80 text-lg mb-8 text-center md:text-left drop-shadow-lg">
              Ready to create magic?
            </p>
            <form onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="relative mb-6">
                <input
                  id="email"
                  type="email"
                  ref={emailRef}
                  className="peer w-full px-4 py-3 rounded-md bg-white/80 text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Email Address"
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-6 text-white text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-6 peer-focus:text-white peer-focus:text-sm"
                >
                  Email Address
                </label>
              </div>
              {/* Password Input */}
              <div className="relative mb-8">
                <input
                  id="password"
                  type="password"
                  ref={passwordRef}
                  className="peer w-full px-4 py-3 rounded-md bg-white/80 text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Password"
                  required
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 -top-6 text-white text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-6 peer-focus:text-white peer-focus:text-sm"
                >
                  Password
                </label>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-pink-700 text-white font-sans font-semibold py-3 px-8 rounded-lg hover:bg-pink-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>
            {/* Error Message Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-200 text-red-800 rounded-lg text-center font-bold">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
