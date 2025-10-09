// model/supplier.ts
import { type BaseListResponse, type BaseSingleResponse } from "./common";

export interface SupplierData {
  id: number;
  name: string;
  phone_num: string | null;
  address: string | null;
  note: string | null;
}

export interface SupplierListResponse extends BaseListResponse {
  items: SupplierData[];
}

export interface SingleSupplierResponse extends BaseSingleResponse {
    data: SupplierData;
}

export type SupplierCreatePayload = {
  name: string;
  phone_num?: string | null;
  address?: string | null;
  note?: string | null;
};

export type SupplierUpdatePayload = Partial<SupplierCreatePayload>;