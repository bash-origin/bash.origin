#!/usr/bin/env bash.origin.script

echo "TEST_MATCH_IGNORE>>>"

depend {
    "pages": "@com.github/pinf-to/to.pinf.com.github.pages#s1"
}

CALL_pages publish {
    "anchors": {
        "body": "Hello World from bash.origin"
    }
}

echo "<<<TEST_MATCH_IGNORE"

echo "OK"
