import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  permission: string;  // The required permission to access this route
  children: React.ReactNode;
  fallback: string;  // Route to navigate to if the user doesn't have the permission
}

export const ProtectedRoute = ({ permission, children }: ProtectedRouteProps) => {
  const { hasPermission } = useAuth();  // Get the permission check from context
  const navigate = useNavigate();

  // Check if the user has the required permission
  if (!hasPermission(permission)) {
    // If the user doesn't have permission, navigate to the custom 403 page
    navigate("/403", { replace: true });
    return null;  // Don't render anything if user is redirected
  }

  return <>{children}</>;  // Render the protected route content if the user has the permission
};
