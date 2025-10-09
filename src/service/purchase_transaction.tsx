// service/purchase_transaction.ts
import { api } from "@/lib/utils";
import axios from "axios";
import type {
  PurchaseTransactionListResponse,
  SinglePurchaseTransactionResponse,
  PurchaseTransactionCreatePayload,
  PurchaseTransactionUpdatePayload,
} from "@/model/purchase_transaction";

export type PurchaseTransactionFilters = {
    supplier_id?: number | null;
    inventory_id?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    type?: string
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

export const createPurchaseTransaction = async (transactionData: PurchaseTransactionCreatePayload): Promise<SinglePurchaseTransactionResponse> => {
  try {
    const response = await api.post('/v1/purchase-transaction', transactionData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menambah data transaksi pembelian baru.');
    }
    throw new Error('Gagal menambah data transaksi pembelian baru.');
  }
};

export const updatePurchaseTransaction = async (id: number, transactionData: PurchaseTransactionUpdatePayload): Promise<SinglePurchaseTransactionResponse> => {
  try {
    const response = await api.put(`/v1/purchase-transaction/${id}`, transactionData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data transaksi pembelian.');
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
      throw new Error(error.response.data.message || 'Gagal menghapus data transaksi pembelian.');
    }
    throw new Error('Gagal menghapus data transaksi pembelian.');
  }
};