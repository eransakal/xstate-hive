import React, { useContext, useEffect, useRef } from 'react';
import { EranSakalContext } from './eranSakal-context';
import { EranSakalMachineEvents, EranSakalMachineState } from '../types';
import { useSelector } from '@xstate/react';

import { createEranSakalMachineLogger } from './logger';
import { XStateMachineLogSenderTypes } from '@kme/room-diagnostics-utils-diagnostics';

const logger = createEranSakalMachineLogger(
  'Util',
  XStateMachineLogSenderTypes.MachineCalculatedValueEmitter
);


export interface Props<TValue> {  
  selector: (state: EranSakalMachineState) => TValue;
  event: EranSakalMachineEvents  
}

export function MachineCalculatedValueEmitter<T>(props: Props<T>) {
  const { eranSakalMachineService } = useContext(EranSakalContext);

  const eventRef = useRef(props.event);
  eventRef.current = props.event;
  
  const value = useSelector(eranSakalMachineService, props.selector);
  useEffect(() => {
    if (eventRef.current) {
    logger.log(`emitting calculated value changed event '${eventRef.current?.type}'`);
        eranSakalMachineService.send(eventRef.current)
    }
  }, [value, eranSakalMachineService]);

  return null;
}
