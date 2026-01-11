import { type BaseListResponse } from "./common";
import { type SupplierData } from "./supplier";
import { type InventoryData, type QuantityUnit } from "./inventory";

export interface PurchaseTransactionData {
  id: number;
  transaction_date: string;
  supplier_id: number | null;
  inventory_id: string;  // References kode_barang
  quantity: number;
  quantity_unit: QuantityUnit;
  price_per_unit: number;
  total_price: number;
  supplier?: SupplierData;
  inventory?: InventoryData;
}

export interface PurchaseTransactionListResponse extends BaseListResponse {
  items: PurchaseTransactionData[];
}

export interface PurchaseTransactionCreateRequest {
  supplier_id?: number | null;
  inventory_id: string;
  transaction_date: string;
  quantity: number;
  // quantity_unit removed - auto-filled from inventory
  price_per_unit: number;
  total_price?: number;  // Auto-calculated if not provided
}

export interface PurchaseTransactionUpdateRequest {
  supplier_id?: number | null;
  inventory_id?: string;
  quantity?: number;
  // quantity_unit removed - auto-filled from inventory
  price_per_unit?: number;
  total_price?: number;
}