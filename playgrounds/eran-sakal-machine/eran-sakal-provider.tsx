import React, { useState, useMemo, PropsWithChildren } from 'react';
import { EranSakalMachineContext, EranSakalMachineEvents, EransakalMachineId } from './types';
import { createEranSakalMachine } from './utils/create-eran-sakal-machine';
import { useMachine } from '@xstate/react';
import { EranSakalContext } from './utils/eran-sakal-context';
import { updateExternalInfo } from './machine-actions/context/update-external-info';
import { onExternalInfoChanged } from './machine-services/on-external-info-changed';

import { createEranSakalMachineLogger } from './utils/logger';
import { XStateMachineLogSenderTypes, useXStateDiagnostics } from '@kme/room-diagnostics-utils-diagnostics';

const logger = createEranSakalMachineLogger(
  'eranSakalProvider',
  XStateMachineLogSenderTypes.Machine
);

export const EranSakalProvider: React.FC = ({ children }) => {
  const [machine] = useState(() => createEranSakalMachine());

  const [, , eranSakalMachineService] = useMachine<EranSakalMachineContext, EranSakalMachineEvents>(machine, {
    actions: {
      updateExternalInfo 
    },
    services: {
      onExternalInfoChanged
     },
    guards: { },
  });

  useXStateDiagnostics({
    machineId: EransakalMachineId,
    machineLogger: logger,
    service: eranSakalMachineService
  });

  const providerValue = useMemo(() => {
    return { eranSakalMachineService };
  }, [eranSakalMachineService]);

  return (
    <EranSakalContext.Provider value={providerValue}>
      {children}
    </EranSakalContext.Provider>
  );
};
