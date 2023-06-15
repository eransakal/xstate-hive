
export enum StateBlockTypes {
    AlwaysOn = 'always-on',
    TemporaryOnOff = 'temporary-on-off',
    PermanentOnOff = 'permanent-on-off',
}
export const isStateBlockType = (value: string): value is StateBlockTypes => {
  return Object.values(StateBlockTypes).includes(value as StateBlockTypes)
}

