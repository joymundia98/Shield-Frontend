import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

// Permission, User, and Organization interfaces, now including headquarters (HQ) specific fields

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
  role_id: number;   // role_id is the ID of the role assigned to the user
  roles: string[];   // roles associated with the user
  permissions?: Permission[];
  org_id?: string;
  //org_type: 'church' | 'ngo';
  hq_id?: string;    // HQ-specific ID if logged in as HQ
  hq_type?: string;  // HQ-specific type (e.g., 'corporate', 'branch')
}

interface Organization {
  id: string;
  name: string;
  denomination: string;
  address: string;
  region: string;
  district: string;
  status: string;
  created_at: string;
  organization_email?: string;
  organization_account_id?: string;
  org_type_id: string;
}

interface Hq {
  id: string;
  name: string;
  address: string;
  email: string;
  region: string;
  country: string;
  hq_status: string;
  created_at: string;
  headquarters_account_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  organization: Organization | null;
  headquarters: Hq | null;  // HQ-specific data in context
  loadingPermissions: boolean;
  login: (token: string, user: User | null, organization: Organization | null, headquarters: Hq | null) => void;
  logout: () => void;
  hasPermission: (route: string) => boolean;
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
    console.log('Fetched permissions data:', data); // <-- Log full response here

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
  const [headquarters, setHeadquarters] = useState<Hq | null>(null);  // State for HQ
  const [token, setToken] = useState<string | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    const savedOrg = localStorage.getItem('organization');
    const savedHq = localStorage.getItem('headquarters');  // Check for saved HQ data

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }

    if (savedOrg) {
      setOrganization(JSON.parse(savedOrg));
    }

    if (savedHq) {
      setHeadquarters(JSON.parse(savedHq));  // Retrieve HQ data from localStorage
    }
  }, []);

  const login = async (token: string, user: User | null, organization: Organization | null, headquarters: Hq | null) => {
    console.log('Logging in with the following data:');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Organization:', organization);
    console.log('Headquarters:', headquarters);

    setToken(token);
    setUser(user);
    setOrganization(organization);
    setHeadquarters(headquarters);  // Set HQ data in the context

    // Save to localStorage
    localStorage.setItem('authToken', token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    if (organization) {
      localStorage.setItem('organization', JSON.stringify(organization));
    }
    if (headquarters) {
      localStorage.setItem('headquarters', JSON.stringify(headquarters));  // Save HQ data
    }

    console.log('Login successful, state updated:');
    console.log('Updated Token:', token);
    console.log('Updated User:', user);
    console.log('Updated Organization:', organization);
    console.log('Updated Headquarters:', headquarters);

    // Fetch permissions after login and update state
    if (user?.role_id) {
      const roleId = user.role_id.toString();  // Ensure roleId is passed as a string
      console.log('RoleId', roleId);
      setLoadingPermissions(true); // Start loading permissions

      try {
        const permissions = await fetchPermissionsForRole(roleId, token);
        console.log('permissions', permissions);
        setUser((prev) => prev ? { ...prev, permissions } : prev);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }

      setLoadingPermissions(false); // Stop loading permissions
    }
  };

  const logout = () => {
    console.log('Logging out...');

    setToken(null);
    setUser(null);
    setOrganization(null);
    setHeadquarters(null);  // Clear HQ data on logout

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    localStorage.removeItem('headquarters');  // Remove HQ data from localStorage

    // Log after logout is completed
    console.log('Logout successful, state cleared:');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Organization:', organization);
    console.log('Headquarters:', headquarters);
  };

  const hasPermission = (requiredPermission: string): boolean => {
    console.log('Checking permission...');
    console.log(`Required permission: ${requiredPermission}`);
    
    // Ensure permissions are loaded before proceeding
    if (!user || !user.permissions || user.permissions.length === 0) {
      console.log('User or permissions are not available or permissions are empty');
      return false;  // Return false if the user or permissions are missing or empty
    }

    console.log('User and permissions are available');
    console.log('User object:', user);
    console.log('User permissions:', user.permissions);

    const permissionMatch = user.permissions.find(
      (perm) => perm.name === requiredPermission
    );

    if (permissionMatch) {
      console.log(`Permission found for "${requiredPermission}":`, permissionMatch);
      return true;
    } else {
      console.log(`No permission found for "${requiredPermission}"`);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, organization, headquarters, loadingPermissions, login, logout, hasPermission }}>
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
