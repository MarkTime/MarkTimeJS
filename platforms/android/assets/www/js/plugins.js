var Plugins = {};

(function() {
    /**
     * Tom's attempt at making parameters that are unlikely to be used in plugin code
     */
    Plugins.sandboxer = function(_993807930, outscope, API) {
        for (var loopid = 0; loopid < outscope; loopid++) {
            eval("var " + outscope[loopid] + " = null;");
        }
        loopid = null;
        outscope = null;
        
        eval(_993807930);
    }
}());

(function() {
    var Default = {
        "name": "MarkTime",
        "version": "1.0.0",
        "description": "MarkTime is an app to help with the administration of a Boy's Brigade Company.",
        "authors": [
            {
                "name": "John Board",
            },
            {
                "name": "Nicholas Thorne"
            },
            {
                "name": "Tom Barham"
            }
        ],
        "dependencies": { },
        "path": "/MarkTime/plugins/MarkTime"
    };
    Plugins.Default = Default;
    
    console.log("[Plugins] Loading default Plugin configuration");
    
    var config = API.get("Configuration", "plugin.config").load({
        "folder_root": "/MarkTime/plugins/",
        "file_list": "list.json",
        "file_default": "plugin.js",
        "default_name": "Generic Plugin",
        "default_version": "1.0.0",
        "default_description": "<em>No Description</em>",
        "default_authors": [],
        "default_dependencies": {}
    }), loadedPlugins = {};

    function getPlugin(name) {
        console.log("[Plugins] Getting plugin " + name);
        
        name = name.toLowerCase();
        if (loadedPlugins.hasOwnProperty(name))
            return loadedPlugins[name];
        var p = new Plugin(name);
        loadedPlugins[p.name] = name;
        return p;
    }
    Plugins.getPlugin = getPlugin;

    function list() {
        console.log("[Plugins] Getting a list of plugins");
        
        var list = API.get("File").read(config["folder_root"] + config["file_list"], "json");
        return list.map(function (value) {
            return Plugins.getPlugin(value);
        });
    }
    Plugins.list = list;

    function eventAll(name) {
        console.log("[Plugins] Triggering event " + name + " on all plugins");
        
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
        console.log("[Plugins] Loading all plugins");
        
        var list = Plugins.list();
        Plugins.eventAll("load");
    }
    Plugins.loadAll = loadAll;

    function unloadAll() {
        console.log("[Plugins] Unloading all plugins");
        
        Plugins.eventAll("unload");
    }
    Plugins.unloadAll = unloadAll;
    
    /**
     * By default, the following global variables are denied from the sandbox:
     * Plugins      - Prevents loading/firing events on all plugins
     * $            - Prevents jQuery access
     * jQuery       - Same as $
     * Utils        - Prevents file including
     * FastClick    - Prevents FastClick access
     * Core         - Prevents MarkTime Core access
     * document     - Prevents HTML modifying
     * Document     - Same as document
     */
    var sandboxed = [
        "Plugins",
        "$",
        "jQuery",
        "Utils",
        "FastClick",
        "Core",
        "document",
        "Document"
    ];
    Plugins.addsandbox = function(i) { sandboxed.push(i); }

    var pluginProperties = {
        "name": config["default_name"],
        "version": config["default_version"],
        "description": config["default_description"],
        "authors": config["authors"],
        "dependencies": config["dependencies"]
    };
    var Plugin = (function () {
        function Plugin(name) {
            console.log("[Plugins] Creating plugin " + name);
            
            this.path = config["folder_root"] + encodeURIComponent(name) + "/";
            this.name = name;
            
            var path = this.path + config["file_default"];
            var content = API.get("File").read(path);
            
<<<<<<< HEAD
            console.log("Executing plugin in sandbox...");
=======
            console.log("[Plugins] Executing plugin in sandbox...");
>>>>>>> 4a2f27d7eb4458a3668cd29fdaad80c002e18890
            Plugins.sandboxer(content, sandboxed.slice(0), API.pluginContext(this));
            this.plugin = API.getPlugin(this);
            
            if (!this.plugin.hasOwnProperty("properties"))
                throw new Error("The plugin " + name + " is invalid (contains no 'properties' field)");
            var propertyName;
            for (propertyName in pluginProperties) {
                this[propertyName] = this.plugin["properties"][propertyName] || pluginProperties[propertyName];
            }
            
            var dependencies = this["dependencies"], pname;
            
            console.log("[Plugins] Loading plugin dependencies...");
            for (pname in dependencies) {
                if (dependencies.hasOwnProperty(pname)) {
                    var dependency = pname;
                    
                    var dplugin = Plugins.getPlugin(dependency);
                    if (Utils.versionCompare(dependencies[dependency], dplugin["version"], { lexicographical: true }) < 0)
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
}());