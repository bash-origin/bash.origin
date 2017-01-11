#!/usr/bin/env bash.origin.script

single firstVarValueForAll
single lastVarValueForAll

declare -A vars
local lastVarValuePerInstance

local initArgs


initArgs="$__ARGS__"

echo "__FILENAME__: $__FILENAME__"
echo "__DIRNAME__: $__DIRNAME__"
echo "__BUILD_UUID__: $__BUILD_UUID__"
echo "__ARGS__: $__ARGS__"
echo "__ARG1__: $__ARG1__"
echo "__ARG2__: $__ARG2__"

echo "initArgs: $initArgs"


function EXPORTS_list {
		EXPORTS_lisd $@
}

function EXPORTS_lisd {
		EXPORTS__list $@
}

function EXPORTS__list {

    echo "LIST: Hello World: $__DIRNAME__"

		EXPORTS__lis $@
}

function EXPORTS__lis {

    echo "LIST: PREFIX: ${___bo_module_instance_alias___}"
    echo "LIST: ARGS: $@"
}


function EXPORTS_setVar {
		vars[$1]="${___bo_module_instance_alias___} : $2"
		lastVarValuePerInstance="${___bo_module_instance_alias___} : $2"

		if [ "$firstVarValueForAll" == "" ]; then
				firstVarValueForAll="${___bo_module_instance_alias___} : $2"
		fi
		lastVarValueForAll="${___bo_module_instance_alias___} : $2"
}

function EXPORTS_printVar {
		echo "[${___bo_module_instance_alias___}][${initArgs}] var value for key '$1': ${vars[$1]}"
}

function EXPORTS_printLastInstanceVarValue {
		echo "[${___bo_module_instance_alias___}][${initArgs}] last value for instance: $lastVarValuePerInstance"
}

function EXPORTS_printFirstGlobalVarValue {
		echo "[${___bo_module_instance_alias___}][${initArgs}] first global value: $firstVarValueForAll"
}

function EXPORTS_printLastGlobalVarValue {

echo "initArgs: $initArgs"

		echo "[${___bo_module_instance_alias___}][$initArgs] last gloabl value: $lastVarValueForAll"
}
