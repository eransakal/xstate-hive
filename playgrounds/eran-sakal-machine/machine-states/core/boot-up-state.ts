import { EranSakalMachineStateConfig } from '../../types';
export const bootUpState: EranSakalMachineStateConfig = {
  type: 'parallel',
  onDone: {      
      target: 'operational',
  },  
  always: {
    target: 'operational',
  },
  states: {    
    /*
    // Example of a parallel state that loads multiple resources in parallel.
    // If used, remove the always target above.
    loadXXX: {
      initial: 'loading',
      states: {        
        loading: {
          invoke: {
            src: 'getEranSakal',
            onDone: {
              actions: ['setEranSakal'],
              target: 'loaded',
            },
            onError: {
              target: 'error',
            },
          },          
        },
        loaded: {
          type: 'final',
        },
        error: {
        },
      },
    },
    */
  }  
};

