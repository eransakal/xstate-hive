import { InterpreterFrom, Sender, State, StateMachine } from 'xstate';  
import { StateNodeConfig } from 'xstate/lib/types';  
import { EranSakalMachineContext } from './context';
import { EranSakalMachineEvents } from './events';

export * from './events';
export * from './context';

export const EranSakalMachineId = 'eranSakal';

// Notice: Those types are always the same, don't manually modify the declarations.
export type EranSakalMachine = StateMachine<
  EranSakalMachineContext,
  any,
  EranSakalMachineEvents,
  any
>;
export type EranSakalMachineService = InterpreterFrom<EranSakalMachine>;
export type EranSakalMachineSender = Sender<EranSakalMachineEvents>;
export type EranSakalMachineState = State<
  EranSakalMachineContext,
  EranSakalMachineEvents
>;
export type EranSakalMachineStateConfig = StateNodeConfig<
  EranSakalMachineContext,
  any,
  EranSakalMachineEvents,
  any
>;
