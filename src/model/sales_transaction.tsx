import { type BaseListResponse } from "./common";
import { type BuyerData } from "./buyer";
import { type InventoryData, type QuantityUnit } from "./inventory";

export interface SalesTransactionData {
  id: number;
  transaction_date: string;
  buyer_id: number | null;
  inventory_id: string;  // References kode_barang
  quantity: number;
  quantity_unit: QuantityUnit;
  price_per_unit: number;
  total_price: number;
  buyer?: BuyerData;
  inventory?: InventoryData;
}

export interface SalesTransactionListResponse extends BaseListResponse {
  items: SalesTransactionData[];
}

export interface SalesTransactionCreateRequest {
  buyer_id?: number | null;
  inventory_id: string;
  transaction_date: string;
  quantity: number;
  quantity_unit: QuantityUnit;
  price_per_unit: number;
  total_price?: number;  // Auto-calculated if not provided
}

export interface SalesTransactionUpdateRequest {
  buyer_id?: number | null;
  inventory_id?: string;
  quantity?: number;
  quantity_unit?: QuantityUnit;
  price_per_unit?: number;
  total_price?: number;
}