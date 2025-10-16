import { type InventoryData, type InventoryListResponse } from "../model/inventory";
import { api } from "../lib/utils";
import axios from "axios";

export const getInventories = async (
    filters: { name?: string, id?: string, type?: string },
    page: number = 1,
    limit: number = 10
): Promise<InventoryListResponse> => {
    const params = {
        page,
        limit,
        ...filters
    };

    const response = await api.get('/v1/inventory', { params });

    return response.data;
};

export const createInventory = async (productData: Omit<InventoryData, 'id' | 'total' | 'bale_count'> & {type: string}) => {
    try {
        const response = await api.post('/v1/inventory', productData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to create product');
        }
        throw new Error('An unexpected error occurred');
    }
};

export const updateInventory = async (id: string, productData: Omit<InventoryData, 'id' | 'total' | 'type' | 'bale_count'>) => {
    try {
        const response = await api.put(`/v1/inventory/${id}`, productData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to update product');
        }
        throw new Error('An unexpected error occurred');
    }
};

export const deleteInventoryById = async (id: string) => {
    try {
        await api.delete(`/v1/inventory/${id}`);
        return { message: 'Product deleted successfully' };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to delete product');
        }
        throw new Error('An unexpected error occurred');
    }
};