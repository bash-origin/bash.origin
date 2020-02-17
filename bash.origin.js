
"use strict";

const PATH = require("path");
const FS = require("fs");

const VERBOSE = !!process.env.BO_VERBOSE;


exports.canonicalize = function (id) {

    if (VERBOSE) console.error("[bash.origin] canonicalize(id)", id);

    var idParts = id.match(/^([^@#]+)(?:@([^#]+))?#(.+)$/);

    var lid = idParts[1];
    var version = idParts[2] || null;
    var api = idParts[3] || null;

    var $id = {
        // Lookup id
        lid: lid,
        version: version,
        api: api        
    };
    for (var m, i=0, l=exports.canonicalize.mappings.length; i<l; i++) {
        if ((m = lid.match(exports.canonicalize.mappings[i].match))) {

            function replace (str) {
                return str
                    .replace(/\$1/g, m[1])
                    .replace(/\$2/g, m[2]);
            }

            $id.host = exports.canonicalize.mappings[i].host;
            $id.org = replace(exports.canonicalize.mappings[i].org);
            $id.repo = replace(exports.canonicalize.mappings[i].repo);
            [
                "url",
                "uri"
            ].forEach(function (group) {
                $id[group] = {};
                Object.keys(exports.canonicalize.mappings[i][group]).forEach(function (key) {
                    $id[group][key] = exports.canonicalize.mappings[i][group][key]($id);
                });
            });

            return $id;
        }
    }

    throw new Error("Unable to canonicalize id '" + id + "'!");
}
var mappings = exports.canonicalize.mappings = [];
// TODO: Load mappings based on active context
[
    {
        match: /^(it\.pinf\..+)$/,
        host: "github.com",
        org: "pinf-it",
        repo: "$1"
    },
    {
        match: /^(to\.pinf\..+)$/,
        host: "github.com",
        org: "pinf-to",
        repo: "$1"
    },
    {
        match: /^(bash\.origin\..+)$/,
        host: "github.com",
        org: "bash-origin",
        repo: "$1"
    },
    {
        match: /^(?:github.com|com.github)[~\/]([^~\/]+)[~\/]([^~\/]+)$/,
        host: "github.com",
        org: "$1",
        repo: "$2"
    }    
].forEach(function (info) {
    mappings.push({
        match: info.match,
        host: info.host,
        org: info.org,
        repo: info.repo,
        url: {
            archive: function ($id) {
                var tag = "master";
                if ($id.version) {
                    // TODO: Fetch meta info to ensure package follows semver and support other tagging formats.
                    tag = "v" + $id.version;
                }
                return {
                    "zip": "https://" + $id.host + "/" + $id.org + "/" + $id.repo + "/archive/" + tag + ".zip",
                    "tar.gz": "https://" + $id.host + "/" + $id.org + "/" + $id.repo + "/archive/" + tag + ".tar.gz"
                };
            }
        },
        uri: {
            source: function ($id) {
                return $id.host + "~" + $id.org + "~" + $id.repo;
            },
            repo: function ($id) {
                return $id.host + "/" + $id.org + "/" + $id.repo;
            },
            snapshot: function ($id) {
                if (!$id.version) {
                    return ($id.host + "~" + $id.org + "~" + $id.repo + "~/source/snapshot/master");
                }
                // TODO: Fetch meta info to ensure package follows semver and support other tagging formats.
                var tag = "v" + $id.version;
                var majorVersion = $id.version.split(".")[0];
                return ($id.host + "~" + $id.org + "~" + $id.repo + "~" + majorVersion + "/source/snapshot/" + tag);
            },
            master: function ($id) {
                return ($id.host + "~" + $id.org + "~" + $id.repo + "~/source/installed/master");
            },
            node_modules: function ($id) {
                // TODO: Fetch meta info to ensure npm package name follows repo name.
                return $id.repo;
            }
        }
    });
});


exports.search = function (uri) {

    if (VERBOSE) console.error("[bash.origin] search(uri)", uri);
    if (VERBOSE) console.error("[bash.origin] BO_SOURCE_DIRPATHS:", process.env.BO_SOURCE_DIRPATHS);
    if (VERBOSE) console.error("[bash.origin] BO_SYSTEM_CACHE_DIR:", process.env.BO_SYSTEM_CACHE_DIR);
    if (VERBOSE) console.error("[bash.origin] BO_GLOBAL_SYSTEM_CACHE_DIR:", process.env.BO_GLOBAL_SYSTEM_CACHE_DIR);
    if (VERBOSE) console.error("[bash.origin] exports.search.paths:", exports.search.paths);
    
    if (!Array.isArray(uri)) {
        uri = [ uri ];
    }
    for (var i=0, il=uri.length; i<il; i++) {
        if (!uri[i]) {
            continue;
        }
        for (var path, j=0, jl=exports.search.paths.length; j<jl; j++) {
            path = PATH.join(exports.search.paths[j], uri[i]);

            if (VERBOSE) console.error("[bash.origin] Check if uri '" + uri[i] + "' lives at path:", path);

            if (FS.existsSync(path)) {
                return path;
            }
        }
    }
    return null;
}
exports.search.paths = [];
// The source paths take precedence over all paths.
if (process.env.BO_SOURCE_DIRPATHS) {
    process.env.BO_SOURCE_DIRPATHS.split(":").map(function (path) {
        exports.search.paths.push(path);
    });
}
// Locally installed packages are most desirable.
exports.search.paths.push(PATH.join(process.cwd(), "node_modules"));
// Some specific packages are shipped with bash.origin.
exports.search.paths.push(PATH.join(__dirname, "node_modules"));
// It may be in the system cache.
if (process.env.BO_SYSTEM_CACHE_DIR) {
    exports.search.paths.push(process.env.BO_SYSTEM_CACHE_DIR);
}    
// It may be in the global system cache.
if (process.env.BO_GLOBAL_SYSTEM_CACHE_DIR) {
    exports.search.paths.push(process.env.BO_GLOBAL_SYSTEM_CACHE_DIR);
}



// Consistent with: BO_systemCachePath
/*
    it.pinf.org.mochajs#s1
    it.pinf.org.mochajs@0.0.1#s1

*/
exports.resolve = function (id) {

    if (VERBOSE) console.error("[bash.origin] resolve(id)", id);

    var $id = exports.canonicalize(id);

    if (!$id.api) {
        throw new Error("No API Contract specified! Use '" + id + "#<API_URI>'.");
    }

    let path = null;
    try {

        if (VERBOSE) console.error("[bash.origin] resolve(id) resolve via lib.json");

        path = require('lib.json').forModule(module).js.resolve($id.lid);
    } catch (err) {}

    if (!path) {
        path = exports.search([
            // This is a globally unique way of identifying a master source install of a package irrespective of version.
            // It is implied that the 'master' version is recent and more recent than a snapshot.
            // If it is not recent enough, delete it or check it out at a given commit and install.
            $id.uri.master,
            // This is always the most precise way as it includes the full version and is fully globally unique.
            $id.uri.version && $id.uri.snapshot,
            // This is a globally unique way of identifying a tagged package irrespective of version.
            $id.uri.source,
            // This is just the npm name and not very globally unique.
            $id.uri.node_modules,
            // A fallback that holds a snapshot of the master branch in a globally unique way irrespective of version.
            // This happens when there are no available versions/tags.
            !$id.uri.version && $id.uri.snapshot
        ]);
    }

    path = new String(path || "");
    path.$id = $id;

    if (VERBOSE) console.error("[bash.origin] resolve(id) resolved:", path);

    return path;
}

exports.ensure = function (id) {

    if (VERBOSE) console.error("[bash.origin] ensure(id)", id);

    var path = exports.resolve(id);

    if (path == "") {

        if (
            !process.env.BO_ALLOW_DOWNLOADS ||
            !process.env.BO_ALLOW_INSTALLS ||
            !process.env.BO_SYSTEM_CACHE_DIR
        ) {
            console.error("BO_ALLOW_DOWNLOADS", process.env.BO_ALLOW_DOWNLOADS);
            console.error("BO_ALLOW_INSTALLS", process.env.BO_ALLOW_INSTALLS);
            console.error("BO_SYSTEM_CACHE_DIR", process.env.BO_SYSTEM_CACHE_DIR);

            throw new Error("Could not ensure package for id '" + id + "' and not allowed to provision automatically based on 'BO_ALLOW_DOWNLOADS!=1', 'BO_ALLOW_INSTALLS!=1' or '!BO_SYSTEM_CACHE_DIR'");
        }

        if (!FS.existsSync(process.env.BO_SYSTEM_CACHE_DIR)) {
            try {
                FS.mkdirSync(process.env.BO_SYSTEM_CACHE_DIR);
            } catch (err) {
                throw new Error("Cannot use BO_SYSTEM_CACHE_DIR cache directory '" + process.env.BO_SYSTEM_CACHE_DIR + "' as it nor parent exist!");
            }
        }
        

        process.stdout.write("TEST_MATCH_IGNORE>>>\n");

        process.stdout.write("[bash.origin] Provision '" + path.$id.uri.repo + "' at '" + process.env.BO_SYSTEM_CACHE_DIR + "':\n");

        var result = require("child_process").spawnSync("bash", [
            "-e",
            "-s"
        ], {
            cwd: process.cwd(),//env.BO_GLOBAL_SYSTEM_CACHE_DIR,
            env: ((function () {
                var env = process.env;
                delete env.BO_LOADED;
                Object.keys(env).forEach(function (name) {
                    if (!/^npm_/.test(name)) {
                        return;
                    }
                    delete env[name];
                });
                return env;
            })()),
            stdio: [
                "pipe",
                "inherit",
                "inherit"
            ],
            input: ((function () {
                var targetPath = process.env.BO_SYSTEM_CACHE_DIR + "/" + path.$id.uri.node_modules;
                return [
                    '. "' + __filename.replace(/\.js$/, "") + '"',
                    'BO_FORCE_SYSTEM_CACHE_DIR="' + process.env.BO_SYSTEM_CACHE_DIR + '"',
                    'BO_ensurePlugin "pluginPath" "' + path.$id.uri.repo + '"',
                    'if [ ! -d "' + targetPath + '" ]; then',
                        'pluginPath="$(dirname "${pluginPath}")"',
                        'echo "[bash.origin] Linking: ${pluginPath} to ' + targetPath + '"',
                        'ln -s "${pluginPath}" "' + targetPath + '"',
                    'fi'
                ].join("\n");                
            })())
        });
        if (result.error) {
            throw result.error;
        }

        process.stdout.write("<<<TEST_MATCH_IGNORE\n");


        path = exports.resolve(id);
        if (path == "") {
            throw new Error("Could not ensure id '" + id + "!");
        }

        return path;
    }

    return path;
}

exports.depend = function (id, config) {

    if (VERBOSE) console.error("[bash.origin] depend(id, config)", id, config);

    var path = exports.ensure(id);

    if (!/_#_[^\/]+\.js$/.test(path)) {
        path = path + "/_#_org.bashorigin_#_" + path.$id.api + ".js";
    } else {
        path = path.toString();
    }

    var impl = require(path);

    return impl.forConfig(config || {});
}

exports.isInvokable = function (obj) {
    var keys = Object.keys(obj);
    return (
        keys.length === 1 &&
        /^@.+\./.test(keys[0])
    );
}

exports.invokeApi = function (obj, apiUri, apiArgsObj, options) {

    if (VERBOSE) console.error("[bash.origin] depend(obj, apiUri, apiArgsObj, options)", obj, apiUri, apiArgsObj, options);

    apiArgsObj = apiArgsObj || {};
    if (!Array.isArray(apiArgsObj)) {
        apiArgsObj = [
            apiArgsObj
        ];
    }
    options = options || {};

    var implId = null;
    var implConfig = null;    
    if (typeof obj === "string") {
        implId = obj.replace(/^@/, "");
        implConfig = {};
    } else {
        var keys = Object.keys(obj);
        implId = keys[0].replace(/^@/, "");
        implConfig = obj[keys[0]];
    }

    if (options.config) {
        implConfig = mergeDeep(implConfig, options.config);
    }

    var implAPIs = exports.depend(implId, implConfig);

    if (!Array.isArray(apiUri)) {
        apiUri = [ apiUri ];
    }

    for (var i=0; i<apiUri.length; i++) {

        if (typeof implAPIs[apiUri[i]] === "function") {
            return implAPIs[apiUri[i]].apply(null, apiArgsObj);
        }
    }

    throw new Error("Implementation for '" + implId + "' does not declare API '" + apiUri.join(", ") + "'!");
}


// @see https://stackoverflow.com/a/37164538/330439
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
function mergeDeep (target, source) {
    var output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(function (key) {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
