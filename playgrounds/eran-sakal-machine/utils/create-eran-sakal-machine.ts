import { roomState } from "../machine-states/room";
import {coreState} from '../machine-states/core'
import {createMachine} from 'xstate'
import {
  EranSakalMachineContext,
  EranSakalMachineEvents,
  EranSakalMachineEventsTypes,
  EranSakalMachineId,
} from '../types'

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

      allowed: {
        states: {

          doSomething: {
            states: {

              not: {
                states: {
                  exists: {
                    states: {},
                  },
                },
              },
            },
          },
        },
      },

      room: roomState
    },
  });
}
