import {
    type InventoryListResponse,
    type InventoryCreateRequest,
    type InventoryUpdateRequest,
    type BatchUploadResponse
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

export const getInventoryById = async (kode_barang: string) => {
    try {
        const response = await api.get(`/v1/inventory/${kode_barang}`);
        return response.data.data; // Returns InventoryData
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to fetch inventory item');
        }
        throw new Error('An unexpected error occurred');
    }
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

export const deleteInventoryByKode = async (kodeBarang: string) => {
    try {
        await api.delete(`/v1/inventory/${kodeBarang}`);
        return { message: 'Barang berhasil dihapus.' };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || error.response.data.detail || 'Gagal menghapus barang.');
        }
        throw new Error('Gagal menghapus barang.');
    }
};

export const bulkDeleteInventory = async (ids?: string[], deleteAll = false) => {
    try {
        const response = await api.delete('/v1/inventory/bulk/delete', {
            data: { ids: ids ?? null, delete_all: deleteAll },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || error.response.data.detail || 'Gagal menghapus data barang.');
        }
        throw new Error('Gagal menghapus data barang.');
    }
};


export const batchUploadInventory = async (file: File): Promise<BatchUploadResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/v1/inventory/batch-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to upload Excel file');
        }
        throw new Error('An unexpected error occurred during batch upload');
    }
};

export const exportInventoryToExcel = async (): Promise<void> => {
    try {
        const response = await api.get('/v1/inventory/export-excel', {
            responseType: 'blob', // Important for file download
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Generate filename with current date
        const filename = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.setAttribute('download', filename);

        // Trigger download
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Clean up
        window.URL.revokeObjectURL(url);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.detail || 'Failed to export inventory');
        }
        throw new Error('An unexpected error occurred during export');
    }
};