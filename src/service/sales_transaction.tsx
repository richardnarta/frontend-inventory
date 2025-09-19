import { api } from "@/lib/utils";
import axios from "axios";
import type {
  SalesTransactionListResponse,
  SingleSalesTransactionResponse,
  SalesTransactionCreatePayload,
  SalesTransactionUpdatePayload,
} from "@/model/sales_transaction";


export type SalesTransactionFilters = {
    buyer_id?: number | null;
    inventory_id?: string | null;
    start_date?: string | null;
    end_date?: string | null;
};

export const getSalesTransactions = async (
  filters: SalesTransactionFilters,
  page: number = 1,
  limit: number = 10
): Promise<SalesTransactionListResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };

  const response = await api.get('/v1/transaction/sales', { params });
  return response.data;
};

export const createSalesTransaction = async (transactionData: SalesTransactionCreatePayload): Promise<SingleSalesTransactionResponse> => {
  try {
    const response = await api.post('/v1/transaction/sales', transactionData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menambah data transaksi penjualan baru.');
    }
    throw new Error('Gagal menambah data transaksi penjualan baru.');
  }
};

export const updateSalesTransaction = async (id: number, transactionData: SalesTransactionUpdatePayload): Promise<SingleSalesTransactionResponse> => {
  try {
    const response = await api.put(`/v1/transaction/sales/${id}`, transactionData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data transaksi penjualan.');
    }
    throw new Error('Gagal merubah data transaksi penjualan.');
  }
};

export const deleteSalesTransactionById = async (id: number) => {
  try {
    await api.delete(`/v1/transaction/sales/${id}`);
    return { message: 'Sales transaction deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data transaksi penjualan.');
    }
    throw new Error('Gagal menghapus data transaksi penjualan.');
  }
};