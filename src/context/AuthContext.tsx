import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Updated User and Organization interfaces to reflect the database structure
interface User {
  id: string;
  full_name: string;
  email: string;
  org_id: string;
  org_type: 'church' | 'ngo';
  roles?: string[];
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
  login: (token: string, user: User | null, organization: Organization | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(null);

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

  const login = (token: string, user: User | null, organization: Organization | null) => {
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

  return (
    <AuthContext.Provider value={{ user, token, organization, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
