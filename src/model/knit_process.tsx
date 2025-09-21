import { type BaseListResponse, type BaseSingleResponse } from "./common";
import { type KnitFormulaData, type FormulaItem } from "./knit_formula";


export interface KnittingProcessData {
  id: number;
  date: string; // "YYYY-MM-DD"
  weight_kg: number;
  materials: FormulaItem[];
  knit_formula: KnitFormulaData;
}

export interface KnittingProcessListResponse extends BaseListResponse {
  items: KnittingProcessData[];
}

export interface SingleKnittingProcessResponse extends BaseSingleResponse {
    data: KnittingProcessData;
}

export type KnittingProcessCreatePayload = {
  knit_formula_id: number;
  date: string; // "YYYY-MM-DD"
  weight_kg: number;
};

export type KnittingProcessUpdatePayload = Partial<Omit<KnittingProcessCreatePayload, 'knit_formula_id'>>;
