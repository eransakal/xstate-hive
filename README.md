# XState Hive (Code generator)

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/xstate-hive)](https://npmjs.org/package/xstate-hive)
[![Downloads/week](https://img.shields.io/npm/dw/xstate-hive)](https://npmjs.org/package/xstate-hive)
[![License](https://img.shields.io/npm/l/xstate-hive)](https://github.com/eransakl/xstate-hive/blob/main/package.json)

<!-- toc -->
* [XState Hive (Code generator)](#xstate-hive-code-generator)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g xstate-hive
$ xstatehive COMMAND
running command...
$ xstatehive (--version)
xstate-hive/0.0.0 darwin-arm64 node-v16.15.1
$ xstatehive --help [COMMAND]
USAGE
  $ xstatehive COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`xstatehive help [COMMANDS]`](#xstatehive-help-commands)
* [`xstatehive machine DEST MACHINE`](#xstatehive-machine-dest-machine)
* [`xstatehive plugins`](#xstatehive-plugins)
* [`xstatehive plugins:install PLUGIN...`](#xstatehive-pluginsinstall-plugin)
* [`xstatehive plugins:inspect PLUGIN...`](#xstatehive-pluginsinspect-plugin)
* [`xstatehive plugins:install PLUGIN...`](#xstatehive-pluginsinstall-plugin-1)
* [`xstatehive plugins:link PLUGIN`](#xstatehive-pluginslink-plugin)
* [`xstatehive plugins:uninstall PLUGIN...`](#xstatehive-pluginsuninstall-plugin)
* [`xstatehive plugins:uninstall PLUGIN...`](#xstatehive-pluginsuninstall-plugin-1)
* [`xstatehive plugins:uninstall PLUGIN...`](#xstatehive-pluginsuninstall-plugin-2)
* [`xstatehive plugins update`](#xstatehive-plugins-update)

## `xstatehive help [COMMANDS]`

Display help for xstatehive.

```
USAGE
  $ xstatehive help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for xstatehive.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.9/src/commands/help.ts)_

## `xstatehive machine DEST MACHINE`

Create a new machine to manage a new feature

```
USAGE
  $ xstatehive machine DEST MACHINE [--coreState bootup-to-operating]

ARGUMENTS
  DEST     Destination path
  MACHINE  A machine name

FLAGS
  --coreState=<option>  [default: bootup-to-operating] add core state of specified type
                        <options: bootup-to-operating>

DESCRIPTION
  Create a new machine to manage a new feature

EXAMPLES
  $ xstatehive machine create ./src/machines quick-polls
```

_See code: [dist/commands/machine/index.ts](https://github.com/eransakal/xstate-hive/blob/v0.0.0/dist/commands/machine/index.ts)_

## `xstatehive plugins`

List installed plugins.

```
USAGE
  $ xstatehive plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ xstatehive plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/index.ts)_

## `xstatehive plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ xstatehive plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ xstatehive plugins add

EXAMPLES
  $ xstatehive plugins:install myplugin 

  $ xstatehive plugins:install https://github.com/someuser/someplugin

  $ xstatehive plugins:install someuser/someplugin
```

## `xstatehive plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ xstatehive plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ xstatehive plugins:inspect myplugin
```

## `xstatehive plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ xstatehive plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ xstatehive plugins add

EXAMPLES
  $ xstatehive plugins:install myplugin 

  $ xstatehive plugins:install https://github.com/someuser/someplugin

  $ xstatehive plugins:install someuser/someplugin
```

## `xstatehive plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ xstatehive plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ xstatehive plugins:link myplugin
```

## `xstatehive plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ xstatehive plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ xstatehive plugins unlink
  $ xstatehive plugins remove
```

## `xstatehive plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ xstatehive plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ xstatehive plugins unlink
  $ xstatehive plugins remove
```

## `xstatehive plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ xstatehive plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ xstatehive plugins unlink
  $ xstatehive plugins remove
```

## `xstatehive plugins update`

Update installed plugins.

```
USAGE
  $ xstatehive plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
