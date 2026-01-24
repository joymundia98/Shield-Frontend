// src/utils/api.ts

// Existing authFetch function
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");
  console.log("Using token:", token);
  if (!token) throw new Error("No JWT token found");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`, // automatically attach JWT
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error data from backend:", errorData);
    throw new Error(errorData.message || "Failed fetching protected data");
  }

  return res.json();
};

// New orgFetch function for Organization Authentication
export const orgFetch = async (url: string, options: RequestInit = {}) => {
  const orgToken = localStorage.getItem("authToken");
  console.log("Using orgToken:", orgToken);  // Check the token value before sending it
  if (!orgToken) throw new Error("No Organization JWT token found");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${orgToken}`,
      "Content-Type": "application/json",
    },
  });

  console.log("Request Headers:", {
    Authorization: `Bearer ${orgToken}`,
    "Content-Type": "application/json",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Error data from backend:", errorData);
    throw new Error(errorData.message || "Failed fetching protected data for organization");
  }

  return res.json();
};
