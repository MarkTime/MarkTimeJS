(function () {
    API.add("Preferences", function (group) {
        var prefs, creator = null, access = false, plugin = this, exists = false, error = false;
        var permsKey = "__perms";
        
        if (Core.debug) {
            console.log("[Preferences] Using preferences in debug mode");
            (function() {
                var keys = {};
                prefs = {
                    "fetch": function(success, error, group, key) {
                        if (!keys.hasOwnProperty(group + "." + key)) error("The specified key does not exist");
                        else success(keys[group + "." + key]);
                    },
                    "store": function(success, error, group, key, value) {
                        keys[group + "." + key] = value;
                        success(value);
                    }
                };
            }());
        } else prefs = plugins.appPreferences;
                
        initialize();
        
        var Preferences = {};
        Preferences.name = group;
        group = plugin.name + "." + group;
        
        Preferences.get = function (key) {
            console.log("    Getting key " + key + " in dictionary " + group);
            
            if (key.toLowerCase() === permsKey) {
                Preferences.onError("Access denied");
                return;
            }
            
            var v = undefined;
            prefs.fetch(function (val) {
                v = val;
            }, Preferences.onError, group, key);
            
            while (typeof v === 'undefined' && !error) {
            }
            error = false;
            
            return v;
        };
            
        Preferences.set = function (key, value) {
            console.log("    Setting key " + key + " to " + value.length + " characters in dictionary " + group);
            
            if (key.toLowerCase() == permsKey) {
                Preferences.onError("Access denied");
                return;
            }
            
            var v = undefined;
            prefs.store(function (val) {
                v = val;
            }, Preferences.onError, group, key, value);
            
            while (typeof v === 'undefined' && !error) {
            }
            error = false;

            return v;
        };

        Preferences.default = function (key, value) {
            if (Preferences.exists(key))
                return Preferences.get(key);
            else
                return Preferences.set(key, value);
        };

        Preferences.exists = function (key) {
            if (typeof key === 'undefined')
                return exists;

            var v = undefined;
            prefs.fetch(function () {
                v = true;
            }, function () {
                v = false;
            }, group, key);

            while (typeof v === 'undefined' && !error) {
            }
            error = false;

            return v;
        };

        Preferences.onError = function (error) {
            throw new Error("Failed to access preferences: " + error);
        };

        function initialize() {
            console.log("Initializing preferences dictionary " + group);
            
            var complete = false;
            prefs.fetch(function (val) {
                exists = true;
                complete = true;
            }, function () {
                exists = false;
                complete = true;
            }, group, permsKey);

            while (!complete && !error) {
            }
            error = false;
        }
        
        return Preferences;
    });
}());
