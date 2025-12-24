// client/src/context/types.ts

export interface Asset {
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

export interface AssetContextType {
  inventory: Asset[];
  setInventory: React.Dispatch<React.SetStateAction<Asset[]>>;
}
