import React, { useState } from "react";

const baseURL = import.meta.env.VITE_BASE_URL;

const UploadCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("users");
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

    const token = localStorage.getItem("authToken");

    if (!token) {
      setMessage("You are not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch(`${baseURL}/api/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ only header
        },
        body: formData, // ✅ multipart handled by browser
      });

      const data = await res.json();

      if (!res.ok) {
        throw data;
      }

      setMessage(`${data.count} rows uploaded successfully to ${type} table.`);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setMessage(error?.error || "Upload failed");
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
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
          />
        </div>

        <button type="submit">Upload</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadCSV;
