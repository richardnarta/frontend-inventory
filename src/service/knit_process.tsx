import { api } from "@/lib/utils";
import axios from "axios";
import type {
  KnittingProcessListResponse,
  SingleKnittingProcessResponse,
  KnittingProcessCreatePayload,
  KnittingProcessUpdatePayload,
} from "@/model/knit_process";

export type KnittingProcessFilters = {
  knit_formula_id?: number | null;
  start_date?: string | null; // "YYYY-MM-DD"
  end_date?: string | null;   // "YYYY-MM-DD"
};

export const getKnitProcesses = async (
  filters: KnittingProcessFilters,
  page: number = 1,
  limit: number = 10
): Promise<KnittingProcessListResponse> => {
  const params = { page, limit, ...filters };
  const response = await api.get('/v1/knitting-process', { params });
  return response.data;
};

export const createKnitProcess = async (
  processData: KnittingProcessCreatePayload
): Promise<SingleKnittingProcessResponse> => {
  try {
    const response = await api.post('/v1/knitting-process', processData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal mencatat proses rajut baru.');
    }
    throw new Error('Gagal mencatat proses rajut baru.');
  }
};

export const updateKnitProcess = async (
  id: number,
  processData: KnittingProcessUpdatePayload
): Promise<SingleKnittingProcessResponse> => {
  try {
    const response = await api.put(`/v1/knitting-process/${id}`, processData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data proses rajut.');
    }
    throw new Error('Gagal merubah data proses rajut.');
  }
};

export const deleteKnitProcessById = async (id: number) => {
  try {
    await api.delete(`/v1/knitting-process/${id}`);
    return { message: 'Knitting process log deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data proses rajut.');
    }
    throw new Error('Gagal menghapus data proses rajut.');
  }
};