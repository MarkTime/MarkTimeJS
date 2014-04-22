var Plugins;
(function (Plugins) {
    var pref = API.get("Preferences", "Plugins");
    var pluginPath = pref.cache("plugin_folder", "/marktime/plugins/");

    function getPlugin(name) {
        return new Plugin(name);
    }
    Plugins.getPlugin = getPlugin;

    var pluginProperties = {
        "name": "Generic Plugin",
        "version": "1.0.0",
        "description": "<em>No Description</em>",
        "authors": [],
        "dependencies": {},
        "files": {}
    };
    var Plugin = (function () {
        function Plugin(name) {
            this.path = pluginPath + encodeURIComponent(name) + "/";
            this.name = name;

            var path = this.path + "/plugin.js";
            var content = API.get("File").read(path);
            sandboxer(content, API.pluginContext(this));
            this.plugin = API.getPlugin(this);

            if (!this.plugin.hasOwnProperty("properties"))
                throw new Error("The plugin " + name + " is invalid (contains no 'properties' field)");
            var propertyName;
            for (propertyName in pluginProperties) {
                this[propertyName] = this.plugin["properties"][propertyName] || pluginProperties[propertyName];
            }
            // TODO
        }
        return Plugin;
    })();
    Plugins.Plugin = Plugin;

    function sandboxer(__code, API) {
        eval(__code);
    }
})(Plugins || (Plugins = {}));
