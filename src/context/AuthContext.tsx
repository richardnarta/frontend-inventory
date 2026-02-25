import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserData } from '@/model/auth';

interface AuthContextValue {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<UserData | null>(null);

    const setUser = useCallback((u: UserData | null) => {
        setUserState(u);
    }, []);

    const clearUser = useCallback(() => {
        setUserState(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, clearUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
    return ctx;
}
