import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../services/auth.service';

type ProtectedRouteProps = {
    children: React.ReactElement;
    allowedRoles?: UserRole[];
};

const redirectByRole: Record<UserRole, string> = {
    ADMIN: '/admin/dashboard',
    SHOP_OWNER: '/owner/dashboard',
    TOURIST: '/login',
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles?.length) {
        const role = user?.role;
        if (!role) {
            return <Navigate to="/login" replace state={{ from: location }} />;
        }
        if (!allowedRoles.includes(role)) {
            return <Navigate to={redirectByRole[role] ?? '/login'} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
