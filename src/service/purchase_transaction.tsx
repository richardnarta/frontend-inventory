import { api } from "@/lib/utils";
import axios from "axios";
import type {
  PurchaseTransactionListResponse,
  PurchaseTransactionCreateRequest,
  PurchaseTransactionUpdateRequest,
} from "@/model/purchase_transaction";

export type PurchaseTransactionFilters = {
  supplier_id?: number | null;
  inventory_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

export const getPurchaseTransactions = async (
  filters: PurchaseTransactionFilters,
  page: number = 1,
  limit: number = 10
): Promise<PurchaseTransactionListResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };

  const response = await api.get('/v1/purchase-transaction', { params });
  return response.data;
};

export const createPurchaseTransaction = async (transactionData: PurchaseTransactionCreateRequest) => {
  try {
    const response = await api.post('/v1/purchase-transaction', transactionData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMsg = error.response.data.message || error.response.data.detail || 'Gagal menambah data transaksi pembelian baru.';
      throw new Error(errorMsg);
    }
    throw new Error('Gagal menambah data transaksi pembelian baru.');
  }
};

export const updatePurchaseTransaction = async (id: number, transactionData: PurchaseTransactionUpdateRequest) => {
  try {
    const response = await api.put(`/v1/purchase-transaction/${id}`, transactionData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMsg = error.response.data.message || error.response.data.detail || 'Gagal merubah data transaksi pembelian.';
      throw new Error(errorMsg);
    }
    throw new Error('Gagal merubah data transaksi pembelian.');
  }
};

export const deletePurchaseTransactionById = async (id: number) => {
  try {
    await api.delete(`/v1/purchase-transaction/${id}`);
    return { message: 'Purchase transaction deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMsg = error.response.data.message || error.response.data.detail || 'Gagal menghapus data transaksi pembelian.';
      throw new Error(errorMsg);
    }
    throw new Error('Gagal menghapus data transaksi pembelian.');
  }
};

export const bulkDeletePurchaseTransactions = async (ids?: number[], deleteAll = false) => {
  try {
    const response = await api.delete('/v1/purchase-transaction/bulk/delete', {
      data: { ids: ids ?? null, delete_all: deleteAll },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMsg = error.response.data.message || error.response.data.detail || 'Gagal menghapus data transaksi pembelian.';
      throw new Error(errorMsg);
    }
    throw new Error('Gagal menghapus data transaksi pembelian.');
  }
};
