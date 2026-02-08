import { type BaseListResponse } from "./common";
import { type SupplierData } from "./supplier";
import { type InventoryData, type QuantityUnit } from "./inventory";

// Individual item in a purchase transaction (for request)
export interface PurchaseTransactionItemRequest {
  inventory_id: string;
  quantity: number;
  price_per_unit: number;
}

// Individual item in a purchase transaction (for response)
export interface PurchaseTransactionItemData {
  id: number;
  inventory_id: string;
  quantity: number;
  quantity_unit: QuantityUnit;
  price_per_unit: number;
  subtotal: number;
  inventory?: InventoryData;
}

// Main purchase transaction data (header with items)
export interface PurchaseTransactionData {
  id: number;
  transaction_date: string;
  supplier_id: number | null;
  notes: string | null;
  total_amount: number;
  supplier?: SupplierData;
  items: PurchaseTransactionItemData[];
}

export interface PurchaseTransactionListResponse extends BaseListResponse {
  items: PurchaseTransactionData[];
}

// Create request with multiple items
export interface PurchaseTransactionCreateRequest {
  transaction_date: string;
  supplier_id?: number | null;
  notes?: string | null;
  items: PurchaseTransactionItemRequest[];
}

// Update request with multiple items
export interface PurchaseTransactionUpdateRequest {
  transaction_date?: string;
  supplier_id?: number | null;
  notes?: string | null;
  items?: PurchaseTransactionItemRequest[];
}