(function () {
    API.add("Preferences", function (group) {
        var prefs = plugins.appPreferences, creator = null, access = false, plugin = this, exists = false, error = false;
        var permsKey = "__perms";
        
        initialize();
        
        this.name = group;
        group = plugin.name + "." + group;
        
        if (Core.debug) {
            prefs = {
                "fetch": function(success, error, group, key) {
                    success(group + "." + key);
                },
                "store": function() {
                    
                }
            };
            (function() {
                var keys = {};
                prefs = {
                    "fetch": function(success, error, group, key) {
                        if (!keys.hasOwnProperty(group + "." + key)) keys[group + "." + key] = group + "." + key;
                        success(keys[group + "." + key]);
                    },
                    "store": function(success, error, group, key, value) {
                        keys[group + "." + key] = value;
                        
                    }
                };
            }());
        }
        
        this.get = function (key) {
            console.log("Getting key " + key + " in dictionary " + group);
            
            if (key.toLowerCase() === permsKey) {
                this.onError("Access denied");
                return;
            }
            
            var v = undefined;
            prefs.fetch(function (val) {
                v = val;
            }, this.onError, group, key);
            
            while (typeof v === 'undefined' && !error) {
            }
            error = false;
            
            return v;
        };
            
        this.set = function (key, value) {
            console.log("Setting key " + key + " to " + value.length + " characters in dictionary " + group);
            
            if (key.toLowerCase() == permsKey) {
                this.onError("Access denied");
                return;
            }
            
            var v = undefined;
            prefs.store(function (val) {
                v = val;
            }, this.onError, group, key, value);
            
            while (typeof v === 'undefined' && !error) {
            }
            error = false;

            return v;
        };

        this.default = function (key, value) {
            if (this.exists(key))
                return this.get(key);
            else
                return this.set(key, value);
        };

        this.exists = function (key) {
            if (typeof key === 'undefined')
                return exists;
            if (verify())
                return;

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

        this.onError = function (error) {
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
    });
}());
