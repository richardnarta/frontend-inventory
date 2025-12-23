import { type BaseListResponse } from "./common";

// Quantity units enum matching backend
export type QuantityUnit = "buah" | "lusin" | "kodi" | "dus" | "bal";

export interface InventoryData {
  kode_barang: string;  // Primary key - item code
  nama_barang: string;  // Item name
  quantity: number;     // Current stock quantity
  quantity_unit: QuantityUnit;  // Unit type
  harga_modal: number;  // Cost price
  harga_jual_eceran: number;  // Retail price
  harga_jual_grosir: number;  // Wholesale price
}

export interface InventoryListResponse extends BaseListResponse {
  items: InventoryData[];
}

export interface InventoryCreateRequest {
  kode_barang: string;
  nama_barang: string;
  quantity: number;
  quantity_unit: QuantityUnit;
  harga_modal: number;
  harga_jual_eceran: number;
  harga_jual_grosir: number;
}

export interface InventoryUpdateRequest {
  kode_barang?: string;
  nama_barang?: string;
  quantity?: number;
  quantity_unit?: QuantityUnit;
  harga_modal?: number;
  harga_jual_eceran?: number;
  harga_jual_grosir?: number;
}