#!/usr/bin/env bash.origin.test via github.com/facebook/jest

const BO = require("bash.origin");

test('Test', function () {

    var cacheBasePath = __dirname + "/.cache";
    process.env.BO_PLUGIN_SEARCH_DIRPATHS = cacheBasePath;
    process.env.BO_SYSTEM_CACHE_DIR = cacheBasePath;
    process.env.BO_GLOBAL_SYSTEM_CACHE_DIR = cacheBasePath;
    
    process.env.BO_ALLOW_DOWNLOADS = 1;
    process.env.BO_ALLOW_INSTALLS = 1;

    var INF = BO.invokeApi("@bash.origin.cli#s1", "#io.pinf/interface~s1");

    expect(INF.fingerprint()).toBe(process.platform);
});
