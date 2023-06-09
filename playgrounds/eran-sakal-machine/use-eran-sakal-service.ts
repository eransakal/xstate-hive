import { useContext, useMemo } from 'react';
import { EranSakalContext } from './utils/eran-sakal-context';

export const useEranSakalService = () => {
  const { eranSakalMachineService } = useContext(EranSakalContext);

  const actions = useMemo(() => {
    return {};
  }, [eranSakalMachineService]);

  return {    
    actions,
  };
};
