/// <reference path="api.events.ts" />
/// <reference path="api.preferences.ts" />
/// <reference path="api.file.ts" />

module API {
    var apis: Object = {}, plugins: Object = {};

    export function add(name: string, api: Function): void {
        name = name.toLowerCase();
        if (apis.hasOwnProperty(name) || name === "marktime") throw new Error("An API with the specified name already exists (name was " + name + ")");
        apis[name] = api;
    }

    export function has(name: string): boolean {
        return apis.hasOwnProperty(name);
    }

    export function get(name: string, ...parameters: any[]): any {
        return getAPI(name, parameters, new Plugins.Plugin("MarkTime"));
    }

    export function getPlugin(plugin: Plugins.Plugin): any {
        var p = plugins[plugin.name.toLowerCase()];
        return p.apply(p);
    }

    export function pluginContext(plugin: Plugins.Plugin): Object {
        return {
            "has": this.has,
            "get": function (name: string, ...parameters: any[]): any {
                return getAPI(name, parameters, plugin);
            },
            "plugin": function (f: Function): void {
                if (typeof f !== "function") throw new Error("API.plugin() expects a function, not a " + typeof f);
                if (apis.hasOwnProperty(plugin.name.toLowerCase())) throw new Error("A plugin with the specified name already exists (name was " + plugin.name + ")");
                apis[plugin.name.toLowerCase()] = f;
            }
        };
    }

    function getAPI(name: string, parameters: any[], plugin: Plugins.Plugin): any {
        name = name.toLowerCase();
        if (!apis.hasOwnProperty(name)) {
            Core.include("js/api/api." + name.toLowerCase() + ".js", undefined, function () {
                throw new Error("An API with the specified name could not be found (name was " + name + ")");
            });
        }
        return (<Function>apis[name]).apply(plugin, parameters);
    }
}