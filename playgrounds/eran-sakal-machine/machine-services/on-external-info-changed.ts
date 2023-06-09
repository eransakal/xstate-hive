import {
  EranSakalMachineContext,
  EranSakalMachineSender,
} from '../types';

import { createEranSakalMachineLogger } from '../utils/logger';
import { XStateMachineLogSenderTypes } from '@kme/room-diagnostics-utils-diagnostics';

const logger = createEranSakalMachineLogger(
  'onExternalInfoChanged',
  XStateMachineLogSenderTypes.MachineService
);

// TODO add link to reference
export const onExternalInfoChanged =
  (context: EranSakalMachineContext, data: any) => (send: EranSakalMachineSender) => {

    // const handleExampleChanged = (exampleData: ExampleData | null) => {
    //   if (ownUser) {
    //     send({
    //       type: EranSakalMachineEventsTypes.ExternalInfoUpdated,
    //       externalInfo: {
    //         something: exampleData.something
    //       },
    //     });
    //   }
    // };

    // onExampleChanged.on(
    //   handleExampleChanged,
    //   data.emitLastValue ?? false      
    // );
    
    return () => {
      // onExampleChanged.off(handleExampleChanged);
    };
  };
