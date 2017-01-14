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
		elif echo "$npm_config_argv" | grep -q -Ee '"--record"'; then
		    RECORD=1
		fi


		# @source http://stackoverflow.com/a/3879077/330439
		function require_clean_work_tree {
		    # Update the index
		    git update-index -q --ignore-submodules --refresh
		    # Disallow unstaged changes in the working tree
		    if ! git diff-files --quiet --ignore-submodules --; then
						return 1
		    fi
		    # Disallow uncommitted changes in the index
		    if ! git diff-index --cached --quiet HEAD --ignore-submodules --; then
						return 1
		    fi
				return 0
		}


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
						sed -i -e "s/$basePath//g" "$actualResultPath"
						homePath=`echo "$HOME" | sed 's/\\//\\\\\\//g'`
						sed -i -e "s/$homePath//g" "$actualResultPath"

						if [ -e "$actualResultPath-e" ]; then
								rm "$actualResultPath-e"
						fi


		        if [ $RECORD == 0 ]; then

		            # Compare actual result with expected result
		            if [ ! -e "$expectedResultPath" ]; then
		                echo "ERROR: Expected result not found at '$expectedResultPath'! Run tests with '--record' once to generate expected result."
		                exit 1
		            fi
								if ! diff -q "$expectedResultPath" "$actualResultPath" > /dev/null 2>&1; then
		                echo "$(BO_cecho "| ##################################################" RED BOLD)"
		                echo "$(BO_cecho "| # ERROR: Actual result does not match expected result for test '$testName'!" RED BOLD)"
		                echo "$(BO_cecho "| ##################################################" RED BOLD)"
		                echo "$(BO_cecho "| # $(ls -al "$expectedResultPath")" RED BOLD)"
		                echo "$(BO_cecho "| # $(ls -al "$actualResultPath")" RED BOLD)"
		                echo "$(BO_cecho "| ########## ACTUAL : $actualResultPath >>>" RED BOLD)"
										cat "$expectedResultPath"
		                echo "$(BO_cecho "| ########## EXPECTED : $expectedResultPath >>>" RED BOLD)"
										cat "$expectedResultPath"
		                echo "$(BO_cecho "| ########## DIFF >>>" RED BOLD)"
										set +e
										diff -U 4 "$expectedResultPath" "$actualResultPath"
										set -e
		                echo "$(BO_cecho "| ##################################################" RED BOLD)"
										# TODO: Optionally do not exit.
		                exit 1
		            fi
		  		      echo "$(BO_cecho "OK" GREEN BOLD)"
		        else

								echo "Recording test session in '.expected.log' files."

		            # Keep actual result as expected result
		            cp -f "$actualResultPath" "$expectedResultPath"
		        fi
				popd > /dev/null

        BO_format "${VERBOSE}" "FOOTER"
    }


		pushd "$__BO_DIR__" > /dev/null

				if [ $RECORD == 1 ]; then
						if ! require_clean_work_tree; then
								echo >&2 "$(BO_cecho "ERROR: Cannot remove all temporary test assets before recording test run because git is not clean!" RED BOLD)"
								exit 1
						fi
		        git clean -d -x -f
				fi

        for mainpath in */main ; do
            runTest "$(echo "$mainpath" | sed 's/\/main$//')"
        done
		popd > /dev/null
}
init "$@"
