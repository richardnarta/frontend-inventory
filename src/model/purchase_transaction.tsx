import { type BaseListResponse, type BaseSingleResponse } from "./common";
import { type SupplierData } from "./supplier";
import { type InventoryData } from "./inventory";


export interface PurchaseTransactionData {
  id: number;
  transaction_date: string; // ISO date-time string
  supplier: SupplierData | null;
  inventory: InventoryData | null;
  roll_count: number;
  weight_kg: number;
  price_per_kg: number;
  dye_overhead_cost: number | null;
  dye_final_weight: number | null;
  dye_price_per_kg: number | null;
  dye_status: boolean;
  total: number;
}

export interface PurchaseTransactionListResponse extends BaseListResponse {
  items: PurchaseTransactionData[];
}

export interface SinglePurchaseTransactionResponse extends BaseSingleResponse {
    data: PurchaseTransactionData;
}

export type PurchaseTransactionCreatePayload = {
  supplier_id: number;
  inventory_id: string;
  transaction_date: string; // "YYYY-MM-DD"
  roll_count?: number;
  weight_kg?: number;
  price_per_kg?: number;
};

export type PurchaseTransactionUpdatePayload = Partial<Omit<PurchaseTransactionCreatePayload, 'supplier_id' | 'inventory_id'>> & {
    dye_overhead_cost?: number;
    dye_final_weight?: number;
    dye_price_per_kg?: number;
    dye_status?: boolean;
};
