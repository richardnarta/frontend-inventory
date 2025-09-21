import { api } from "@/lib/utils";
import axios from "axios";
import type {
  KnitFormulaListResponse,
  SingleKnitFormulaResponse,
  KnitFormulaCreatePayload,
  KnitFormulaUpdatePayload,
} from "@/model/knit_formula";


export const getKnitFormulas = async (
  page: number = 1,
  limit: number = 10
): Promise<KnitFormulaListResponse> => {
  const params = { page, limit };
  const response = await api.get('/v1/knit-formula', { params });
  return response.data;
};

export const createKnitFormula = async (formulaData: KnitFormulaCreatePayload): Promise<SingleKnitFormulaResponse> => {
  try {
    const response = await api.post('/v1/knit-formula', formulaData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal membuat formula kain rajut baru.');
    }
    throw new Error('Gagal membuat formula kain rajut baru.');
  }
};

export const updateKnitFormula = async (id: number, formulaData: KnitFormulaUpdatePayload): Promise<SingleKnitFormulaResponse> => {
  try {
    const response = await api.put(`/v1/knit-formula/${id}`, formulaData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data formula kain rajut.');
    }
    throw new Error('Gagal merubah data formula kain rajut.');
  }
};

export const deleteKnitFormulaById = async (id: number) => {
  try {
    await api.delete(`/v1/knit-formula/${id}`);
    return { message: 'Knit formula deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data formula kain rajut.');
    }
    throw new Error('Gagal menghapus data formula kain rajut.');
  }
};
