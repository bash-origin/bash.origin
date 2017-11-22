
const PATH = require("path");
const FS = require("fs");


exports.depend = function (id, config) {

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
    } else
    if (/^to\.pinf\./.test(idParts[1])) {
        subPaths.push("github.com~pinf-to~" + idParts[1]);
    } else
    if (/^bash\.origin\./.test(idParts[1])) {
        subPaths.push("github.com~bash-origin~" + idParts[1]);
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
        throw new Error("Could not locate package for id '" + id + "' in lookup paths '" + lookupPaths.join(", ") + "'!");
    }

    var path = PATH.join(found, "_#_org.bashorigin_#_" + idParts[2] + ".js");

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

    var keys = Object.keys(obj);

    var implId = keys[0].replace(/^@/, "");
    var implConfig = obj[keys[0]];

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
