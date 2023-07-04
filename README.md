# XState Hive (Code generator)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/xstate-hive)](https://npmjs.org/package/xstate-hive)
[![Downloads/week](https://img.shields.io/npm/dw/xstate-hive)](https://npmjs.org/package/xstate-hive)
[![License](https://img.shields.io/npm/l/xstate-hive)](https://github.com/eransakl/xstate-hive/blob/main/package.json)

<!-- toc -->
* [XState Hive (Code generator)](#xstate-hive-code-generator)
* [About](#about)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# About
> This library is still in preliminiary phase.

# Usage

<!-- usage -->
```sh-session
$ npm install -g xstate-hive
$ xstate-hive COMMAND
running command...
$ xstate-hive (--version)
xstate-hive/2.0.0 darwin-arm64 node-v16.15.1
$ xstate-hive --help [COMMAND]
USAGE
  $ xstate-hive COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`xstate-hive block [MACHINENAME] [TARGETSTATEPATH]`](#xstate-hive-block-machinename-targetstatepath)
* [`xstate-hive help [COMMANDS]`](#xstate-hive-help-commands)
* [`xstate-hive info`](#xstate-hive-info)
* [`xstate-hive init`](#xstate-hive-init)
* [`xstate-hive machine [MACHINENAME] [MACHINEPATH]`](#xstate-hive-machine-machinename-machinepath)

## `xstate-hive block [MACHINENAME] [TARGETSTATEPATH]`

Inject a block of funcionality into the machine

```
USAGE
  $ xstate-hive block [MACHINENAME] [TARGETSTATEPATH]

ARGUMENTS
  MACHINENAME      A machine name
  TARGETSTATEPATH  The path to the machine state to inject into (e.g. "core", "core.operational")

DESCRIPTION
  Inject a block of funcionality into the machine

EXAMPLES
  $ xstate-hive block inject [machine-name]
```

_See code: [dist/commands/block/index.ts](https://github.com/eransakal/xstate-hive/blob/v2.0.0/dist/commands/block/index.ts)_

## `xstate-hive help [COMMANDS]`

Display help for xstate-hive.

```
USAGE
  $ xstate-hive help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for xstate-hive.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

## `xstate-hive info`

```
USAGE
  $ xstate-hive info

EXAMPLES
  $ xstate-hive info
```

_See code: [dist/commands/info/index.ts](https://github.com/eransakal/xstate-hive/blob/v2.0.0/dist/commands/info/index.ts)_

## `xstate-hive init`

Create a configuration file for xstate-hive on the root of your project

```
USAGE
  $ xstate-hive init

DESCRIPTION
  Create a configuration file for xstate-hive on the root of your project

EXAMPLES
  $ xstate-hive init
```

_See code: [dist/commands/init/index.ts](https://github.com/eransakal/xstate-hive/blob/v2.0.0/dist/commands/init/index.ts)_

## `xstate-hive machine [MACHINENAME] [MACHINEPATH]`

Create a new machine to manage a new feature

```
USAGE
  $ xstate-hive machine [MACHINENAME] [MACHINEPATH]

ARGUMENTS
  MACHINENAME  A machine name
  MACHINEPATH  Destination path

DESCRIPTION
  Create a new machine to manage a new feature

EXAMPLES
  $ xstate-hive machine quick-polls ./src/machines

  $ xstate-hive machine quick-polls

  $ xstate-hive machine
```

_See code: [dist/commands/machine/index.ts](https://github.com/eransakal/xstate-hive/blob/v2.0.0/dist/commands/machine/index.ts)_
<!-- commandsstop -->
