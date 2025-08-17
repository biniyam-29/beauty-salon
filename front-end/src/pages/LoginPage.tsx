import {
  useState,
  useRef,
  type FormEvent,
  type SyntheticEvent,
} from "react";

// The main App component.
const LoginPage = () => {
  // State to handle and display any errors during the login process.
  const [error, setError] = useState<string | null>(null);
  // State to show a loading indicator while the API request is in progress.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to hold and display the token, which is now sourced from localStorage.
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("auth_token")
  );

  // Using useRef to get direct access to the input DOM elements.
  // This avoids re-renders on every keystroke, improving performance.
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the error event for the background image.
   * @param {SyntheticEvent<HTMLImageElement, Event>} e - The synthetic event from React.
   */
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevents an infinite loop if the placeholder image also fails.
    target.src =
      "https://placehold.co/1920x1080/e2e8f0/4a5568?text=Image+Not+Found";
  };

  /**
   * Handles the form submission event.
   * Prevents the default form behavior and makes the API call.
   * @param {FormEvent<HTMLFormElement>} e - The form event.
   */
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setToken(null); // Clear previous token

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      // Perform the POST request to the login endpoint.
      const response = await fetch(
        "http://beauty-api.biniyammarkos.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      console.log(response);

      // Check if the request was successful.
      if (!response.ok) {
        // If the server responded with an error, throw an error with the status text.
        // In a real app, you would parse the error message from the response body.
        throw new Error(`Login failed with status: ${response.status}`);
      }

      // Parse the JSON response.
      const data = await response.json();

      // Store the token in localStorage. This is a persistent storage solution.
      if (data && data.token) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token); // Also update the state to trigger a re-render.
      } else {
        // Handle cases where the response is missing the token.
        throw new Error("Token not found in response.");
      }
    } catch (err) {
      // Catch and display any errors that occurred during the fetch operation.
      console.error("Login Error:", err);
      // Ensure the error is a string before setting state
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      // This block always runs, whether the try block succeeds or fails,
      // ensuring the loading state is reset.
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen font-serif overflow-hidden">
      <div className="relative w-full h-full">
        {/* Background Image */}
        <img
          src="src/assets/login-page-bg.png" // Using a placeholder for now as the original `bgImg` import is a local path.
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
              <div className="relative mb-6">
                <input
                  id="email"
                  type="email"
                  ref={emailRef}
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
                  ref={passwordRef}
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
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            {/* Display status messages */}
            {isLoading && (
              <p className="mt-4 text-white text-center">Loading...</p>
            )}
            {error && (
              <p className="mt-4 text-red-500 text-center font-bold">{error}</p>
            )}
            {token && (
              <div className="mt-4 p-4 bg-green-200 text-green-800 rounded-lg break-words">
                <p className="font-bold">Login Successful!</p>
                <code className="text-xs">{token}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
