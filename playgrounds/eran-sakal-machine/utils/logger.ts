import { EranSakalMachineId } from '../types';
import {
  XStateMachineLogger,
  XStateMachineLogLevels,
  XStateMachineLogSenderTypes,
} from '@kme/room-diagnostics-utils-diagnostics';

export const createEranSakalMachineLogger = (
  sender: string,
  senderType: XStateMachineLogSenderTypes
) =>
  new XStateMachineLogger({
    machineId: EranSakalMachineId,
    sender,
    senderType,
  });
