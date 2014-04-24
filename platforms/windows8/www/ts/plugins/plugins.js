﻿var Plugins;
(function (Plugins) {
    var config = API.get("Configuration", "plugin.config").load({
        "folder_root": "/marktime/plugins/",
        "file_list": "list.json",
        "file_default": "plugin.js",
        "default_name": "Generic Plugin",
        "default_version": "1.0.0",
        "default_description": "<em>No Description</em>",
        "default_authors": [],
        "default_dependencies": {}
    }), loadedPlugins = {};

    function getPlugin(name) {
        name = name.toLowerCase();
        if (loadedPlugins.hasOwnProperty(name))
            return loadedPlugins[name];
        var p = new Plugin(name);
        loadedPlugins[p.name] = name;
        return p;
    }
    Plugins.getPlugin = getPlugin;

    function list() {
        var list = API.get("File").read(config["folder_root"] + config["file_list"], "json");
        return list.map(function (value) {
            return Plugins.getPlugin(value);
        });
    }
    Plugins.list = list;

    function eventAll(name) {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            parameters[_i] = arguments[_i + 1];
        }
        var pname;
        for (pname in loadedPlugins) {
            if (loadedPlugins.hasOwnProperty(pname)) {
                var n = parameters.slice();
                n.unshift(name);
                loadedPlugins[pname].event.apply(loadedPlugins[pname], n);
            }
        }
    }
    Plugins.eventAll = eventAll;

    function loadAll() {
        var list = Plugins.list();
        Plugins.eventAll("load");
    }
    Plugins.loadAll = loadAll;

    function unloadAll() {
        Plugins.eventAll("unload");
    }
    Plugins.unloadAll = unloadAll;

    var pluginProperties = {
        "name": config["default_name"],
        "version": config["default_version"],
        "description": config["default_description"],
        "authors": config["authors"],
        "dependencies": config["dependencies"]
    };
    var Plugin = (function () {
        function Plugin(name) {
            this.path = config["folder_root"] + encodeURIComponent(name) + "/";
            this.name = name;

            var path = this.path + config["file_default"];
            var content = API.get("File").read(path);
            sandboxer(content, API.pluginContext(this));
            this.plugin = API.getPlugin(this);

            if (!this.plugin.hasOwnProperty("properties"))
                throw new Error("The plugin " + name + " is invalid (contains no 'properties' field)");
            var propertyName;
            for (propertyName in pluginProperties) {
                this[propertyName] = this.plugin["properties"][propertyName] || pluginProperties[propertyName];
            }

            var dependencies = this["dependencies"], pname;
            for (pname in dependencies) {
                if (dependencies.hasOwnProperty(pname)) {
                    var dependency = pname;

                    var dplugin = Plugins.getPlugin(dependency);
                    if (Core.versionCompare(dependencies[dependency], dplugin["version"], { lexicographical: true }) < 0)
                        throw new Error(this.name + " requires a newer version of " + dplugin.name + " (current version is " + dplugin["version"] + ", required version is " + dependencies[dependency] + ")");
                    else
                        dplugin.load();
                }
            }
        }
        Plugin.prototype.load = function () {
            API.get("Events", "load").triggerPlugin(this);
        };

        Plugin.prototype.unload = function () {
            API.get("Events", "unload").triggerPlugin(this);
        };

        Plugin.prototype.event = function (name) {
            var parameters = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                parameters[_i] = arguments[_i + 1];
            }
            var evt = API.get("Events", "unload");
            evt.triggerPlugin.apply(evt, parameters);
        };
        return Plugin;
    })();
    Plugins.Plugin = Plugin;

    function sandboxer(__code, API) {
        eval(__code);
    }
})(Plugins || (Plugins = {}));