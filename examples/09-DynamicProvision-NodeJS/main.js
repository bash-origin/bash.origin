#!/usr/bin/env bash.origin.test via github.com/facebook/jest

process.env.BO_SYSTEM_CACHE_DIR = __dirname + "/.cache";
process.env.BO_ALLOW_DOWNLOADS = 1;
process.env.BO_ALLOW_INSTALLS = 1;

const BO = require("bash.origin");

test('Test', function () {

    var INF = BO.invokeApi("bash.origin.cli#s1", "#io.pinf/interface~s1");

    expect(INF.fingerprint()).toBe(process.platform);
});
