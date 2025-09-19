import { type BuyerData } from "./buyer";
import { type BaseListResponse } from "./common";


export interface AccountReceivableData {
  id: number;
  buyer: BuyerData | null;
  period: string;
  age_0_30_days: number;
  age_31_60_days: number;
  age_61_90_days: number;
  age_over_90_days: number;
  total: number;
}

export interface AccountReceivableListResponse extends BaseListResponse {
  items: AccountReceivableData[];
}

export type AccountReceivableCreatePayload = {
  buyer_id: number;
  period: string;
  age_0_30_days?: number;
  age_31_60_days?: number;
  age_61_90_days?: number;
  age_over_90_days?: number;
};

export type AccountReceivableUpdatePayload = Partial<AccountReceivableCreatePayload>;