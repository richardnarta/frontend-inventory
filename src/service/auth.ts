import { api } from "@/lib/utils";
import axios from "axios";
import type { 
    UserLoginRequest, 
    BaseSingleResponse,
    SingleUserResponse
} from '../model/auth';

/**
 * Attempts to log in a user with the provided credentials.
 * @param credentials - The user's username and password.
 * @returns A promise that resolves with the server's response.
 */
export const login = async (credentials: UserLoginRequest): Promise<BaseSingleResponse> => {
    try {
        const response = await api.post('/v1/auth/login', credentials);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Use the 'detail' field from the backend error if available
            const errorMessage = error.response.data.detail || error.response.data.message || 'Username atau password salah.';
            throw new Error(errorMessage);
        }
        throw new Error('Terjadi kesalahan saat mencoba login.');
    }
};

export const refreshToken = async (): Promise<void> => {
    try {
        await api.post('/v1/auth/refresh');
    } catch {
        throw new Error("Gagal memperbarui sesi.");
    }
};

/**
 * Fetches the current authenticated user's profile to verify the session.
 * @returns A promise that resolves with the user's profile data.
 */
export const getProfile = async (): Promise<SingleUserResponse> => {
    try {
        // First attempt to get the profile
        const response = await api.get('/v1/auth/me');
        return response.data;
    } catch (error) {
        // Check if the error is a 401 Unauthorized error
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            await refreshToken();
        }
        // For any other errors, just re-throw them
        throw error;
    }
};


/**
 * Logs out the current user by clearing the session cookie.
 * @returns A promise that resolves with the server's response.
 */
export const logout = async (): Promise<BaseSingleResponse> => {
    try {
        const response = await api.post('/v1/auth/logout');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Gagal untuk logout.');
        }
        throw new Error('Terjadi kesalahan saat mencoba logout.');
    }
};

