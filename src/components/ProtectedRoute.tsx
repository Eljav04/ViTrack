import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('Admin' | 'User')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
    const location = useLocation();

    if (isLoading) {
        // Or a spinner component
        return <div className="flex items-center justify-center min-h-screen">Yüklənir...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if role doesn't match
        // prevent infinite loops if they don't have access to anything
        return <Navigate to={user.role === 'Admin' ? '/admin' : '/employee'} replace />;
    }

    return <>{children}</>;
}
