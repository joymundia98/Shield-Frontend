import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  requiredPermission: string;  // The required permission for accessing this route
  children: React.ReactNode;
  fallback: string;  // Route to navigate to if the user doesn't have the permission
}

export const ProtectedRoute = ({ requiredPermission, children, fallback }: ProtectedRouteProps) => {
  const { hasPermission, loadingPermissions } = useAuth();  // Get the permission check and loading state from context
  const navigate = useNavigate();

  // Wait for permissions to load
  if (loadingPermissions) {
    return <div>Loading permissions...</div>;  // You can replace this with a loading spinner if preferred
  }

  // Check if the user has the required permission
  const userHasPermission = hasPermission(requiredPermission);

  if (!userHasPermission) {
    // If the user doesn't have permission, navigate to the custom 403 page
    navigate(fallback, { replace: true });
    return null;  // Don't render anything if user is redirected
  }

  return <>{children}</>;  // Render the protected route content if the user has the permission
};
