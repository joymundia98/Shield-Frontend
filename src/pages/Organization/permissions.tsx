import React, { useState, useEffect } from "react";
import { orgFetch } from "../../utils/api"; // Assuming you have an api helper to handle requests
import "./permissions.css";

const baseURL = import.meta.env.VITE_BASE_URL;

interface Permission {
  id: number;
  name: string;
  path: string;
  method: string;
  description: string;
}

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch permissions from the API
  const fetchPermissions = async () => {
    try {
      const response = await orgFetch(`${baseURL}/api/permissions`);
      console.log("Fetched permissions response:", response);
      setPermissions(response); // Assuming the response is an array of permissions
      setLoading(false);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError("There was an error fetching permissions.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions(); // Fetch permissions when the component mounts
  }, []);

  // Render a loading state or an error if there's an issue
  if (loading) return <p>Loading permissions...</p>;
  if (error) return <p>{error}</p>;

  // Function to render permission groups based on categories
  const renderPermissions = (category: string) => {
    return permissions
      .filter((permission) => permission.name.includes(category))
      .map((permission) => (
        <div key={permission.id} className="form__group">
          <input type="checkbox" id={permission.name} name={category} />
          <label htmlFor={permission.name}>{permission.description}</label>
        </div>
      ));
  };

  return (
    <div className="permissions-dashboard">
      <h1>Permissions Dashboard</h1>

      <div className="radio-inputs">
        <label className="radio">
          <input type="radio" name="radio" />
          <span className="name">
            <span className="pre-name"></span>
            <span className="pos-name"></span>
            <span> Congregation </span>
          </span>
          <div className="content">
            <div>
              <h2>Congregation Permissions</h2>
              <div className="grid">
                {renderPermissions("Congregation")}
              </div>
            </div>
          </div>
        </label>

        <label className="radio">
          <input type="radio" name="radio" />
          <span className="name">
            <span className="pre-name"></span>
            <span className="pos-name"></span>
            <span> Finance </span>
          </span>
          <div className="content">
            <div>
              <h2>Finance Permissions</h2>
              <div className="grid">
                {renderPermissions("Finance")}
              </div>
            </div>
          </div>
        </label>

        <label className="radio">
          <input type="radio" name="radio" />
          <span className="name">
            <span className="pre-name"></span>
            <span className="pos-name"></span>
            <span> HR </span>
          </span>
          <div className="content">
            <div>
              <h2>HR Permissions</h2>
              <div className="grid">
                {renderPermissions("HR")}
              </div>
            </div>
          </div>
        </label>

        <label className="radio">
          <input type="radio" name="radio" />
          <span className="name">
            <span className="pre-name"></span>
            <span className="pos-name"></span>
            <span> Assets </span>
          </span>
          <div className="content">
            <div>
              <h2>Assets Permissions</h2>
              <div className="grid">
                {renderPermissions("Assets")}
              </div>
            </div>
          </div>
        </label>

        <label className="radio">
          <input type="radio" name="radio" />
          <span className="name">
            <span className="pre-name"></span>
            <span className="pos-name"></span>
            <span> Programs </span>
          </span>
          <div className="content">
            <div>
              <h2>Programs Permissions</h2>
              <div className="grid">
                {renderPermissions("Programs")}
              </div>
            </div>
          </div>
        </label>

        <label className="radio">
          <input type="radio" name="radio" />
          <span className="name">
            <span className="pre-name"></span>
            <span className="pos-name"></span>
            <span> Donors </span>
          </span>
          <div className="content">
            <div>
              <h2>Donors Permissions</h2>
              <div className="grid">
                {renderPermissions("Donors")}
              </div>
            </div>
          </div>
        </label>

        <label className="radio">
          <input type="radio" name="radio" />
          <span className="name">
            <span className="pre-name"></span>
            <span className="pos-name"></span>
            <span> Governance </span>
          </span>
          <div className="content">
            <div>
              <h2>Governance Permissions</h2>
              <div className="grid">
                {renderPermissions("Governance")}
              </div>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PermissionsPage;
