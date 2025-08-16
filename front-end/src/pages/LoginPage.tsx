import React from "react";
import bgImg from "../assets/login-page-bg.png";

// The main App component, also defined as a React.FC for type safety.
const LoginPage: React.FC = () => {
  /**
   * Handles the error event for the background image.
   * This function is typed to work with React's synthetic events in TypeScript.
   * @param {React.SyntheticEvent<HTMLImageElement, Event>} e - The synthetic event from React.
   */
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevents an infinite loop if the placeholder image also fails to load.
    target.src =
      "https://placehold.co/1920x1080/e2e8f0/4a5568?text=Image+Not+Found";
  };

  return (
    <div className="w-screen h-screen font-serif overflow-hidden">
      <div className="relative w-full h-full">
        {/* Background Image - Updated to a direct URL to resolve the error */}
        <img
          src={bgImg}
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
            <form>
              <div className="relative mb-6">
                <input
                  id="email"
                  type="email"
                  className="peer w-full px-4 py-3 rounded-md bg-white/80 text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Email Address"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-6 text-white text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-6 peer-focus:text-white peer-focus:text-sm"
                >
                  Email Address
                </label>
              </div>
              <div className="relative mb-8">
                <input
                  id="password"
                  type="password"
                  className="peer w-full px-4 py-3 rounded-md bg-white/80 text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                  placeholder="Password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 -top-6 text-white text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-focus:-top-6 peer-focus:text-white peer-focus:text-sm"
                >
                  Password
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-pink-700 text-white font-sans font-semibold py-3 px-8 rounded-lg hover:bg-pink-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Log In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
