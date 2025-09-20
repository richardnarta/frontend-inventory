import { api } from "@/lib/utils";
import axios from "axios";
import type {
  MachineListResponse,
  SingleMachineResponse,
  MachineCreatePayload,
  MachineUpdatePayload,
} from "@/model/machine";

export const getMachines = async (
  filters: { name?: string },
  page: number = 1,
  limit: number = 10
): Promise<MachineListResponse> => {
  const params = {
    page,
    limit,
    ...filters,
  };

  const response = await api.get('/v1/machine', { params });
  return response.data;
};

export const createMachine = async (machineData: MachineCreatePayload): Promise<SingleMachineResponse> => {
  try {
    const response = await api.post('/v1/machine', machineData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menambah data mesin baru.');
    }
    throw new Error('Gagal menambah data mesin baru.');
  }
};

export const updateMachine = async (id: number, machineData: MachineUpdatePayload): Promise<SingleMachineResponse> => {
  try {
    const response = await api.put(`/v1/machine/${id}`, machineData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal merubah data mesin.');
    }
    throw new Error('Gagal merubah data mesin.');
  }
};

export const deleteMachineById = async (id: number) => {
  try {
    await api.delete(`/v1/machine/${id}`);
    return { message: 'Machine deleted successfully' };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Gagal menghapus data mesin.');
    }
    throw new Error('Gagal menghapus data mesin.');
  }
};
