import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// The main App component, also defined as a React.FC for type safety.
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set a timeout to trigger the fade-in effect after the component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // A short delay to ensure the initial state is rendered first
    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

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
    target.src = "./hero-image.png";
  };

  return (
    // By using "fixed inset-0", we force this container to cover the entire viewport.
    <div className="fixed inset-0 font-serif">
      {/* Background Image - now covers the full screen */}
      <img
        src="src/assets/hero-image.png"
        alt="A woman applying serum to her face, illustrating radiant skin care."
        className="absolute inset-0 w-full h-full object-cover"
        onError={handleImageError}
      />
      {/* Overlay to darken the image slightly for better text contrast */}
      <div className="absolute inset-0  bg-opacity-20"></div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-center items-start text-left p-8 sm:p-12 md:p-16 lg:p-24">
        {/* Added transform properties for the slide-in effect */}
        <div
          className={`max-w-3xl text-slate-300 p-8 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg bg-rose-400/50 transition-all duration-1000 ease-in-out ${
            isVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-12"
          }`}
        >
          {/* Main Heading - Made slightly bigger */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 text-shadow-lg">
            Your Expertise,
            <br />
            <p className="text-rose-400">Their Glow</p>
          </h1>

          {/* Subheading - Made slightly bigger */}
          <p className="text-xl md:text-2xl mb-8 text-white">
            Every treatment you perform helps our clients shine. Thank you for
            your dedication.
          </p>

          {/* Call to Action Button */}
          <button
            onClick={() => navigate("/login")}
            className="bg-pink-700 text-white font-sans font-semibold py-3 px-8 rounded-lg hover:bg-pink-800 transition-colors duration-300 shadow-lg"
          >
            Employee Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
