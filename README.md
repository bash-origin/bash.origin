bash.origin
===========

A minimal set of Bash conventions and utilities to bootstrap a system.

I need a consistent starting point for Bash scripts so I don't have to re-write the same code over and over when writing scripts to bootstrap `node` and other programs.


Install
-------

For use in arbitrary scripts to copy the `bash.origin` script to `~/bash.origin`:

	npm install -g bash.origin

For use as a package dependency to copy the `bash.origin` script to `~/bash.origin` when your package is installed:

	npm install bash.origin --save


Usage
-----

No matter how `bash.origin` was installed above; it can be used in any script thereafter using:

````
#!/bin/bash

. "$HOME/bash.origin"
eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir __DIR__ "$BO_SELF_BASH_SOURCE"


BO_run_node -v

...
````


Conventions
-----------

### 1. Source Root Bash Script

Source the *Root Bash Script* located at `~/bash.origin` using:

    . "$HOME/bash.origin"

This will also run `BO_sourceProfile`.


### 2. Derive `__DIR__` for own file

Obtain a value for `__DIR__` pointing to the directory containing our script using:

	eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
	BO_deriveSelfDir __DIR__ "$BO_SELF_BASH_SOURCE"

### 3. Call `BO_run_*` to run common programs

The following programs are supported:

  * [node](http://nodejs.org)

The program is installed on first use if it is not already installed.

To install the program for instant access later, simply call it once and ask it for its version. i.e. `BO_run_node -v`


Utilities
---------

### `BO_setResult`

Used in functions to return values:

	function ourFunc {
		BO_setResult $1 "result"
	}
	ourFunc RESULT_VAR ...


### `__DIR__` of own script

	eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
	BO_deriveSelfDir __DIR__ "$BO_SELF_BASH_SOURCE"


### `BO_sourceProfile`

Load the bash profile from `$HOME/*` to init the environment.


### `BO_ensure_nvm`

Ensure [nvm](https://github.com/creationix/nvm) is installed.


### `BO_ensure_node`

Ensure the latest stable version of [node](http://nodejs.org) is installed using [nvm](https://github.com/creationix/nvm).


### `BO_run_node`

Run a [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) file using [node](http://nodejs.org).


License
=======

[UNLICENSE](http://unlicense.org/)
