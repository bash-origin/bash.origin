bash.origin
===========

A minimal set of Bash conventions and utilities to bootstrap a system.

I need a consistent starting point for Bash scripts so I don't have to re-write the same code over and over when writing scripts to bootstrap `node` and other binaries.


Install
-------

	npm install [-g] bash.origin

This will copy the `bash.origin` script to `~/bash.origin`.


Usage
-----

`bin/cmd` ~
````
#!/bin/bash
. "$HOME/bash.origin"
BO_deriveSelfDir __DIR__ "$BO_READ_SELF_BASH_SOURCE"

...
````


Conventions
-----------

### 1. Source Root Bash Script

Source the *Root Bash Script* located at `~/bash.origin` using:

    . "$HOME/bash.origin"

### 2. Derive `__DIR__` for own file

Obtain a value for `__DIR__` pointing to the directory containing our script using:

    BO_deriveSelfDir __DIR__ "$BO_READ_SELF_BASH_SOURCE"


Utilities
---------

### `BO_setResult`

Used in functions to return values:

	function ourFunc {
		BO_setResult $1 "result"
	}
	ourFunc RESULT_VAR ...


### `__DIR__` of own script

    BO_deriveSelfDir __DIR__ "$BO_READ_SELF_BASH_SOURCE"




License
=======

[UNLICENSE](http://unlicense.org/)
