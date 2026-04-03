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

const isUserRole = (value: unknown): value is AuthUser['role'] =>
    value === 'ADMIN' || value === 'SHOP_OWNER' || value === 'TOURIST';

const isAuthUser = (value: unknown): value is AuthUser => {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.id === 'string' &&
        typeof candidate.email === 'string' &&
        typeof candidate.fullName === 'string' &&
        isUserRole(candidate.role)
    );
};

const normalizeBase64 = (value: string) => {
    const padded = value.padEnd(Math.ceil(value.length / 4) * 4, '=');
    return padded.replace(/-/g, '+').replace(/_/g, '/');
};

const buildUserFromAccessToken = (token: string): AuthUser | null => {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payloadRaw = atob(normalizeBase64(parts[1]));
        const payload = JSON.parse(payloadRaw) as Record<string, unknown>;

        const id = typeof payload.sub === 'string' ? payload.sub : '';
        const email = typeof payload.email === 'string' ? payload.email : '';
        const role = payload.role;

        if (!id || !email || !isUserRole(role)) return null;

        return {
            id,
            email,
            role,
            fullName: typeof payload.fullName === 'string' && payload.fullName.trim()
                ? payload.fullName
                : email,
        };
    } catch {
        return null;
    }
};

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
            let parsedStoredUser: AuthUser | null = null;

            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (isAuthUser(parsed)) {
                        parsedStoredUser = parsed;
                    } else {
                        localStorage.removeItem(AUTH_USER_KEY);
                    }
                } catch {
                    localStorage.removeItem(AUTH_USER_KEY);
                }

                // If token and stored user disagree, trust token claims.
                const tokenUser = buildUserFromAccessToken(token);
                if (tokenUser) {
                    if (
                        !parsedStoredUser ||
                        parsedStoredUser.id !== tokenUser.id ||
                        parsedStoredUser.email !== tokenUser.email ||
                        parsedStoredUser.role !== tokenUser.role
                    ) {
                        setUser(tokenUser);
                        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(tokenUser));
                    } else {
                        setUser(parsedStoredUser);
                    }
                } else if (parsedStoredUser) {
                    setUser(parsedStoredUser);
                } else {
                    setUser(null);
                }
            } else {
                const tokenUser = buildUserFromAccessToken(token);
                if (tokenUser) {
                    setUser(tokenUser);
                    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(tokenUser));
                } else {
                    setUser(null);
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
