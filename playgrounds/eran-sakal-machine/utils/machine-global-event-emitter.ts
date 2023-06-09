import { useContext, useEffect, useRef } from 'react';
import { EranSakalContext } from './eranSakal-context';
import { EranSakalMachineState } from '../types';
import { GlobalEvent } from '../../../shared/pubsub/global-event';
import { useSelector } from '@xstate/react';

import { createEranSakalMachineLogger } from './logger';
import { XStateMachineLogSenderTypes } from '@kme/room-diagnostics-utils-diagnostics';

const logger = createEranSakalMachineLogger(
  'MachineGlobalEventEmitter',
  XStateMachineLogSenderTypes.Util
);

export interface Props<TValue> {
  name: string;
  selector: (state: EranSakalMachineState) => TValue;
  event: GlobalEvent<TValue>;
  emitWithContext?: string;
}

export function MachineGlobalEventEmitter<T>(props: Props<T>) {
  
  const { eranSakalMachineService } = useContext(EranSakalContext);

  const eventRef = useRef(props.event);
  eventRef.current = props.event;
  
  const value = useSelector(eranSakalMachineService, props.selector);
  useEffect(() => {
    logger.log(`emitting global event update for '${props.name}'`);    
    if (props.emitWithContext) {
      props.event.emitByContext(props.emitWithContext, value);
    } else {
      props.event.emit(value);
    }
  }, [value, eranSakalMachineService, props.name, props.emitWithContext, props.event]);

  useEffect(() => {
    return () => {
      props.event.resetLastValue();
    }
  }, [props.event]);

  return null;
}
