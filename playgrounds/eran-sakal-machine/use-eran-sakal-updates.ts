import { useContext } from 'react';
import { useSelector } from '@xstate/react';
import { EranSakalMachineState } from './types';
import { EranSakalContext } from './utils/eran-sakal-context';

// Notice: This file was auto-generated, don't manually modify its content.
type EranSakalSelectors<
  T extends
    | Record<string, (state: EranSakalMachineState) => any>
    | ((state: EranSakalMachineState) => any)
> = T extends Record<string, (state: EranSakalMachineState) => any>
  ? { [K in keyof T]: ReturnType<T[K]> }
  : T extends (state: EranSakalMachineState) => any
  ? ReturnType<T>
  : unknown;

export const useEranSakalUpdates = <
  T extends
    | Record<string, (state: EranSakalMachineState) => any>
    | ((state: EranSakalMachineState) => any)
>(
  selectors: T
): EranSakalSelectors<T> => {  
  const { eranSakalMachineService } = useContext(EranSakalContext);

  let selector: (state: EranSakalMachineState) => any = () => {};

  if (typeof selectors === 'function') {
    selector = selectors;
  } else if (typeof selectors === 'object') {
    selector = (state: EranSakalMachineState) => {
      const result: Partial<EranSakalSelectors<T>> = {};

      for (const key in selectors) {
        if (Object.prototype.hasOwnProperty.call(selectors, key)) {
          result[key] = (selectors[key] as any)(state);
        }
      }

      return result as EranSakalSelectors<T>;
    };
  }

  return useSelector(eranSakalMachineService, selector) as EranSakalSelectors<T>;
};
