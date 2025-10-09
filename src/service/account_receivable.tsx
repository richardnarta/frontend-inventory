// service/account_receivable.ts
import { api } from "@/lib/utils";
import axios from "axios";
import type { 
    AccountReceivableListResponse, 
    AccountReceivableCreatePayload,
    AccountReceivableUpdatePayload,
    SingleAccountReceivableResponse
} from "@/model/account_receivable";

export const getAccountReceivables = async (
    filters: { buyer_id?: number; period?: string },
    page: number = 1,
    limit: number = 10
): Promise<AccountReceivableListResponse> => {
    const params = {
        page,
        limit,
        ...filters
    };

    const response = await api.get('/v1/account-receivable', { params });
    return response.data;
};

export const createAccountReceivable = async (receivableData: AccountReceivableCreatePayload): Promise<SingleAccountReceivableResponse> => {
    try {
        const response = await api.post('/v1/account-receivable', receivableData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Gagal menambah data piutang baru.');
        }
        throw new Error('Gagal menambah data piutang baru.');
    }
};

export const updateAccountReceivable = async (id: number, receivableData: AccountReceivableUpdatePayload): Promise<SingleAccountReceivableResponse> => {
    try {
        const response = await api.put(`/v1/account-receivable/${id}`, receivableData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Gagal merubah data piutang.');
        }
        throw new Error('Gagal merubah data piutang.');
    }
};

export const deleteAccountReceivableById = async (id: number) => {
    try {
        await api.delete(`/v1/account-receivable/${id}`);
        return { message: 'Account receivable deleted successfully' };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Gagal menghapus data piutang.');
        }
        throw new Error('Gagal menghapus data piutang.');
    }
};