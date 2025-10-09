// model/operator.ts
import { type BaseListResponse, type BaseSingleResponse } from "./common";

export interface OperatorData {
  id: number;
  name: string;
  phone_num: string | null;
}

export interface OperatorListResponse extends BaseListResponse {
  items: OperatorData[];
}

export interface SingleOperatorResponse extends BaseSingleResponse {
    data: OperatorData;
}

export type OperatorCreatePayload = {
  name: string;
  phone_num?: string | null;
};

export type OperatorUpdatePayload = Partial<OperatorCreatePayload>;