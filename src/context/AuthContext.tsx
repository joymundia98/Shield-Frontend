import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { permissionsMap } from './permissionsMap'; // Import the permissions map

// Updated User and Organization interfaces to reflect the database structure
interface Permission {
  id: number;
  name: string;
  path: string;
  method: string;
  description: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  org_id: string;
  org_type: 'church' | 'ngo';
  role?: string[];   // role is an array of role names (e.g., ['admin', 'manager'])
  role_id: number;   // role_id is the ID of the role assigned to the user
  permissions?: Permission[]; // Added permissions to user
}

interface Organization {
  id: string;
  name: string;
  denomination: string; // Type of religious denomination
  address: string;      // Address of the organization
  region: string;       // Region where the organization is located
  district: string;     // District where the organization is located
  status: string;       // Status, e.g., "active"
  created_at: string;   // Timestamp for when the organization was created
  organization_email?: string; // Optional email for the organization
  organization_account_id?: string; // Optional account identifier for the organization
  org_type_id: string; // This will likely map to your organization types ('church', 'ngo', etc.)
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  organization: Organization | null;
  loadingPermissions: boolean;  // Track if permissions are still being loaded
  login: (token: string, user: User | null, organization: Organization | null) => void;
  logout: () => void;
  hasPermission: (route: string) => boolean; // Add this function to check permissions
}

// Permission fetching function
export const fetchPermissionsForRole = async (roleId: string, token: string): Promise<Permission[]> => {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const allPermissions: Permission[] = [];

  try {
    const res = await fetch(`${baseURL}/api/role_permissions/role/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch permissions for role ID ${roleId}`);
    }

    const data = await res.json();

    if (data.data && Array.isArray(data.data)) {
      allPermissions.push(...data.data);
    }
  } catch (error) {
    console.error("Error fetching permissions:", error);
  }

  // Remove duplicates if there are any
  const uniquePermissions = allPermissions.filter(
    (perm, index, self) => index === self.findIndex((p) => p.id === perm.id)
  );

  return uniquePermissions;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false); // Track loading state for permissions

  // Debugging: Logs whenever state is initialized or updated
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    const savedOrg = localStorage.getItem('organization');

    // Log when checking localStorage on component mount
    console.log('Initial localStorage check:');
    console.log('Saved User:', savedUser);
    console.log('Saved Token:', savedToken);
    console.log('Saved Organization:', savedOrg);

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    if (savedOrg) {
      const parsedOrg = JSON.parse(savedOrg);

      // Ensure proper structure of the organization object
      const organization: Organization = {
        id: parsedOrg.id || '',
        name: parsedOrg.name || '',
        denomination: parsedOrg.denomination || '',
        address: parsedOrg.address || '',
        region: parsedOrg.region || '',
        district: parsedOrg.district || '',
        status: parsedOrg.status || 'active', // default to "active"
        created_at: parsedOrg.created_at || '',
        organization_email: parsedOrg.organization_email || '', // Optional
        organization_account_id: parsedOrg.organization_account_id || '', // Optional
        org_type_id: parsedOrg.org_type_id || '1', // Default to "1" for church, adjust as necessary
      };

      setOrganization(organization);
    }
  }, []);

  const login = async (token: string, user: User | null, organization: Organization | null) => {
    console.log('Logging in with the following data:');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Organization:', organization);

    setToken(token);
    setUser(user);
    setOrganization(organization);

    // Save to localStorage
    localStorage.setItem('authToken', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    if (organization) {
      localStorage.setItem('organization', JSON.stringify(organization));  // Ensure this line is working
    }

    console.log('Login successful, state updated:');
    console.log('Updated Token:', token);
    console.log('Updated User:', user);
    console.log('Updated Organization:', organization);

    // Fetch permissions using the role_id directly from the user object
    if (user?.role_id) {
      const roleId = user.role_id;  // Directly using user.role_id
      setLoadingPermissions(true); // Start loading permissions
      const permissions = await fetchPermissionsForRole(roleId.toString(), token); // Ensure roleId is passed as a string
      setUser((prev) => prev ? { ...prev, permissions } : prev);
      setLoadingPermissions(false); // Stop loading permissions
    }
  };

  const logout = () => {
    console.log('Logging out...');

    setToken(null);
    setUser(null);
    setOrganization(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');

    // Log after logout is completed
    console.log('Logout successful, state cleared:');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Organization:', organization);
  };

  const hasPermission = (route: string): boolean => {
  // Step 1: Check if user and permissions are available
  if (!user || !user.permissions) return false;

  // Step 2: Look up the permissions required for the given route in permissionsMap
  const requiredPermissions = permissionsMap[route];

  // Step 3: If no specific permissions are required for this route, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;  // No permissions required, access granted
  }

  // Step 4: Check if the user has any of the required permissions for the route
  return user.permissions.some((perm) => requiredPermissions.includes(perm.name));
};


  return (
    <AuthContext.Provider value={{ user, token, organization, loadingPermissions, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
