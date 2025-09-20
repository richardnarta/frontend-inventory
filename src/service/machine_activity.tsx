import { api } from "@/lib/utils";
import axios from "axios";
import type {
  MachineActivityListResponse,
  SingleMachineActivityResponse,
  MachineActivityCreatePayload,
  MachineActivityUpdatePayload,
} from "@/model/machine_activity";


export type MachineActivityFilters = {
    date?: string | null;         // "YYYY-MM-DD"
    machine_id?: number | null;
    inventory_id?: string | null;
};

export const getMachineActivities = async (
  filters: MachineActivityFilters,
  page: number = 1,
  limit: number = 10
): Promise<MachineActivityListResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };

  const response = await api.get('/v1/machine-activity', { params });
  return response.data;
};

export const createMachineActivity = async (activityData: MachineActivityCreatePayload): Promise<SingleMachineActivityResponse> => {
  try {
    const response = await api.post('/v1/machine-activity', activityData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menambah data aktivitas mesin baru.');
    }
    throw new Error('Gagal menambah data aktivitas mesin baru.');
  }
};

export const updateMachineActivity = async (id: number, activityData: MachineActivityUpdatePayload): Promise<SingleMachineActivityResponse> => {
  try {
    const response = await api.put(`/v1/machine-activity/${id}`, activityData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data aktivitas mesin.');
    }
    throw new Error('Gagal merubah data aktivitas mesin.');
  }
};

export const deleteMachineActivityById = async (id: number) => {
  try {
    await api.delete(`/v1/machine-activity/${id}`);
    return { message: 'Machine activity deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data aktivitas mesin.');
    }
    throw new Error('Gagal menghapus data aktivitas mesin.');
  }
};
