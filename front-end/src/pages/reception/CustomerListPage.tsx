import React, { useState, useEffect, type FC } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

// --- Type Definitions ---
// Defining the shape of our customer data for TypeScript
interface Customer {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  avatar?: string; // Avatar is optional
}

// --- SVG Icons ---
// These are simple, stateless functional components.
const SearchIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="http://www.w3.org/2000/svg"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Customer Card Component ---
// Added type for the 'customer' prop.
const CustomerCard: FC<{ customer: Customer }> = ({ customer }) => (
  <Link to={`/customer/${customer.id}`} className="no-underline">
    <div
      className={
        "bg-white shadow-md hover:shadow-xl rounded-xl p-4 transition-shadow duration-300 h-full"
      }
    >
      <div className="flex items-center space-x-4">
        <img
          src={customer.avatar || `https://i.pravatar.cc/150?u=${customer.id}`}
          alt={customer.name}
          className="w-12 h-12 rounded-full object-cover bg-rose-100"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            const initial = customer.name
              ? customer.name.charAt(0).toUpperCase()
              : "?";
            target.src = `https://placehold.co/150x150/fbcfe8/4a044e?text=${initial}`;
          }}
        />
        <div>
          <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
          <p className="text-sm text-gray-500">{customer.phone}</p>
          <p className="text-sm text-gray-500">{customer.email}</p>
        </div>
      </div>
    </div>
  </Link>
);

// --- Main Customer List Page Component ---
export const CustomerListPage: FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const token =
      localStorage.getItem("auth_token");

    if (!token) {
      console.error("Authentication error: No token found.");
      navigate("/login", { replace: true });
      return;
    }

    // Debounce mechanism to prevent API calls on every keystroke
    const handler = setTimeout(() => {
      const fetchCustomers = async () => {
        setIsLoading(true);
        setError(null); // Reset error on new fetch

        // Append search term as a query parameter if it exists
        const baseUrl = "https://beauty-api.biniyammarkos.com/customers";
        const url = searchTerm ? `${baseUrl}?search=${searchTerm}` : baseUrl;

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch customers. Status: ${response.status}`
            );
          }

          const result = await response.json();
          const customerData = result?.customers;

          if (Array.isArray(customerData)) {
            setCustomers(customerData);
          } else {
            setCustomers([]);
            console.warn(
              "API response did not contain a customer array.",
              result
            );
          }
        } catch (err: any) {
          setError(err.message);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomers();
    }, 500); // Wait for 500ms after user stops typing

    // Cleanup function to clear the timeout if the component unmounts or searchTerm changes
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, navigate]); // Rerun effect when searchTerm or navigate changes

  return (
    <div className="min-h-screen bg-rose-50 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-wide">
            Customer List
          </h1>
        </header>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <div className="relative flex-grow w-full max-w-lg">
            <input
              type="text"
              placeholder="Search Customers..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full py-3 pl-4 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white bg-gray-800 rounded-r-lg hover:bg-gray-900">
              <SearchIcon />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            Loading customers...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">Error: {error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Now mapping directly over `customers` state as filtering is done by the API */}
              {customers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
            {customers.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No customers found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
