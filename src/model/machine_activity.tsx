import { type BaseListResponse, type BaseSingleResponse } from "./common";
import type { InventoryData } from "./inventory";


export interface MachineActivityData {
  id: number;
  machine_id: number;
  inventory: InventoryData;
  date: string; // "YYYY-MM-DD"
  lot: string;
  operator: string;
  damaged_thread: number | null;
  product_weight: number | null;
  note: string | null;
}

export interface MachineActivityListResponse extends BaseListResponse {
  items: MachineActivityData[];
}

export interface SingleMachineActivityResponse extends BaseSingleResponse {
    data: MachineActivityData;
}

export type MachineActivityCreatePayload = {
  machine_id: number;
  inventory_id: string;
  date: string; // "YYYY-MM-DD"
  lot: string;
  operator: string;
  damaged_thread?: number | null;
  product_weight?: number | null;
  note?: string | null;
};

export type MachineActivityUpdatePayload = Partial<MachineActivityCreatePayload>;
