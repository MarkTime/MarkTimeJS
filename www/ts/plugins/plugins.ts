module Plugins {
    var config: Object = API.get("Configuration", "plugin.config").load({
        "folder_root": "/marktime/plugins/",
        "file_list": "list.json",
        "file_default": "plugin.js",

        "default_name": "Generic Plugin",
        "default_version": "1.0.0",
        "default_description": "<em>No Description</em>",
        "default_authors": [],
        "default_dependencies": {}
    }), loadedPlugins: Object = {};

    export function getPlugin(name: string): Plugin {
        name = name.toLowerCase();
        if (loadedPlugins.hasOwnProperty(name)) return loadedPlugins[name];
        var p: Plugin = new Plugin(name);
        loadedPlugins[p.name] = name;
        return p;
    }

    export function list(): Plugin[] {
        var list: string[] = API.get("File").read(config["folder_root"] + config["file_list"], "json");
        return list.map(function (value: string): Plugin {
            return Plugins.getPlugin(value);
        });
    }

    export function eventAll(name: string, ...parameters: any[]): void {
        var pname: string;
        for (pname in loadedPlugins) {
            if (loadedPlugins.hasOwnProperty(pname)) {
                var n: any[] = parameters.slice();
                n.unshift(name);
                loadedPlugins[pname].event.apply(loadedPlugins[pname], n);
            }
        }
    }

    export function loadAll(): void {
        var list: Plugin[] = Plugins.list();
        Plugins.eventAll("load");
    }

    export function unloadAll(): void {
        Plugins.eventAll("unload");
    }

    var pluginProperties: Object = {
        "name": config["default_name"],
        "version": config["default_version"],
        "description": config["default_description"],
        "authors": config["authors"],
        "dependencies": config["dependencies"]
    };
    export class Plugin {
        public name: string;
        public path: string;

        private plugin: any;

        constructor(name: string) {
            this.path = config["folder_root"] + encodeURIComponent(name) + "/";
            this.name = name;

            var path: string = this.path + config["file_default"];
            var content: string = API.get("File").read(path);
            sandboxer(content, API.pluginContext(this));
            this.plugin = API.getPlugin(this);

            if (!this.plugin.hasOwnProperty("properties")) throw new Error("The plugin " + name + " is invalid (contains no 'properties' field)");
            var propertyName: string;
            for (propertyName in pluginProperties) {
                this[propertyName] = this.plugin["properties"][propertyName] || pluginProperties[propertyName];
            }

            var dependencies: Object = this["dependencies"], pname: string;
            for (pname in dependencies) {
                if (dependencies.hasOwnProperty(pname)) {
                    var dependency: string = pname;

                    var dplugin: Plugin = Plugins.getPlugin(dependency);
                    if (Core.versionCompare(dependencies[dependency], dplugin["version"], { lexicographical: true }) < 0) throw new Error(this.name + " requires a newer version of " + dplugin.name + " (current version is " + dplugin["version"] + ", required version is " + dependencies[dependency] + ")");
                    else dplugin.load();
                }
            }
        }

        public load(): void {
            API.get("Events", "load").triggerPlugin(this);
        }

        public unload(): void {
            API.get("Events", "unload").triggerPlugin(this);
        }

        public event(name: string, ...parameters: any[]) {
            var evt: any = API.get("Events", "unload");
            evt.triggerPlugin.apply(evt, parameters);
        }
    }

    function sandboxer(__code: string, API: Object): any {
        eval(__code);
    }

    export interface Author {
        name: string;
        email?: string;
        url?: string;
    }
}