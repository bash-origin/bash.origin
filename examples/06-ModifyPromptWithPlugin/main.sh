#!/usr/bin/env bash.origin

eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
local __BO_DIR__="$___TMP___"

echo "---"

which bash.origin

BO_VERBOSE=1

echo "TEST_MATCH_IGNORE>>>"
BO_callDownloadedPlugin "bash.origin.prompt@0.2.0-pre.1#prompt/v0" setPrompt "workspace" "$__BO_DIR__"
echo "<<<TEST_MATCH_IGNORE"

echo "$PS1"

echo "---"

# or

echo "TEST_MATCH_IGNORE>>>"
BO_ensureInSystemCache "DOWNLOADED_PATH" "github.com/bash-origin/bash.origin.prompt" "0.2.0-pre.1" "https://github.com/bash-origin/bash.origin.prompt/archive/v0.2.0-pre.1.zip"
BO_callPlugin "$DOWNLOADED_PATH/bash.origin.prompt#prompt/v0" setPrompt "workspace" "$__BO_DIR__"
echo "<<<TEST_MATCH_IGNORE"

echo "$PS1"

echo "---"

echo "OK"
