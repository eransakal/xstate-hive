import { EranSakalMachineContext } from "./context";

export enum EranSakalMachineEventsTypes {
  ExternalInfoUpdated = 'ExternalInfoUpdated'
}

// TODO add reference to example
// type invokeEvents = unknown;

export type EranSakalMachineEvents = 
  //  | invokeEvents
  | {
      type: EranSakalMachineEventsTypes.ExternalInfoUpdated;
      externalInfo: Partial<EranSakalMachineContext['externalInfo']>;
    }
    


