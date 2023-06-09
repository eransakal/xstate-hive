import { EranSakalMachineStateConfig } from '../../types';
import { bootUpState } from './boot-up-state';
import { operationalState } from './operational-state';


export const coreState: EranSakalMachineStateConfig = {
  initial: 'bootUp',
  states: {
    bootUp: bootUpState,
    operational: operationalState,
    nonOperational: {
      type: 'final', // This is a permanant (final) state. To support temporary disabled state that might be existed, use `operational.disabled` state instead.
    }
  },
};
