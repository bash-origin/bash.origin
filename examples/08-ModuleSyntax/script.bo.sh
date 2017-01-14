#!/usr/bin/env bash.origin.script


function PRIVATE_run {

		BO_requireModule "./module.bo.sh" as "module"

		module run "from script"

}

PRIVATE_run
