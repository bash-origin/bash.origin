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


Usage
-----

No matter how `bash.origin` was installed above; it can be used in any script thereafter using:

````
#!/bin/bash
# Source https://github.com/cadorn/bash.origin
. "$HOME/bash.origin"
eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir __BO_DIR__ "$BO_SELF_BASH_SOURCE"

BO_run_node -v

...
````


Conventions
===========

### 1. Source Root Bash Script

Source the *Root Bash Script* located at `~/bash.origin` using:

    . "$HOME/bash.origin"

This will also run `BO_sourceProfile`.


### 2. Derive `__BO_DIR__` for own file

Obtain a value for `__BO_DIR__` pointing to the directory containing our script using:

	eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
	BO_deriveSelfDir __BO_DIR__ "$BO_SELF_BASH_SOURCE"

### 3. Call `BO_run_*` to run common programs

The following programs are supported:

  * [node](http://nodejs.org)

The program is installed on first use if it is not already installed.

To install the program for instant access later, simply call it once and ask it for its version. i.e. `BO_run_node -v`


Utilities
=========

### `BO_setResult`

Used in functions to return values:

	function ourFunc {
		BO_setResult $1 "result"
	}
	ourFunc RESULT_VAR ...


### `__BO_DIR__` of own script

	eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
	BO_deriveSelfDir __BO_DIR__ "$BO_SELF_BASH_SOURCE"


### `BO_sourceProfile`

Load the bash profile from `$HOME/*` to init the environment.


### `BO_ensure_nvm`

Ensure [nvm](https://github.com/creationix/nvm) is installed.


### `BO_ensure_node`

Ensure the latest stable version of [node](http://nodejs.org) is installed using [nvm](https://github.com/creationix/nvm).


### `BO_run_node`

Run a [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) file using [node](http://nodejs.org).


### `BO_sourcePrototype`

Allows scripts to inherit a common envrionment from a *prototype* script.

**script.sh**
````
#!/bin/bash
# Source https://github.com/cadorn/bash.origin
. "$HOME/bash.origin"
eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir __BO_DIR__ "$BO_SELF_BASH_SOURCE"

BO_sourcePrototype "$__BO_DIR__/common.prototype" $@
````

**common.prototype**
````
#!/bin/bash
# Source https://github.com/cadorn/bash.origin
eval __PROTOTYPE__BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir __PROTOTYPE__BO_DIR__ "$__PROTOTYPE__BO_SELF_BASH_SOURCE"

BO_run_node "$__PROTOTYPE__BO_DIR__/pto.js" --plugin "$__BO_DIR__/.." $@
````


License
=======

[UNLICENSE](http://unlicense.org/)

