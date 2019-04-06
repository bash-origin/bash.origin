#!/usr/bin/env bash.origin

eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
local __BO_DIR__="$___TMP___"


echo "TEST_MATCH_IGNORE>>>"
BO_callDownloadedPlugin "bash.origin.prompt@0.1.1" setPrompt "workspace" "$__BO_DIR__"
echo "<<<TEST_MATCH_IGNORE"

# or

echo "TEST_MATCH_IGNORE>>>"
BO_ensureInSystemCache "DOWNLOADED_PATH" "github.com/bash-origin/bash.origin.prompt" "0.1.1" "https://github.com/bash-origin/bash.origin.prompt/archive/v0.1.1.zip"
BO_callPlugin "$DOWNLOADED_PATH/bash.origin.prompt" setPrompt "workspace" "$__BO_DIR__"
echo "<<<TEST_MATCH_IGNORE"

# TODO: Assertions

echo "OK"
