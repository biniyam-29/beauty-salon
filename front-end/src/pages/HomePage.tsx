import React from "react";

// SVG Icon for the 'ai' logo in the corner
// Defined as a React Functional Component for TypeScript compatibility.
const AiIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="bg-black rounded-full p-1"
  >
    <text
      x="50%"
      y="50%"
      dy=".3em"
      textAnchor="middle"
      fill="white"
      fontSize="10"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
    >
      ai
    </text>
  </svg>
);

// The main App component, also defined as a React.FC for type safety.
const HomePage: React.FC = () => {
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
      "https://placehold.co/1200x600/e2e8f0/4a5568?text=Image+Not+Found";
  };

  return (
    <div className="relative w-full min-h-screen font-serif bg-gray-100 flex items-center justify-center">
      {/* Hero Section Container */}
      <div className="relative w-full max-w-7xl h-[600px] bg-cover bg-center rounded-lg overflow-hidden shadow-2xl">
        {/* Background Image */}
        <img
          src="http://googleusercontent.com/file_content/0"
          alt="A woman applying serum to her face, illustrating radiant skin care."
          className="absolute inset-0 w-full h-full object-cover"
          onError={handleImageError}
        />
        {/* Overlay to darken the image slightly for better text contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center items-start text-left p-8 md:p-16 lg:p-24">
          <div className="max-w-md text-gray-800">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Your Expertise,
              <br />
              Their Glow
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl mb-8">
              Every treatment you perform helps our clients shine. Thank you for
              your dedication.
            </p>

            {/* Call to Action Button */}
            <button className="bg-pink-700 text-white font-sans font-semibold py-3 px-8 rounded-lg hover:bg-pink-800 transition-colors duration-300 shadow-lg">
              Employee Login
            </button>
          </div>
        </div>

        {/* AI icon in the bottom right corner */}
        <div className="absolute bottom-4 right-4 z-10">
          <AiIcon />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
