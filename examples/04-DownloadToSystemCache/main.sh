#!/usr/bin/env bash.origin

eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
local __BO_DIR__="$___TMP___"


BO_ALLOW_DOWNLOADS=1
BO_ensureInSystemCache "DOWNLOADED_PATH" "github.com/jonschlinkert/is-number" "7.0.0" "https://github.com/jonschlinkert/is-number/archive/7.0.0.zip"

echo "DOWNLOADED_PATH: $DOWNLOADED_PATH"
