#!/usr/bin/env bash.origin

eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
local __BO_DIR__="$___TMP___"

"$__BO_DIR__/bin/hello" "Hi"
"$__BO_DIR__/bin/hallo" "Hi"
"$__BO_DIR__/bin/hola" "Hi"
