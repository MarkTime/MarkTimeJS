(function() {
    /**
     * Preferences API
     *
     * Provides nearly-asynchronous functions that can be used to handle preferences and configuration
     *
     * @author Tom Barham <me@mrfishie.com>
     */
    API.add("Preferences", function(dictionary, readonly) {
        var plugin = this, pluginhash = Utils.hashCode(plugin.name).toString(), cache = [], file = API.get("File"), ready = false;
        
        var Preferences = {};
        
        /**
         * Gets a value from the preferences
         *
         * @param {String} key The key to get
         * @returns {String} The value from the preferences
         */
        Preferences.get = function(key, callback) {
            callback = callback || function() { };
            
            if (!ready) waitForReady(function() {
                var val = Preferences.get(key);
                callback(val);
            });
            else {
                console.log("[Preferences] Getting key " + key + " in dictionary " + dictionary);
                
                if (!cache[dictionary].hasOwnProperty(key)) return Preferences.onError("No key called " + key + " exists");
                
                callback(cache[dictionary][key]);
                return cache[dictionary][key];
            }
            return null;
        }
        
        /**
         * Sets a value in the preferences
         *
         * @param {String} key The key to set
         * @param value The value to set
         * @returns The value that was set
         */
        Preferences.set = function(key, value, callback) {
            if (readonly) return Preferences.onError("Setting is not supported in read-only mode.");
            
            if (!ready) waitForReady(function() {
                var val = Preferences.set(key);
                callback(val);
            });
            else {
                console.log("[Preferences] Setting key " + key + " to " + value.length + " characters in dictionary " + dictionary);
                
                cache[dictionary][key] = value;
                
                changeCount++;
                if (changeCount > maxChangeTimeout) Preferences.save();
                
                callback(value);
                return value;
            }
            return null;
        }
        
        /**
         * Finds if a key exists
         *
         * @param {String} key The key to find
         * @returns {Boolean} Whether the key exists
         */
        Preferences.exists = function(key, callback) {
            if (!ready) waitForReady(function() {
                var val = Preferences.exists(key);
                callback(val);
            });
            else return cache[dictionary].hasOwnProperty(key);
            return null;
        }
        
        /**
         * If the key exists, gets it, otherwise sets it
         *
         * @param {String} key The key to find
         * @param value The value to set it to
         * @returns The value
         */
        Preferences.default = function(key, value, callback) {
            if (!ready) waitForReady(function() {
                var val = Preferences.default(key, value);
                callback(val);
            });
            else {
                if (Preferences.exists(key)) return Preferences.get(key);
                else return Preferences.set(key, value);
            }
            return null;
        }
        
        // Autosave system
        var changeCount = 0, saveTimeout = -1, timeoutPref, maxChangeTimeout;
        
        /**
         * Saves the preferences
         *
         * Preferences are saved in the plugins directory, with the following name:
         *
         *     prefs.<Plugin Hash>.json
         * 
         * Where <Plugin Hash> is a hash generated from the plugins name.
         *
         * By default, preferences are autosaved after a certain amount of time, or certain amount of modifications.
         * These amounts can be changed by changing the 'preferences.autosave.time' and 'preferences.autosave.maxchanges'
         * configuration values in the 'global' dictionary for Marktime:
         *
         * 'preferences.autosave.time'       - Integer, the amount of time to wait in-between each autosave. It is reset
         *                                     every time the preferences are saved.
         * 'preferences.autosave.maxchanges' - Integer, the amount of changes until the preferences will be saved. It is reset
         *                                     every time the preferences are saved. Setting values are the only modifications
         *                                     that increment the current amount of changes.
         *
         * @param {Function} callback A callback to call when the operation is complete
         * @returns The return value of the .onError function if an error occured, otherwise true
         */
        Preferences.save = function(callback) {
            if (readonly) return Preferences.onError("Saving is not supported in read-only mode.");
            
            clearTimeout(saveTimeout);
            if (changeCount > 0) {
                if (typeof callback === "undefined") callback = function() { }
                
                file.write("prefs." + pluginhash + ".json", function() {
                    callback();
                    
                    changeCount = 0;
                    saveTimeout = setTimeout(Preferences.save, timeoutPref);
                });
            } else saveTimeout = setTimeout(Preferences.save, timeoutPref);
            return true;
        }
        
        /**
         * Re-loads the preferences file
         *
         * Preferences are saved in the plugins directory, with the following name:
         *
         *     prefs.<Plugin Hash>.json
         *
         * Where <Plugin Hash> is a hash generated from the plugins name
         *
         * @param {Function} callback The callback to be called when the operation is complete.
         */
        Preferences.load = function(callback) {
            file.read("prefs." + pluginhash + ".json", function(contents) {
                cache = contents ? JSON.decode(contents) : {};
                if (!cache.hasOwnProperty(dictionary)) cache[dictionary] = {};
                
                callback();
            });
        }
        
        /**
         * Waits for the preferences to initially load, and then calls the callback.
         * If the preferences are already loaded, the callback will be executed
         * straight away.
         * 
         * Any amount of callbacks can be added with this function and still work.
         *
         * @param {Function} callback The callback to add
         */
        function waitForReady(callback) {
            if (!ready) readyCallbacks.push(callback);
            else callback();
        }
        Preferences.waitForReady = waitForReady;
        
        initialize();
        
        var readyCallbacks = [];
        function initialize() {
            Preferences.load(function() {                
                if (!readonly) {
                    var conf = API.getConfig();
                    conf.waitForReady(function() {
                        timeoutPref = conf.get("preferences.autosave.time");
                        maxChangeTimeout = conf.get("preferences.autosave.maxchanges");
                        saveTimeout = setTimeout(Preferences.save, timeoutPref);
                        
                        onDone();
                    });
                } else onDone();
                
                function onDone() {
                    ready = true;
                    for (var i = 0; i < readyCallbacks.length; i++) readyCallbacks[i]();
                }
            });
        }
        
        return Preferences;
    }, function(unit) {
        unit.expect(3);
        
        var prefs = API.get("Preferences", "test_dictionary"), aborted = false, iscomplete = false;
        prefs.waitForReady(function() { if (!aborted) {
            prefs.set("mykey", "thisAwesomeValue", function() {
                unit.assert(true, "Set callback called");
            });
            var val = prefs.get("mykey");
            unit.assert(val === "thisAwesomeValue", "Set/get succeeded");
            iscomplete = true;
        } });
        setTimeout(function() {
            if (!iscomplete) {
                unit.assert(false, "Dictionary loading time (should be <2s)");
                aborted = true;
            }
        }, 2000);
    });
}());