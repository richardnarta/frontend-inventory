import { type BaseListResponse } from "./common";
import { type BuyerData } from "./buyer";
import { type InventoryData, type QuantityUnit } from "./inventory";

// Individual item in a sales transaction (for request)
export interface SalesTransactionItemRequest {
  inventory_id: string;
  quantity: number;
  price_per_unit: number;
}

// Individual item in a sales transaction (for response)
export interface SalesTransactionItemData {
  id: number;
  inventory_id: string;
  quantity: number;
  quantity_unit: QuantityUnit;
  price_per_unit: number;
  subtotal: number;
  item_code_snapshot?: string | null;
  item_name_snapshot?: string | null;
  inventory?: InventoryData;
}

// Main sales transaction data (header with items)
export interface SalesTransactionData {
  id: number;
  transaction_date: string;
  buyer_id: number | null;
  notes: string | null;
  total_amount: number;
  buyer?: BuyerData;
  items: SalesTransactionItemData[];
}

export interface SalesTransactionListResponse extends BaseListResponse {
  items: SalesTransactionData[];
}

// Create request with multiple items
export interface SalesTransactionCreateRequest {
  transaction_date: string;
  buyer_id?: number | null;
  notes?: string | null;
  items: SalesTransactionItemRequest[];
}

// Update request with multiple items
export interface SalesTransactionUpdateRequest {
  transaction_date?: string;
  buyer_id?: number | null;
  notes?: string | null;
  items?: SalesTransactionItemRequest[];
}