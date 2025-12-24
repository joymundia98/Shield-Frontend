import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/global.css";
import AssetsHeader from './AssetsHeader';

interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  condition: string;
  assignedTo: string;
  initialValue: number;
  currentValue: number;
  depreciationRate: number;
  underMaintenance: boolean;
}

const AddAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // We receive setInventory from AssetsPage
  const addAsset = location.state?.addAssetCallback;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    value: "",
    condition: "",
    assignedTo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addAsset) {
      alert("Error: assets page did not receive callback.");
      return;
    }

    const newAsset: Asset = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      location: formData.location,
      condition: formData.condition,
      assignedTo: formData.assignedTo,
      initialValue: Number(formData.value),
      currentValue: Number(formData.value),
      depreciationRate: 10,
      underMaintenance: false,
    };

    addAsset((prev: Asset[]) => [...prev, newAsset]);

    navigate("/assets"); // redirect back to list
  };

  const handleCancel = () => navigate("/assets");

  return (
    <div className="dashboard-wrapper">

      <div className="dashboard-content">

        <AssetsHeader/><br/>

        <h1>Add New Asset</h1>

        <div className="FormContainer">
          <form onSubmit={handleSubmit}>

            <label>Asset Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />

            <label>Category</label>
            <select name="category" required value={formData.category} onChange={handleChange}>
              <option value="">Select Category</option>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Vehicles</option>
              <option>Religious Items</option>
            </select>

            <label>Location</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
            />

            <label>Value ($)</label>
            <input
              type="number"
              name="value"
              required
              value={formData.value}
              onChange={handleChange}
            />

            <label>Condition</label>
            <select name="condition" required value={formData.condition} onChange={handleChange}>
              <option value="">Select Condition</option>
              <option>New</option>
              <option>Good</option>
              <option>Needs Repair</option>
            </select>

            <label>Assigned To</label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
            />

            <div className="form-buttons">
              <button type="submit" className="add-btn">Add Asset</button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AddAssetPage;
