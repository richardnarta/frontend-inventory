import { type BaseListResponse, type BaseSingleResponse } from "./common";
import { type BuyerData } from "./buyer";
import { type InventoryData } from "./inventory";

export interface SalesTransactionData {
  id: number;
  transaction_date: string; // ISO date-time string
  buyer: BuyerData | null;
  inventory: InventoryData | null;
  roll_count: number;
  weight_kg: number;
  price_per_kg: number;
  total: number;
}

export interface SalesTransactionListResponse extends BaseListResponse {
  items: SalesTransactionData[];
}

export interface SingleSalesTransactionResponse extends BaseSingleResponse {
    data: SalesTransactionData;
}

export type SalesTransactionCreatePayload = {
  buyer_id: number;
  inventory_id: string;
  price_per_kg: number;
  roll_count?: number;
  weight_kg?: number;
};

export type SalesTransactionUpdatePayload = Partial<SalesTransactionCreatePayload>;