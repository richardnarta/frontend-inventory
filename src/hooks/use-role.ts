import { useAuthContext } from '@/context/AuthContext';

/**
 * Hook to access the current user's role and derived permission flags.
 */
export function useRole() {
    const { user } = useAuthContext();

    return {
        role: user?.role ?? null,
        isRoot: user?.role === 'root',
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
        /** true for root and admin — can perform write operations */
        canWrite: user?.role === 'root' || user?.role === 'admin',
        user,
    };
}
