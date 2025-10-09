// service/operator.ts
import axios from "axios";
import { api } from "@/lib/utils";
import { 
    type OperatorListResponse, 
    type OperatorCreatePayload, 
    type OperatorUpdatePayload,
    type SingleOperatorResponse
} from "@/model/operator";

export const getOperators = async (
  filters: { name?: string },
  page: number = 1,
  limit: number = 10
): Promise<OperatorListResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };

  const response = await api.get('/v1/operator', { params });
  return response.data;
};

export const createOperator = async (operatorData: OperatorCreatePayload): Promise<SingleOperatorResponse> => {
  try {
    const response = await api.post('/v1/operator', operatorData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menambah data operator baru.');
    }
    throw new Error('Gagal menambah data operator baru.');
  }
};

export const updateOperator = async (id: number, operatorData: OperatorUpdatePayload): Promise<SingleOperatorResponse> => {
  try {
    const response = await api.put(`/v1/operator/${id}`, operatorData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data operator.');
    }
    throw new Error('Gagal merubah data operator.');
  }
};

export const deleteOperatorById = async (id: number) => {
  try {
    await api.delete(`/v1/operator/${id}`);
    return { message: 'Operator deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data operator.');
    }
    throw new Error('Gagal menghapus data operator.');
  }
};