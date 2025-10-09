import { type BaseListResponse, type BaseSingleResponse } from "./common";
import { type InventoryData } from "./inventory";

export interface DyeingProcessData {
  id: number;
  start_date: string; // ISO datetime
  end_date: string | null; // ISO datetime
  dyeing_weight: number;
  dyeing_roll_count: number | null;
  dyeing_final_weight: number | null;
  dyeing_overhead_cost: number | null;
  dyeing_status: boolean;
  dyeing_note: string | null;
  product: InventoryData;
}

export interface DyeingProcessListResponse extends BaseListResponse {
  items: DyeingProcessData[];
}

export interface SingleDyeingProcessResponse extends BaseSingleResponse {
  data: DyeingProcessData;
}

export type DyeingProcessCreatePayload = {
  product_id: string;
  dyeing_weight: number;
  dyeing_note?: string | null;
  dyeing_roll_count: number;
};

export type DyeingProcessUpdatePayload = {
  end_date?: string | null; // ISO datetime
  dyeing_final_weight?: number | null;
  dyeing_overhead_cost?: number | null;
  dyeing_status?: boolean | null;
  dyeing_note?: string | null;
  dyeing_roll_count?: number | null;
};