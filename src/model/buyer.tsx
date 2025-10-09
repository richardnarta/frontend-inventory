import { type BaseListResponse } from "./common";

export interface BuyerData {
  id: number;
  name: string;
  phone_num: string | null;
  address: string | null;
  note: string | null;
  is_risked: boolean;
}

export interface BuyerListResponse extends BaseListResponse {
  items: BuyerData[];
}

export type BuyerCreatePayload = {
  name: string;
  phone_num?: string | null;
  address?: string | null;
  note?: string | null;
};

export type BuyerUpdatePayload = Partial<BuyerCreatePayload>;