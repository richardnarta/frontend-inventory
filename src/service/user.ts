import { api } from '@/lib/utils';
import axios from 'axios';
import type {
    UserItem,
    UserCreateRequest,
    UserUpdateRequest,
    UserListResponse,
    SingleUserFullResponse,
} from '@/model/user';

export const getUsers = async (): Promise<UserItem[]> => {
    try {
        const response = await api.get<UserListResponse>('/v1/users');
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Gagal mengambil data user.');
        }
        throw new Error('Terjadi kesalahan saat mengambil data user.');
    }
};

export const createUser = async (data: UserCreateRequest): Promise<UserItem> => {
    try {
        const response = await api.post<SingleUserFullResponse>('/v1/users', data);
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Gagal membuat user.');
        }
        throw new Error('Terjadi kesalahan saat membuat user.');
    }
};

export const updateUser = async (id: string, data: UserUpdateRequest): Promise<UserItem> => {
    try {
        const response = await api.put<SingleUserFullResponse>(`/v1/users/${id}`, data);
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Gagal memperbarui user.');
        }
        throw new Error('Terjadi kesalahan saat memperbarui user.');
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    try {
        await api.delete(`/v1/users/${id}`);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Gagal menghapus user.');
        }
        throw new Error('Terjadi kesalahan saat menghapus user.');
    }
};
