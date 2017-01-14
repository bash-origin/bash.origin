#!/usr/bin/env bash
# Source https://github.com/cadorn/bash.origin
if [ -z "${BO_LOADED}" ]; then
		. "$HOME/.bash.origin"
fi
function init {
		eval BO_SELF_BASH_SOURCE="$BO_READ_SELF_BASH_SOURCE"
		BO_deriveSelfDir ___TMP___ "$BO_SELF_BASH_SOURCE"
		local __BO_DIR__="$___TMP___"


    local RECORD=0

		if echo "$@" | grep -q -Ee '(\$|\s*)--record(\s*|\$)'; then
        RECORD=1
		fi


    function runTest {
        local testName="$1"

        BO_format "${VERBOSE}" "HEADER" "Run test: $testName"

	      echo "$(BO_cecho "Test: $testName" WHITE BOLD)"

				pushd "$testName" > /dev/null

		        local actualResultPath=".actual.log"
		        local expectedResultPath=".expected.log"


		        BO_resetLoaded
		        # Run test and record actual result
		        ./main | tee "$actualResultPath"

						# Make paths in result relative
						basePath=`echo "$(dirname $__BO_DIR__)" | sed 's/\\//\\\\\\//g'`
						sed -i'' -e "s/$basePath//g" "$actualResultPath"


		        if [ $RECORD == 0 ]; then
		            # Compare actual result with expected result
		            if [ ! -e "$expectedResultPath" ]; then
		                echo "ERROR: Expected result not found at '$expectedResultPath'! Run tests with '--record' once to generate expected result."
		                exit 1
		            fi
		            if [ "$(cat $actualResultPath)" != "$(cat $expectedResultPath)" ]; then
		                echo "ERROR: Actual result does not match expected result for test '$testName'!"
		                echo "  actual: $actualResultPath"
		                echo "  expected: $expectedResultPath"
		                exit 1
		            fi
		  		      echo "$(BO_cecho "OK" GREEN BOLD)"
		        else
		            # Keep actual result as expected result
		            cp -f "$actualResultPath" "$expectedResultPath"
		        fi
				popd > /dev/null

        BO_format "${VERBOSE}" "FOOTER"
    }


		pushd "$__BO_DIR__" > /dev/null
        for mainpath in */main ; do
            runTest "$(echo "$mainpath" | sed 's/\/main$//')"
        done
		popd > /dev/null
}
init "$@"
