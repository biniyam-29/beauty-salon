import React, { useState, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";

// --- Type Definitions ---
interface CustomerProfile {
  skin_type: string;
  skin_feel: string;
  sun_exposure: string;
  used_products: string;
}

interface SkinConcern {
  id: number;
  name: string;
}

interface HealthCondition {
  id: number;
  name: string;
}

interface Customer {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  address?: string;
  city?: string;
  birth_date?: string;
  profile?: CustomerProfile;
  skin_concerns?: SkinConcern[];
  health_conditions?: HealthCondition[];
}

interface Consultation {
  id: number;
  consultation_date: string;
  notes: string;
  doctor_name: string;
}

// --- SVG Icons ---
const SearchIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
      clipRule="evenodd"
    />
  </svg>
);

const CloseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// --- Customer Detail Modal Component ---
const CustomerDetailModal: FC<{
  customerId: number | string;
  onClose: () => void;
}> = ({ customerId, onClose }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const baseUrl = "https://beauty-api.biniyammarkos.com";
        const headers = { Authorization: `Bearer ${token}` };

        const [customerRes, consultationsRes] = await Promise.all([
          fetch(`${baseUrl}/customers/${customerId}`, { headers }),
          fetch(`${baseUrl}/customers/${customerId}/consultations`, {
            headers,
          }),
        ]);

        if (!customerRes.ok)
          throw new Error("Failed to fetch customer details.");
        const customerData = await customerRes.json();
        setCustomer(customerData);

        if (!consultationsRes.ok)
          throw new Error("Failed to fetch consultations.");
        const consultationsData = await consultationsRes.json();
        setConsultations(consultationsData.consultations || []);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId, navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <CloseIcon className="w-8 h-8" />
        </button>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500">
            Loading customer profile...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600">Error: {error}</div>
        ) : customer ? (
          <>
            <div className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <img
                  src={
                    customer.avatar ||
                    `https://i.pravatar.cc/150?u=${customer.id}`
                  }
                  alt={customer.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-rose-200"
                  onError={(
                    e: React.SyntheticEvent<HTMLImageElement, Event>
                  ) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    const initial = customer.name
                      ? customer.name.charAt(0).toUpperCase()
                      : "?";
                    target.src = `https://placehold.co/150x150/fbcfe8/4a044e?text=${initial}`;
                  }}
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-4xl font-bold text-gray-800">
                    {customer.name}
                  </h1>
                  <p className="text-gray-500 mt-2">{customer.email}</p>
                  <p className="text-gray-500">{customer.phone}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p>
                  <strong>Address:</strong> {customer.address || "N/A"}
                </p>
                <p>
                  <strong>City:</strong> {customer.city || "N/A"}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {customer.birth_date || "N/A"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Skin Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p>
                  <strong>Skin Type:</strong>{" "}
                  {customer.profile?.skin_type || "N/A"}
                </p>
                <p>
                  <strong>Skin Feel:</strong>{" "}
                  {customer.profile?.skin_feel || "N/A"}
                </p>
                <p>
                  <strong>Sun Exposure:</strong>{" "}
                  {customer.profile?.sun_exposure || "N/A"}
                </p>
                <p>
                  <strong>Used Products:</strong>{" "}
                  {customer.profile?.used_products
                    ? JSON.parse(customer.profile.used_products).join(", ")
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Skin Concerns
                  </h2>
                  {customer.skin_concerns &&
                  customer.skin_concerns.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                      {customer.skin_concerns.map((concern) => (
                        <li key={concern.id}>{concern.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No skin concerns listed.</p>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Health Conditions
                  </h2>
                  {customer.health_conditions &&
                  customer.health_conditions.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                      {customer.health_conditions.map((condition) => (
                        <li key={condition.id}>{condition.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">
                      No health conditions listed.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 px-8 py-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Consultation History
              </h2>
              <div className="space-y-6">
                {consultations.length > 0 ? (
                  consultations.map((consult) => (
                    <div
                      key={consult.id}
                      className="bg-rose-50/50 p-5 rounded-lg border-l-4 border-rose-400"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-lg text-rose-800">
                          {new Date(
                            consult.consultation_date
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          with {consult.doctor_name}
                        </p>
                      </div>
                      <p className="text-gray-700">{consult.notes}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No consultation history found.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            Customer not found.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Customer Card Component ---
const CustomerCard: FC<{ customer: Customer; onClick: () => void }> = ({
  customer,
  onClick,
}) => (
  <div onClick={onClick} className="cursor-pointer">
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
  </div>
);

// --- Main Customer List Page Component ---
export const CustomerListPage: FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    number | string | null
  >(null);

  // --- CHANGE: This useEffect now fetches ALL customers just once on component mount ---
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      console.error("Authentication error: No token found.");
      navigate("/login", { replace: true });
      return;
    }

    const fetchAllCustomers = async () => {
      setIsLoading(true);
      setError(null);
      const url = "https://beauty-api.biniyammarkos.com/customers";

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

    fetchAllCustomers();
  }, [navigate]); // --- CHANGE: Dependency array is now empty, so this runs only once ---

  // --- NEW: Client-side filtering logic ---
  const filteredCustomers = customers.filter((customer) =>
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-rose-50 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-bold text-gray-800 tracking-wide text-center sm:text-left">
              Customer List
            </h1>
            <button
              onClick={() => navigate("/reception")}
              className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
            >
              Back to Dashboard
            </button>
          </header>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="relative flex-grow w-full max-w-lg">
              <input
                type="tel"
                placeholder="Search by Phone Number..."
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
                {/* --- CHANGE: Mapping over the filtered list now --- */}
                {filteredCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onClick={() => setSelectedCustomerId(customer.id)}
                  />
                ))}
              </div>
              {filteredCustomers.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchTerm
                      ? `No customers found for "${searchTerm}".`
                      : "No customers found."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {selectedCustomerId && (
        <CustomerDetailModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </>
  );
};

export default CustomerListPage;
