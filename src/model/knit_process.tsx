import { type BaseListResponse, type BaseSingleResponse } from "./common";
import { type KnitFormulaData } from "./knit_formula";
import { type OperatorData } from "./operator";
import { type MachineData } from "./machine";

export interface KnittingProcessData {
  id: number;
  start_date: string; // ISO datetime
  end_date: string | null; // ISO datetime
  knit_status: boolean;
  weight_kg: number;
  roll_count: number | null;
  materials: {
    inventory_id: string;
    inventory_name: string;
    amount_kg: number;
  }[];
  knit_formula: KnitFormulaData;
  operator: OperatorData;
  machine: MachineData;
}

export interface KnittingProcessListResponse extends BaseListResponse {
  items: KnittingProcessData[];
}

export interface SingleKnittingProcessResponse extends BaseSingleResponse {
  data: KnittingProcessData;
}

export type KnittingProcessCreatePayload = {
  knit_formula_id: number;
  operator_id: number;
  machine_id: number;
  weight_kg: number;
};

export type KnittingProcessUpdatePayload = {
  end_date?: string | null; // ISO datetime
  knit_status?: boolean | null;
  operator_id?: number | null;
  machine_id?: number | null;
  roll_count: number;
};