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

/**
 * ✅ Default permission granted to ALL users
 */
const DEFAULT_DASHBOARD_PERMISSION: Permission = {
  id: -1,
  name: 'View Programs Dashboard',
  path: '/dashboard',
  method: 'GET',
  description: 'Default permission granted to all users',
};

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
    console.log('Fetched permissions data:', data);

    if (data.data && Array.isArray(data.data)) {
      allPermissions.push(...data.data);
    }
  } catch (error) {
    console.error('Error fetching permissions:', error);
  }

  const uniquePermissions = allPermissions.filter(
    (perm, index, self) => index === self.findIndex(p => p.id === perm.id)
  );

  return uniquePermissions;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [headquarters, setHeadquarters] = useState<Hq | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('authToken');
    const savedOrg = localStorage.getItem('organization');
    const savedHq = localStorage.getItem('headquarters');

    if (savedUser && savedToken) {
      const parsedUser: User = JSON.parse(savedUser);

      // ✅ Ensure default permission always exists
      parsedUser.permissions = [
        DEFAULT_DASHBOARD_PERMISSION,
        ...(parsedUser.permissions || []),
      ].filter(
        (perm, index, self) =>
          index === self.findIndex(p => p.name === perm.name)
      );

      setUser(parsedUser);
      setToken(savedToken);
    }

    if (savedOrg) {
      setOrganization(JSON.parse(savedOrg));
    }

    if (savedHq) {
      setHeadquarters(JSON.parse(savedHq));
    }
  }, []);

  const login = async (
    token: string,
    user: User | null,
    organization: Organization | null,
    headquarters: Hq | null
  ) => {
    console.log('Logging in with the following data:');
    console.log('Token:', token);
    console.log('User:', user);
    console.log('Organization:', organization);
    console.log('Headquarters:', headquarters);

    setToken(token);
    setUser(user);
    setOrganization(organization);
    setHeadquarters(headquarters);

    localStorage.setItem('authToken', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (organization) localStorage.setItem('organization', JSON.stringify(organization));
    if (headquarters) localStorage.setItem('headquarters', JSON.stringify(headquarters));

    console.log('Login successful, state updated');

    if (user?.role_id) {
      const roleId = user.role_id.toString();
      setLoadingPermissions(true);

      try {
        const permissions = await fetchPermissionsForRole(roleId, token);
        console.log('Fetched role permissions:', permissions);

        const mergedPermissions: Permission[] = [
          DEFAULT_DASHBOARD_PERMISSION,
          ...(permissions || []),
        ];

        const uniquePermissions = mergedPermissions.filter(
          (perm, index, self) =>
            index === self.findIndex(p => p.name === perm.name)
        );

        setUser(prev =>
          prev ? { ...prev, permissions: uniquePermissions } : prev
        );
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }

      setLoadingPermissions(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');

    setToken(null);
    setUser(null);
    setOrganization(null);
    setHeadquarters(null);

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    localStorage.removeItem('headquarters');
  };

  const hasPermission = (requiredPermission: string): boolean => {
    console.log('Checking permission...');
    console.log(`Required permission: ${requiredPermission}`);

    if (!user || !user.permissions || user.permissions.length === 0) {
      console.log('User or permissions are not available or permissions are empty');
      return false;
    }

    console.log('User permissions:', user.permissions);

    const permissionMatch = user.permissions.find(
      perm => perm.name === requiredPermission
    );

    if (permissionMatch) {
      console.log(`Permission found for "${requiredPermission}"`);
      return true;
    }

    console.log(`No permission found for "${requiredPermission}"`);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        organization,
        headquarters,
        loadingPermissions,
        login,
        logout,
        hasPermission,
      }}
    >
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
