import React, { useState } from "react";
import { authFetch, orgFetch } from "../utils/api"; // Import authFetch & orgFetch

const baseURL = import.meta.env.VITE_BASE_URL;

const UploadCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("users"); // default table
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      // Try authFetch first
      const response = await authFetch(`${baseURL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      setMessage(`${response.count} rows uploaded successfully to ${type} table.`);
    } catch (err) {
      console.warn("authFetch failed, falling back to orgFetch", err);

      try {
        // Fallback to orgFetch
        const response = await orgFetch(`${baseURL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        setMessage(`${response.count} rows uploaded successfully to ${type} table.`);
      } catch (error) {
        console.error("Upload failed:", error);
        // Type assertion to specify error shape
        setMessage((error as { error: string })?.error || "Upload failed");
      }
    }
  };

  return (
    <div>
      <h2>Upload CSV / Excel</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Table:</label>
          <select value={type} onChange={handleTypeChange}>
            <option value="users">Users</option>
            <option value="members">Members</option>
            <option value="programs">Programs</option>
          </select>
        </div>

        <div>
          <label>Select File:</label>
          <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
        </div>

        <button type="submit">Upload</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadCSV;
