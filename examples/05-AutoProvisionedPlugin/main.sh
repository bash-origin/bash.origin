#!/usr/bin/env bash.origin

eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
local __BO_DIR__="$___TMP___"


echo "TEST_MATCH_IGNORE>>>"
BO_ALLOW_DOWNLOADS=1
BO_ALLOW_INSTALLS=1
BO_VERBOSE=1
BO_callDownloadedPlugin "bash.origin.provision" BO_Provision_ensureGitWorkingRepositoryAt ".tmp~io.pinf.proxy" "git@github.com:pinf-io/io.pinf.proxy.git"
echo "<<<TEST_MATCH_IGNORE"

# TODO: Assertions

echo "OK"
