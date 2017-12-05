#!/usr/bin/env bash.origin.script

BO_ALLOW_DOWNLOADS=1
BO_ALLOW_INSTALLS=1

depend {
    "inception": {
        "@com.github/cadorn/Inception#s1": {
            "readme": "$__DIRNAME__/README.md",
            "variables": {
                "PACKAGE_NAME": "bash.origin",
                "PACKAGE_GITHUB_URI": "github.com/bash-origin/bash.origin",
                "PACKAGE_WEBSITE_SOURCE_URI": "github.com/bash-origin/bash.origin/tree/master/workspace.sh",
                "PACKAGE_CIRCLECI_NAMESPACE": "bash-origin/bash.origin",
                "PACKAGE_NPM_PACKAGE_NAME": "bash.origin",
                "PACKAGE_NPM_PACKAGE_URL": "https://www.npmjs.com/package/bash.origin",
                "PACKAGE_WEBSITE_URI": "bash-origin.github.io/bash.origin",
                "PACKAGE_YEAR_CREATED": "2015",
                "PACKAGE_LICENSE_ALIAS": "FPL",
                "PACKAGE_SUMMARY": "$__DIRNAME__/GUIDE.md"
            }
        }
    }
}

BO_parse_args "ARGS" "$@"

if [ "$ARGS_1" == "publish" ]; then

    CALL_inception website publish ${*:2}

fi
