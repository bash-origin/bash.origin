
const PATH = require("path");
const FS = require("fs");


exports.depend = function (id, config) {

    function lookup (id, mustExist) {

        var idParts = id.match(/^@?([^#]+)#(.+)$/);
        
        if (!idParts) {
            throw new Error("No API Contract specified! Use '" + id + "#<uri>'.");
        }
    
        var BO_PLUGIN_SEARCH_DIRPATHS = process.env.BO_PLUGIN_SEARCH_DIRPATHS;
    
        if (!BO_PLUGIN_SEARCH_DIRPATHS) {
            throw new Error("'BO_PLUGIN_SEARCH_DIRPATHS' not set while trying to depend on '" + id + "'!");
        }

        var subPaths = [];

        // TODO: Use a lookup mechanism instead of hardcoding here.
        if (/^it\.pinf\./.test(idParts[1])) {
            subPaths.push("github.com~pinf-it~" + idParts[1]);
            subPaths.push(idParts[1]);
        } else
        if (/^to\.pinf\./.test(idParts[1])) {
            subPaths.push("github.com~pinf-to~" + idParts[1]);
            subPaths.push(idParts[1]);
        } else
        if (/^bash\.origin\./.test(idParts[1])) {
            subPaths.push("github.com~bash-origin~" + idParts[1]);
            subPaths.push(idParts[1]);
        } else
        if (/^github\.com~/.test(idParts[1])) {
            subPaths.push(idParts[1]);
        } else {
            throw new Error("No lookup pattern found for id '" + id + "'!");
        }

        var found = null;
        var lookupPaths = [];
        BO_PLUGIN_SEARCH_DIRPATHS.split(":").forEach(function (path) {
            subPaths.forEach(function (subPath) {
                lookupPaths.push(PATH.join(path, subPath));
            });
        });

        lookupPaths.forEach(function (path) {
            if (found) return;
            if (FS.existsSync(path)) {
                found = path;
            }
        });

        if (!found) {

            if (mustExist) {
                throw new Error("Could not locate package for id '" + id + "' in lookup paths '" + lookupPaths.join(", ") + "' and not allowed to provision automatically due to 'mustExist=1'");
            }

            if (
                !process.env.BO_ALLOW_DOWNLOADS ||
                !process.env.BO_ALLOW_INSTALLS ||
                process.env.BO_PLUGIN_SEARCH_DIRPATHS !== process.env.BO_GLOBAL_SYSTEM_CACHE_DIR ||
                process.env.BO_PLUGIN_SEARCH_DIRPATHS !== process.env.BO_SYSTEM_CACHE_DIR
            ) {
                console.error("BO_ALLOW_DOWNLOADS", process.env.BO_ALLOW_DOWNLOADS);
                console.error("BO_ALLOW_INSTALLS", process.env.BO_ALLOW_INSTALLS);
                console.error("BO_PLUGIN_SEARCH_DIRPATHS", process.env.BO_PLUGIN_SEARCH_DIRPATHS);
                console.error("BO_GLOBAL_SYSTEM_CACHE_DIR", process.env.BO_GLOBAL_SYSTEM_CACHE_DIR);
                console.error("BO_GLOBAL_SYSTEM_CACHE_DIR", process.env.BO_SYSTEM_CACHE_DIR);

                throw new Error("Could not locate package for id '" + id + "' in lookup paths '" + lookupPaths.join(", ") + "' and not allowed to provision automatically based on 'BO_ALLOW_DOWNLOADS!=1' and 'BO_ALLOW_INSTALLS!=1'");
            }

            process.stdout.write("TEST_MATCH_IGNORE>>>\n");

            var provisionId = null;

            // We only support some 'id' patterns for now.
            // TODO: Resolve all kinds of ids.
            if (/^bash\.origin\./.test(id)) {
                provisionId = "com.github/bash-origin/" + idParts[1]
            } else {
                throw new Error("Cannot resolve id '" + id + "' to pakcage URI!");
            }

            process.stdout.write("[bash.origin] Provision '" + provisionId + "' at '" + process.env.BO_GLOBAL_SYSTEM_CACHE_DIR + "':\n");

            if (!FS.existsSync(process.env.BO_GLOBAL_SYSTEM_CACHE_DIR)) {
                try {
                    FS.mkdirSync(process.env.BO_GLOBAL_SYSTEM_CACHE_DIR);
                } catch (err) {
                    throw new Error("Cannot use cache directory '" + process.env.BO_GLOBAL_SYSTEM_CACHE_DIR + "' as it nor parent exist!");
                }
            }

            var env = process.env;
            delete env.BO_LOADED;
            Object.keys(env).forEach(function (name) {
                if (!/^npm_/.test(name)) {
                    return;
                }
                delete env[name];
            });
            var targetPath = process.env.BO_SYSTEM_CACHE_DIR + "/" + idParts[1].replace(/@.+$/, "");
            var commands = [
                '. "' + __filename.replace(/\.js$/, "") + '"',
                'BO_FORCE_SYSTEM_CACHE_DIR="' + process.env.BO_SYSTEM_CACHE_DIR + '"',
                'BO_ensurePlugin "pluginPath" "' + provisionId + '"',
                'if [ ! -d "' + targetPath + '" ]; then',
                    'pluginPath="$(dirname "${pluginPath}")"',
                    'echo "Linking: ${pluginPath} to ' + targetPath + '"',
                    'ln -s "${pluginPath}" "' + targetPath + '"',
                'fi'
            ];
            var result = require("child_process").spawnSync("bash", [
                "-e",
                "-s"
            ], {
                cwd: process.env.BO_GLOBAL_SYSTEM_CACHE_DIR,
                env: env,
                stdio: [
                    "pipe",
                    "inherit",
                    "inherit"
                ],
                input: commands.join("\n")
            });
            if (result.error) {
                throw result.error;
            }
    
            process.stdout.write("<<<TEST_MATCH_IGNORE\n");
   
            return lookup(id, true);
        }

        return PATH.join(found, "_#_org.bashorigin_#_" + idParts[2] + ".js");
    }

    var path = lookup(id);

    if (!FS.existsSync(path)) {
        throw new Error("No file found at derived path '" + path + "' for id '" + id + "'!");
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
