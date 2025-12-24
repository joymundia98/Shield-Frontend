// client/src/context/AssetContext.tsx

import React, { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import type { Asset, AssetContextType } from "./types";

// Create context
const AssetContext = createContext<AssetContextType | undefined>(undefined);

// Provider component
export const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<Asset[]>([
    // Optional: initial dummy assets
    {
      id: "001",
      name: "Projector X1",
      category: "Electronics",
      location: "Main Hall",
      condition: "Good",
      assignedTo: "Media Team",
      initialValue: 1500,
      currentValue: 1200,
      depreciationRate: 20,
      underMaintenance: false,
    },
    {
      id: "002",
      name: "Chair A1",
      category: "Furniture",
      location: "Conference Room",
      condition: "Fair",
      assignedTo: "Admin Team",
      initialValue: 100,
      currentValue: 70,
      depreciationRate: 30,
      underMaintenance: true,
    },
  ]);

  return (
    <AssetContext.Provider value={{ inventory, setInventory }}>
      {children}
    </AssetContext.Provider>
  );
};

// Custom hook for convenience
export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) throw new Error("useAssets must be used within AssetProvider");
  return context;
};
