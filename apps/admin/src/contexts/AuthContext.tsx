import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, type AuthUser, type LoginResponse } from '../services/auth.service';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: AuthUser | null;
    login: (response: LoginResponse) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_USER_KEY = 'authUser';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem(AUTH_USER_KEY);

        if (token && refreshToken) {
            setIsAuthenticated(true);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser) as AuthUser);
                } catch {
                    localStorage.removeItem(AUTH_USER_KEY);
                }
            }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }

        setIsLoading(false);
    }, []);

    const login = useCallback((response: LoginResponse) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
    }), [isAuthenticated, isLoading, user, login, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
