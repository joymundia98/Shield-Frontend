// src/utils/api.ts
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  console.log("Using token:", token);
  if (!token) throw new Error("No JWT token found");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,  // automatically attach JWT
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
