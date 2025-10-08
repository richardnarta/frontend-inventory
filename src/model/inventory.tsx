import { type BaseListResponse } from "./common";


export interface InventoryData {
  id: string;
  name: string;
  type: string;
  roll_count: number;
  weight_kg: number;
  bale_count: number;
}

export interface InventoryListResponse extends BaseListResponse {
  items: InventoryData[];
}