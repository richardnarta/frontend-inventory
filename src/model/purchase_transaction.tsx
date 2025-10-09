// model/purchase_transaction.ts
import { type BaseListResponse, type BaseSingleResponse } from "./common";
import { type SupplierData } from "./supplier";
import { type InventoryData } from "./inventory";

export interface PurchaseTransactionData {
  id: number;
  transaction_date: string; // ISO date-time string
  supplier: SupplierData | null;
  inventory: InventoryData | null;
  bale_count: number;
  roll_count: number;
  weight_kg: number;
  price_per_kg: number;
  total: number;
}

export interface PurchaseTransactionListResponse extends BaseListResponse {
  items: PurchaseTransactionData[];
}

export interface SinglePurchaseTransactionResponse extends BaseSingleResponse {
  data: PurchaseTransactionData;
}

export type PurchaseTransactionCreatePayload = {
  transaction_date: string;
  supplier_id: number;
  inventory_id: string;
  bale_count?: number;
  roll_count?: number;
  weight_kg?: number;
  price_per_kg: number;
};

export type PurchaseTransactionUpdatePayload = Partial<PurchaseTransactionCreatePayload>;