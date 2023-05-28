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
xstate-hive/1.0.1 darwin-arm64 node-v16.15.1
$ xstate-hive --help [COMMAND]
USAGE
  $ xstate-hive COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`xstate-hive help [COMMANDS]`](#xstate-hive-help-commands)
* [`xstate-hive init`](#xstate-hive-init)
* [`xstate-hive machine create DEST MACHINE`](#xstate-hive-machine-create-dest-machine)

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

_See code: [dist/commands/init/index.ts](https://github.com/eransakal/xstate-hive/blob/v1.0.1/dist/commands/init/index.ts)_

## `xstate-hive machine create DEST MACHINE`

Create a new machine to manage a new feature

```
USAGE
  $ xstate-hive machine create DEST MACHINE [--coreState bootup-to-operating]

ARGUMENTS
  DEST     Destination path
  MACHINE  A machine name

FLAGS
  --coreState=<option>  [default: bootup-to-operating] add core state of specified type
                        <options: bootup-to-operating>

DESCRIPTION
  Create a new machine to manage a new feature

EXAMPLES
  $ xstate-hive machine create ./src/machines quick-polls
```
<!-- commandsstop -->
