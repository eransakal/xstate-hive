import { actions } from 'xstate';
import {
  EranSakalMachineContext,
  EranSakalMachineEvents,
  EranSakalMachineEventsTypes,
} from '../../types';

/*
import { createUpdateExternalInfoMachineLogger } from '../../utils/logger';
import { XStateMachineLogSenderTypes } from '@kme/room-diagnostics-utils-diagnostics';

const logger = createUpdateExternalInfoMachineLogger(
  '',
  XStateMachineLogSenderTypes.
);
*/
export const updateExternalInfo = actions.assign(
  (context: EranSakalMachineContext, event: EranSakalMachineEvents) => {
    if (event.type !== EranSakalMachineEventsTypes.ExternalInfoUpdated) {
      return context;
    }

    return {
      ...context,
      externalInfo: {
        ...context.externalInfo,
        ...event.externalInfo,
      },
    };
  }
);
