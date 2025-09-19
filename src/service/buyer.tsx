import axios from "axios";
import { api } from "@/lib/utils";
import { 
    type BuyerListResponse, 
    type BuyerCreatePayload, 
    type BuyerData, 
    type BuyerUpdatePayload 
} from "@/model/buyer";


export const getBuyers = async (
  filters: { name?: string },
  page: number = 1,
  limit: number = 10
): Promise<BuyerListResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };

  const response = await api.get('/v1/buyer', { params });
  return response.data;
};

export const createBuyer = async (buyerData: BuyerCreatePayload): Promise<BuyerData> => {
  try {
    const response = await api.post('/v1/buyer', buyerData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menambah data pembeli baru.');
    }
    throw new Error('Gagal menambah data pembeli baru.');
  }
};

export const updateBuyer = async (id: number, buyerData: BuyerUpdatePayload): Promise<BuyerData> => {
  try {
    const response = await api.put(`/v1/buyer/${id}`, buyerData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data pembeli.');
    }
    throw new Error('Gagal merubah data pembeli.');
  }
};

export const deleteBuyerById = async (id: number) => {
  try {
    await api.delete(`/v1/buyer/${id}`);
    return { message: 'Buyer deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data pembeli.');
    }
    throw new Error('Gagal menghapus data pembeli.');
  }
};