#!/usr/bin/env bash.origin

eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
local __BO_DIR__="$___TMP___"


BO_ALLOW_DOWNLOADS=1
BO_ensureInSystemCache "DOWNLOADED_PATH" "github.com/mathisonian/command-exists" "1.2.8" "https://github.com/mathisonian/command-exists/archive/v1.2.8.zip"

echo "DOWNLOADED_PATH: $DOWNLOADED_PATH"
