import {Configuration, MachineConfig} from '../../configuration.js'
import {join} from 'path'
import {formatStateName, toDashCase} from '../../utils.js'
import {extractStatesOfMachine, MachineState} from '../../utils/extract-states-of-machine.js'
import inquirer from 'inquirer'
import {CLIError} from '@oclif/core/lib/errors/index.js'
import {getActiveCommand} from '../../active-command.js'
import {executePlopJSCommand} from '../../utils/execute-plopljs-command.js'

// TODO move to shared place
const getMachineStates = async (machineName: string, statePath?: string): Promise<MachineState[]> => {
  let resolvedStateFilePath = statePath
  if (!resolvedStateFilePath) {
    resolvedStateFilePath =  `utils/create-${toDashCase(machineName)}-machine.ts`
  }

  resolvedStateFilePath = join(Configuration.get().getMachine(machineName).getAbsolutePath(), resolvedStateFilePath)

  return extractStatesOfMachine(resolvedStateFilePath)
}

async function getUserInputs({machineStates} : {prefilled: unknown, machineStates: MachineState[] }) {
  // TODO move to shared place
  const actionType = (await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message: 'Select the action to perform:',
      choices: [{
        name: 'Add a new state to the machine root',
        value: 'root',
        short: 'Add Root State',
      },
      {
        name: 'Add a new state to a child state',
        value: 'child',
        short: 'Add Child State',
      },
      {
        name: 'Change an existing state type',
        value: 'change',
        short: 'Change Existing State Type',
      }],
    },
  ])).value

  const selectedState = actionType === 'root' ?
    null :
    (await inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        message: actionType === 'child' ?
          'Select the parent state to add a new state to:' :
          'Select the state to change:',
        choices: machineStates.map(state => state.id),
      },
    ])).value

  const isNewStateNameRequired =  actionType !== 'change'

  if (actionType === 'change') {
    const selectedStateConfig = machineStates.find(state => state.id === selectedState)

    if (selectedStateConfig?.hasContent) {
      throw new CLIError('The selected state already has content. Support for changing existing state types with content will be added in the future. For now, you can remove the content manually and try again.')
    }
  }

  const newStateName = isNewStateNameRequired ? formatStateName((await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: 'Enter the name of the new state:',
    },
  ])).value) : ''

  return {
    actionType,
    selectedState,
    newStateName,
  }
}

export const optimisticActionBlockExecuter = async ({machineConfig} :  { machineConfig: MachineConfig}): Promise<void> => {
  const {error: commandError, debug, log} = getActiveCommand()

  const {machineName} = machineConfig

  let machineStates: MachineState[] = null!

  try {
    machineStates = await getMachineStates(machineName)
  } catch (error) {
    debug(error)
    commandError(`failed to extract the machine '${machineName}' states, please verify that there are no compile issues and try again.`, {exit: 1})
    return
  }

  const userInputs = await getUserInputs({
    prefilled: {},
    machineStates,
  })

  if (userInputs.actionType !== 'change' && userInputs.newStateName === '') {
    log('No state name was provided')
    return
  }

  switch (userInputs.actionType) {
  case 'root':
    executePlopJSCommand({
      commandPath: 'block/optimistic-action',
      destPath: join(machineConfig.getAbsolutePath(), 'machine-states'),
      options: {
        stateName: 'test-it-now-2',
        machineName: machineConfig.machineName,
        contextPropFullPath: 'lowerThird.isActive',
        notificationErrorMessage: 'room.bla',
      },
    })
    break
  case 'child':
  {
    // const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

    // if (!stateConfig) {
    //   throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
    // }

    // await injectStateBlock({
    //   newStateOptions: userInputs.newStateBlockOptions,
    //   selectedStateFilePath: stateConfig.filePath,
    //   selectedStateParentsInFile: stateConfig.innerFileParentStates,
    //   machineName: machineConfig.machineName,
    //   newStateName: userInputs.newStateName,
    //   newStateDirPath: `./${toDashCase(userInputs.newStateName)}-state`,
    // })
    break
  }

  case 'change':
  {
    // const stateConfig = machineStates.find(state => state.id === userInputs.selectedState)

    // if (!stateConfig) {
    //   throw new Error(`state '${userInputs.selectedState}' not found in '${machineConfig.machineName}'`)
    // }

    // await injectStateBlock({
    //   newStateOptions: userInputs.newStateBlockOptions,
    //   selectedStateFilePath: stateConfig.filePath,
    //   selectedStateParentsInFile: stateConfig.innerFileParentStates,
    //   machineName: machineConfig.machineName,
    //   newStateName: stateConfig.name,
    //   newStateDirPath: `./${toDashCase(stateConfig.name)}-state`,
    // })
    // break
  }
  }
}
