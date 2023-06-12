
export enum StateTypes {
    AllowedNotAllowed = 'allowed-not-allowed',
    AllowedNotAllowedWithLoading = 'allowed-not-allowed-with-loading',
    Operational = 'operational',
    OperationalNotOperational = 'operational-non-operational',
    OperationalNotOperationalWithLoading = 'operational-non-operational-with-loading',
}
export const isStatesType = (value: string): value is StateTypes => {
  return Object.values(StateTypes).includes(value as StateTypes)
}

