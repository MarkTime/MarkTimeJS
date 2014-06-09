var API;
(function (API) {
    var apis = {}, plugins = {};
	
    function add(name, api, test) {
		test = test || (function(c) { c.assert(true); })
		
        name = name.toLowerCase();
		console.log("[API] Adding API " + name);
        if (apis.hasOwnProperty(name) || name === "marktime")
            throw new Error("An API with the specified name already exists (name was " + name + ")");
        apis[name] = {
			"constructor": api,
			"test": test
		};
    }
    API.add = add;

    /**
     * Checks whether an API exists
     * 
     * @param {string} name Name of the API
     * @returns {boolean} Whether the API exists
     */
    function has(name) {
        return apis.hasOwnProperty(name);
    }
    API.has = has;
    
    /**
     * This function returns a list of all registered APIs
     * 
     * @returns {array} List of all registered APIs  
     */
    function getAPINames(){
        var keys = [];
        for(var k in apis) keys.push(k);
        return keys;
    }
    API.getAPINames = getAPINames;
    
    /**
     * This function returns all registered apis
     * 
     * @returns {object} All registered apis   
     */
    function getAPIs(){
        return apis;
    }
    API.getAPIs = getAPIs;

    /**
     * Gets an instance of an API
     * 
     * @param {string} name Name of the API to get
     * @returns {object} instance of the requested API
     */
    function get(name) {
        var parameters = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            parameters[_i] = arguments[_i + 1];
        }
		
        return getAPI(name, parameters, Plugins.Default);
    }
    API.get = get;
	
	/**
	 * Tests an API
	 *
	 * @param {string} name Name of the API to test
	 * @param {Plugins.Plugin} plugin The plugin to test as
	 * @param {Function} callback Function to call on completion
	 */
	function test(name, plugin, callback) {
		console.log("[Test] Testing API '" + name + "' with plugin '" + plugin.name + "'");
		
		var func = getAPIObject(name).test, expect = 1, asserts = [], success = true, successcount = 0, failcount = 0;
		func.call(plugin, {
			"expect": function(i) {
				console.log("[Test] Expecting " + i + " asserts from API '" + name + "'");
				expect = i;
			},
			"assert": function(val, message) {
				asserts.push({
					"value": val,
					"message": message
				});
				if (!val) failcount++;
				else successcount++;
				
				if (!val || asserts.length >= expect) {
					console.log("[Test] API '" + name + "' passed " + successcount + " assert(s) and failed " + failcount + " assert(s)");
					callback(successcount, failcount, asserts);
				}
			}
		});
	}
	API.test = test;
	
	/**
	 * Tests all APIs together
	 *
	 * @param {Plugins.Plugin} plugin The plugin to test as
	 * @param {Function} callback Function to call on completion
	 */
	function testAll(plugin, callback) {
		console.log("[Test] Testing all APIs with plugin '" + plugin.name + "' (this should be the global plugin)");
		var apis = getAPINames(), count = 0, success = true, results = {};
		for (var i = 0; i < apis.length; i++) {
			// Use a closure to avoid annoying async references
			(function() {
				var name = apis[i];
				test(name, plugin, function(scount, fcount, info) {
					if (!scount) success = false;
					results[name] = info;
					
					count++;
					if (count >= apis.length) {
						callback(success, results);
					}
				});
			}());
		}
	}
	API.testAll = testAll;

    function getPlugin(plugin) {
		console.log("[API] Getting plugin " + plugin.name);
		
        var p = plugins[plugin.name.toLowerCase()];
        return p.apply(p);
    }
    API.getPlugin = getPlugin;
	
	function getConfig(type) {
		console.log("[API] Getting config for type " + type);
		
		if (typeof type === "undefined") type = "public";
		
		switch (type) {
			case "public": return get("Preferences", "public", true);
			default: throw new Error("The global configuration type " + type + " is not supported.");
		}
	}
	API.getConfig = getConfig;

    function pluginContext(plugin) {
		console.log("[API] Creating plugin context for " + plugin.name);
        return {
            "has": function() { return has.apply(this, arguments); },
            "get": function (name) {
                var parameters = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    parameters[_i] = arguments[_i + 1];
                }
                return getAPI(name, parameters, plugin);
            },
            "plugin": function (f) {
				console.log("[API] Adding plugin " + plugin.name);
				
                if (typeof f !== "function")
                    throw new Error("API.plugin() expects a function, not a " + typeof f);
                if (apis.hasOwnProperty(plugin.name.toLowerCase()))
                    throw new Error("A plugin with the specified name already exists (name was " + plugin.name + ")");
                apis[plugin.name.toLowerCase()] = f;
            },
			"getConfig": function() { return getConfig.apply(this, arguments); }
        };
    }
    API.pluginContext = pluginContext;
	
	function autoload(complete) {
		console.log("[API] Autoloading APIs...");
		Utils.include("js/apis/list.json", function(list) {
			list = list.map(function(n) {
				return "js/apis/" + n + ".js";
			});
			Utils.include(list, function() {
				console.log("[API] " + list.length + " APIs were loaded.");
				complete();
			});
		});
	}
	API.autoload = autoload;
	
	function getAPIObject(name) {
		name = name.toLowerCase();
		if (!apis.hasOwnProperty(name)) throw new Error("An API with the specified name has not yet been loaded (name was " + name + ")");
		return apis[name];
	}
	
    function getAPI(name, parameters, plugin) {
		console.log("[API] Getting API '" + name + "' as plugin '" + plugin.name + "' with " + parameters.length + " " + (parameters.length == 1 ? "parameter" : "parameters"));
		
        return getAPIObject(name).constructor.apply(plugin, parameters);
    }
})(API || (API = {}));
