import { home3State } from "./home3";
import { home2State } from "./home2";
import { home1State } from "./home1";
import { homeState } from "./home";
import { coreState } from "../machine-states/core";
import { createMachine } from 'xstate';
import {
  EranSakalMachineContext,
  EranSakalMachineEvents,
  EranSakalMachineEventsTypes,
  EranSakalMachineId,  
} from '../types';

export const createEranSakalMachine = () => {
  return createMachine<EranSakalMachineContext, EranSakalMachineEvents>({
    id: EranSakalMachineId,
    preserveActionOrder: true,
    type: 'parallel',
     on: {
        [EranSakalMachineEventsTypes.ExternalInfoUpdated]: {
          actions: 'updateExternalInfo',        
        },
      },
    states: {
      core: coreState,
      home: homeState,

      allowed: {
        states: {
          home1: home1State,

          doSomething: {
            states: {
              home2: home2State,

              not: {
                states: {
                  exists: {
                    states: {
                      home3: home3State
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  });
};
