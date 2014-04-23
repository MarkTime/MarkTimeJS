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

    /**
     * Checks whether an API exists
     * @param string name Name of the API
     * @return boolean Whether the API exists
     */
    function has(name) {
        return apis.hasOwnProperty(name);
    }
    API.has = has;
    
    /**
     * This function returns a list of all registered APIs
     * @return array List of all registered APIs  
     */
    function getAPINames(){
        var keys = [];
        for(var k in apis) keys.push(k);
        return keys;
    }
    API.getAPINames = getAPINames;
    
    /**
     * This function returns all registered apis
     * @return object All registered apis   
     */
    function getAPIs(){
        return apis;
    }
    API.getAPIs = getAPIs;
    
    /**
     * Little debugging function John added
     * He used it call to see if he correctly included the api.js file 
     */
    function respond(){
    	console.log("I'm here!");
    }
    API.respond = respond;

    /**
     * Gets an instance of an API 
     * @param string name Name of the API to get
     * @return object instance of the requested API
     */
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
            Core.include("js/api/" + name.toLowerCase() + ".js", undefined, function () {
                throw new Error("An API with the specified name could not be found (name was " + name + ")");
            });
        }
        return apis[name].apply(plugin, parameters);
    }
})(API || (API = {}));
