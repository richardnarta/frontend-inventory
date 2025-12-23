import {
    type InventoryListResponse,
    type InventoryCreateRequest,
    type InventoryUpdateRequest
} from "../model/inventory";
import { api } from "../lib/utils";
import axios from "axios";

export const getInventories = async (
    filters: { nama_barang?: string, kode_barang?: string, quantity_unit?: string },
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

export const createInventory = async (productData: InventoryCreateRequest) => {
    try {
        const response = await api.post('/v1/inventory', productData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to create inventory item');
        }
        throw new Error('An unexpected error occurred');
    }
};

export const updateInventory = async (kode_barang: string, productData: InventoryUpdateRequest) => {
    try {
        const response = await api.put(`/v1/inventory/${kode_barang}`, productData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to update inventory item');
        }
        throw new Error('An unexpected error occurred');
    }
};

export const deleteInventoryById = async (kode_barang: string) => {
    try {
        await api.delete(`/v1/inventory/${kode_barang}`);
        return { message: 'Inventory item deleted successfully' };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to delete inventory item');
        }
        throw new Error('An unexpected error occurred');
    }
};