
const PATH = require("path");
const FS = require("fs");


exports.depend = function (id, config) {

    var idParts = id.match(/^([^#]+)#(.+)$/);

    if (!idParts) {
        throw new Error("No API Contract specified! Use '" + id + "#<uri>'.");
    }

    var BO_PLUGIN_SEARCH_DIRPATHS = process.env.BO_PLUGIN_SEARCH_DIRPATHS;

    if (!BO_PLUGIN_SEARCH_DIRPATHS) {
        throw new Error("'BO_PLUGIN_SEARCH_DIRPATHS' not set!");
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

