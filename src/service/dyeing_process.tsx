import { api } from "@/lib/utils";
import axios from "axios";
import type {
  DyeingProcessListResponse,
  SingleDyeingProcessResponse,
  DyeingProcessCreatePayload,
  DyeingProcessUpdatePayload,
} from "@/model/dyeing_process";

export type DyeingProcessFilters = {
  start_date?: string | null; // "YYYY-MM-DD"
  end_date?: string | null;   // "YYYY-MM-DD"
  dyeing_status?: boolean | null;
};

export const getDyeingProcesses = async (
  filters: DyeingProcessFilters,
  page: number = 1,
  limit: number = 10
): Promise<DyeingProcessListResponse> => {
  const params = { page, limit, ...filters };
  const response = await api.get('/v1/dyeing-process', { params });
  return response.data;
};

export const createDyeingProcess = async (
  processData: DyeingProcessCreatePayload
): Promise<SingleDyeingProcessResponse> => {
  try {
    const response = await api.post('/v1/dyeing-process', processData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal mencatat proses celup baru.');
    }
    throw new Error('Gagal mencatat proses celup baru.');
  }
};

export const updateDyeingProcess = async (
  id: number,
  processData: DyeingProcessUpdatePayload
): Promise<SingleDyeingProcessResponse> => {
  try {
    const response = await api.put(`/v1/dyeing-process/${id}`, processData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data proses celup.');
    }
    throw new Error('Gagal merubah data proses celup.');
  }
};

export const deleteDyeingProcessById = async (id: number) => {
  try {
    await api.delete(`/v1/dyeing-process/${id}`);
    return { message: 'Dyeing process log deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data proses celup.');
    }
    throw new Error('Gagal menghapus data proses celup.');
  }
};