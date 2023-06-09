import React from "react";
import { EranSakalMachineService } from "../types";


export const EranSakalContext = React.createContext<{
    eranSakalMachineService: EranSakalMachineService;
  }>(null as any);