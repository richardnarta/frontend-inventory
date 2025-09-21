import { type BaseListResponse, type BaseSingleResponse } from "./common";
import { type InventoryData } from "./inventory";


export interface FormulaItem {
  inventory_id: string;
  inventory_name: string;
  amount_kg: number;
}

export interface KnitFormulaData {
  id: number;
  product: InventoryData;
  formula: FormulaItem[];
  production_weight: number;
}

export interface KnitFormulaListResponse extends BaseListResponse {
  items: KnitFormulaData[];
}

export interface SingleKnitFormulaResponse extends BaseSingleResponse {
  data: KnitFormulaData;
}

type KnitFormulaCreateBase = {
    formula: FormulaItem[];
    production_weight: number;
};

type CreateWithNewProduct = KnitFormulaCreateBase & {
    new_product: true;
    product_name: string;
    product_id?: null;
};

type CreateWithExistingProduct = KnitFormulaCreateBase & {
    new_product: false;
    product_id: string;
    product_name?: null;
};

export type KnitFormulaCreatePayload = CreateWithNewProduct | CreateWithExistingProduct;

export type KnitFormulaUpdatePayload = {
  formula: FormulaItem[];
  production_weight?: number;
};
