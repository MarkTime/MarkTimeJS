/// <reference path="api.events.ts" />
/// <reference path="api.preferences.ts" />
/// <reference path="api.file.ts" />
/// <reference path="api.configuration.ts" />
var API;
(function (API) {
    var apis = {}, plugins = {};

    function add(name, api) {
        name = name.toLowerCase();
        if (apis.hasOwnProperty(name) || name === "marktime")
            throw new Error("An API with the specified name already exists (name was " + name + ")");
        apis[name] = api;
    }
    API.add = add;

    function has(name) {
        return apis.hasOwnProperty(name);
    }
    API.has = has;

    function get(name) {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            parameters[_i] = arguments[_i + 1];
        }
        return getAPI(name, parameters, new Plugins.Plugin("MarkTime"));
    }
    API.get = get;

    function getPlugin(plugin) {
        var p = plugins[plugin.name.toLowerCase()];
        return p.apply(p);
    }
    API.getPlugin = getPlugin;

    function pluginContext(plugin) {
        return {
            "has": this.has,
            "get": function (name) {
                var parameters = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    parameters[_i] = arguments[_i + 1];
                }
                return getAPI(name, parameters, plugin);
            },
            "plugin": function (f) {
                if (typeof f !== "function")
                    throw new Error("API.plugin() expects a function, not a " + typeof f);
                if (apis.hasOwnProperty(plugin.name.toLowerCase()))
                    throw new Error("A plugin with the specified name already exists (name was " + plugin.name + ")");
                apis[plugin.name.toLowerCase()] = f;
            }
        };
    }
    API.pluginContext = pluginContext;

    function getAPI(name, parameters, plugin) {
        name = name.toLowerCase();
        if (!apis.hasOwnProperty(name)) {
            Core.include("js/api/api." + name.toLowerCase() + ".js", undefined, function () {
                throw new Error("An API with the specified name could not be found (name was " + name + ")");
            });
        }
        return apis[name].apply(plugin, parameters);
    }
})(API || (API = {}));
