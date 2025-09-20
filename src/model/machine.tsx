import { type BaseListResponse, type BaseSingleResponse } from "./common";


export interface MachineData {
  id: number;
  name: string;
}

export interface MachineListResponse extends BaseListResponse {
  items: MachineData[];
}

export interface SingleMachineResponse extends BaseSingleResponse {
    data: MachineData;
}

export type MachineCreatePayload = {
  name: string;
};

export type MachineUpdatePayload = Partial<MachineCreatePayload>;
