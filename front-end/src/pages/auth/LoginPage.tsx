import React, { useState, useRef, type SyntheticEvent, type FormEvent } from "react";
import loginBg from "../../assets/login-page-bg.png";
import { useLogin } from "../../hooks/UseAuth";

interface LoginPageProps {
  navigate: (path: string) => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate, onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const { mutate: login, isPending: isLoading } = useLogin();
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
  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    login(
      { email, password },
      {
        onSuccess: (data) => {
          onLoginSuccess();
          
          switch (data.role) {
            case "reception":
              navigate("/reception");
              break;
            case "admin":
              navigate("/admin/dashboard");
              break;
            case "professional":
              navigate("/professional");
              break;
            case "doctor":
              navigate("/doctor");
              break;
            default:
              setError("Unknown user role");
              break;
          }
        },
        onError: (err) => {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unexpected error occurred.");
          }
        }
      }
    );
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                className="w-full bg-pink-700 text-white font-sans font-semibold py-3 px-8 rounded-lg hover:bg-pink-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
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