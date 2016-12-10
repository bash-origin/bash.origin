#!/bin/bash -ue
# Source https://github.com/cadorn/bash.origin
# Source https://github.com/bash-origin/bash.origin
if [ -z "${BO_LOADED}" ]; then
    if [ ! -z "$BO_VERBOSE" ]; then
        BO_log "$BO_VERBOSE" "[bash.origin.module][compiled:module.bo.sh] Sourcing '${HOME}/.bash.origin'"
    fi
    . "${HOME}/.bash.origin"
fi
function init {
    eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
    BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
    local __BO_DIR__="$___TMP___"

    
echo "Hello World: /dl/source/github.com~bash-origin~bash.origin/examples/08-ModuleSyntax"

}
init "$@"
