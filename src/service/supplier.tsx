import { api } from "@/lib/utils";
import axios from "axios";
import type {
  SupplierListResponse,
  SingleSupplierResponse,
  SupplierCreatePayload,
  SupplierUpdatePayload,
} from "@/model/supplier";


export const getSuppliers = async (
  filters: { name?: string },
  page: number = 1,
  limit: number = 10
): Promise<SupplierListResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };

  const response = await api.get('/v1/supplier', { params });
  return response.data;
};


export const createSupplier = async (supplierData: SupplierCreatePayload): Promise<SingleSupplierResponse> => {
  try {
    const response = await api.post('/v1/supplier', supplierData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menambah data supplier baru.');
    }
    throw new Error('Gagal menambah data supplier baru.');
  }
};


export const updateSupplier = async (id: number, supplierData: SupplierUpdatePayload): Promise<SingleSupplierResponse> => {
  try {
    const response = await api.put(`/v1/supplier/${id}`, supplierData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data supplier.');
    }
    throw new Error('Gagal merubah data supplier.');
  }
};


export const deleteSupplierById = async (id: number) => {
  try {
    await api.delete(`/v1/supplier/${id}`);
    return { message: 'Supplier deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data supplier.');
    }
    throw new Error('Gagal menghapus data supplier.');
  }
};