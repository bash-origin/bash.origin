#!/usr/bin/env bash.origin

eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
local __BO_DIR__="$___TMP___"


pushd "$__BO_DIR__" > /dev/null

# TODO: 'smi' is currently too slow to install.
		echo ">>>SKIP_TEST<<<"

#		echo "TEST_MATCH_IGNORE>>>"
#		BO_run_smi install
#		echo "<<<TEST_MATCH_IGNORE"

	  # TODO: Assertions

	  echo "OK"

popd > /dev/null
