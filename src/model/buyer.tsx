import { type BaseListResponse } from "./common";


export interface BuyerData {
  id: number;
  name: string;
  phone_num: string | null;
}

export interface BuyerListResponse extends BaseListResponse {
  items: BuyerData[];
}

export type BuyerCreatePayload = {
  name: string;
  phone_num?: string | null;
};

export type BuyerUpdatePayload = Partial<BuyerCreatePayload>;