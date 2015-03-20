bash.origin
===========

The original spark for this project came from needing an easy way to get the **path of the current Bast script** which is [way harder than it should be](http://stackoverflow.com/a/246128/330439).

It has now turned into a minimal set of Bash conventions and utilities to bootstrap a system.

I need a consistent starting point for Bash scripts so I don't have to re-write the same code over and over when writing scripts to bootstrap `node` and other programs.

Overview
--------

`bash.origin` ensures that when you run a script to install a project or do some work such as run `node` it is launched using a consistent set of [environment variables](http://en.wikipedia.org/wiki/Environment_variable).

This can be used to *bootstrap a system* by ensuring **ALL ENTRY POINTS** to the system **FIRST SOURCE bash.origin BEFORE DOING ANYTHING**. Once this is achieved, one can use `bash.origin` to inject common environment variables and custom signing functions which will subsequently be available to all scripts and commands run within the system.

It is important to note that this approach **MUST NOT BE USED FOR SENSITIVE DATA** but is intended to be used for *root configuration keys and hashes* as well as *pointers to resources* and *version numbers*.

To inherit from a common environment use the [BO_sourcePrototype](https://github.com/cadorn/bash.origin#bo_sourceprototype) utility.


Install
=======

For use in arbitrary scripts to copy the `bash.origin` script to `~/bash.origin`:

	npm install -g bash.origin

For use as a package dependency to copy the `bash.origin` script to `~/bash.origin` when your package is installed:

	npm install bash.origin --save

Demo/Tests
----------

	./run-examples


Usage
-----

No matter how `bash.origin` was installed above; it can be used in any script thereafter using:

````
#!/bin/bash
# Source https://github.com/cadorn/bash.origin
. "$HOME/.bash.origin"
...
````


Examples
--------

  * [examples/01-HelloWorld](https://github.com/cadorn/bash.origin/tree/master/examples/01-HelloWorld) - Simple variable passing and common functions using [npm](http://npmjs.org) package layout.

  * [examples/02-SourceMultiplePrototypes](https://github.com/cadorn/bash.origin/tree/master/examples/02-SourceMultiplePrototypes) - Variable scope isolation when sourcing multiple prototypes.

  * [examples/03-CliPlugin](https://github.com/cadorn/bash.origin/tree/master/examples/03-CliPlugin) - Plugin implementations callable from the command-line using a common framework.

  * [examples/04-ProvisionWithSMI](https://github.com/cadorn/bash.origin/tree/master/examples/04-ProvisionWithSMI) - provision dependencies for a package using [smi](https://github.com/sourcemint/smi).


Conventions
===========

### 1. Bash Module Boilerplate

	#!/bin/bash
	# Source https://github.com/cadorn/bash.origin
	. "$HOME/.bash.origin"
	function init {
		eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
		BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
		local __BO_DIR__="$___TMP___"

		...
	}
	init

NOTE: Sourcing `$HOME/bash.origin` will also run `BO_sourceProfile`.

### 2. Use `__BO_DIR__` for own script file directory


### 3. Use `BO_sourcePrototype` to setup a common environment for programs

The idea is that by *knowing your own script directory* (`__BO_DIR__`) you can **include a common package** that is included by all packages of your system that have scripted *entry points*. This common package contains a **script prototype** which is sourced by all scripts.

For an example see [examples/01-HelloWorld](https://github.com/cadorn/bash.origin/tree/master/examples/01-HelloWorld).


### 4. Call `BO_run_*` to run common programs

The following programs are supported:

  * [node](http://nodejs.org)

The program is installed on first use if it is not already installed.

To install the program for instant access later, simply call it once and ask it for its version. i.e. `BO_run_node -v`


### 5. Use `BO_systemCachePath` to keep system-global code packages

Every global code package has a hostname-based URI, version and aspect:

	BO_systemCachePath CACHED_PATH "$ID" "$VERSION" "$ASPECT"

The path returned for the above call will be:

	$HOME/.bash.origin.cache/$ID/$VERSION/$ASPECT

The whole point is that these **paths are predictable** and can be assumed as provisioned by programs booted using `bash.origin` *by the time the program boots*.


Utilities
=========

### `BO_has`

Check if a command is available using `if BO_has "curl"; then ...`.


### `BO_setResult`

Used in functions to return values:

	function ourFunc {
		BO_setResult $1 "result"
	}
	ourFunc RESULT_VAR ...


### `__BO_DIR__` of own script

	eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
	BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
	local __BO_DIR__="$___TMP___"

Use a *local* variable in the `init` function to keep the scope local to the module.


### `BO_sourceProfile`

Load the bash profile from `$HOME/*` to init the environment.


### `BO_ensure_nvm`

Ensure [nvm](https://github.com/creationix/nvm) is installed.


### `BO_ensure_node`

Ensure the latest stable version of [node](http://nodejs.org) is installed using [nvm](https://github.com/creationix/nvm).


### `BO_run_node`

Run a [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) file using [node](http://nodejs.org).


### `BO_isSourced`

Determine if the current script is being sourced using `BO_sourcePrototype`.

	BO_isSourced IS_SOURCED


### `BO_sourcePrototype`

Allows scripts to inherit from other scripts.

For a nested example see [examples/02-SourceMultiplePrototypes](https://github.com/cadorn/bash.origin/tree/master/examples/02-SourceMultiplePrototypes).


### `BO_systemCachePath`

Example:

	BO_systemCachePath CACHED_PATH \
		"github.com/sourcemint/smi" \
		"$BO_VERSION_SMI_CLI" \
		"install"


### `BO_isInSystemCache`

Example:

	BO_isInSystemCache CACHED_PATH \
		"github.com/sourcemint/smi" \
		"$BO_VERSION_SMI_CLI" \
		"install"


### `BO_downloadToSystemCache`

	BO_ensureInSystemCache DOWNLOADED_PATH \
		"github.com/bash-origin/bash.origin" \
		"0.1.5" \
		"archive.tar.gz" \
		"https://github.com/bash-origin/bash.origin/archive/v0.1.5.tar.gz"

Replaces file if already exists.

### `BO_ensureInSystemCache`

Same as `BO_downloadToSystemCache` but does not replace file if already exists.


### `BO_run_smi`

Run [smi](https://github.com/sourcemint/smi) on a directory in order to install dependencies.

For a simple example see [examples/04-ProvisionWithSMI](https://github.com/cadorn/bash.origin/tree/master/examples/04-ProvisionWithSMI).


License
=======

[UNLICENSE](http://unlicense.org/)

