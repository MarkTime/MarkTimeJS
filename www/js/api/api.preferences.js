/**
 * Preferences API
 *
 * @author Tom Barham me@mrfishie.com
 * @version 1.0
 */

if (!API) Core.InitializeAPI();

if (!API.has("Preferences")) {
    API.add("Preferences", function(plugin, group) {
        var prefs = plugins.appPreferences, creator = null, access = false;
        doesExist();
        
        /**
         * Finds if the plugin exists
         *
         * @returns bool If the plugin exists.
         */
        this.exists = function() { return exists; };
        
        /**
         * Request access to the group
         *
         * @returns bool If access is accepted.
         */
        this.request = function() {
            if (creator && creator !== plugin.toLowerCase()) return false;
            else if (!creator) {
                prefs.store(function(val) {
                    this.creator = val;
                }, this.onError, group, "__perms", plugin.toLowerCase());
            }
            access = true;
            return true;
        };
        
        /**
         * Get a key from the preferences
         * 
         * @param string key Key to get from
         * 
         * @throws appPreferences failed to respond in time
         * @returns the value from the preferences
         */
        this.get = function(key) {
            verify();
            
            var v = undefined;
            prefs.fetch(function(val) {
                v = val;
            }, this.onError, group, key);
            response(v);
            
            return v;
        };
        
        /**
         * Set a key from the preferences
         *
         * @param string key Key to set value from
         * @param value Value to set key to
         *
         * @throws appPreferences failed to respond in time
         * @returns the value from the preferences
         */
        this.set = function(key, value) {
            verify();
            
            var v = undefined;
            prefs.store(function(val) {
                v = val;
            }, this.onError, group, key, value);
            response(v);
            
            return v;
        };
        
        /**
         * Gets a key from the preferences
         * If it doesn't exist then sets it to the inputted value
         *
         * @param string key Key to get from
         * @param value Value to set key to
         *
         * @throws appPreferences failed to respond in time
         * @returns the value from the preferences
         */
        this.cache = function(key, value) {
            if (this.exists(key)) return this.get(key);
            else return this.set(key, value);
        };
        
        /**
         * Finds if a key exists
         *
         * @param string key Key to find
         *
         * @throws appPreferences failed to respond in time
         * @returns bool Whether the key exists
         */
        this.exists = function(key) {
            verify();
            
            var v = undefined;
            prefs.fetch(function() {
                v = true;
            }, function() {
                v = false;
            }, group, key);
            response(v);
        };
        
        /**
         * The function to be called when an error occurs
         *
         * @param string error A string explaining the error
         *
         * @throws Failed to access preferences: error
         */
        this.onError = function(error) {
            throw "Failed to access preferences: " + error;
        };
        
        function doesExist() {
            var r = undefined;
            prefs.fetch(function(val) {
                this.exists = function() { return true; };
                creator = val;
            }, function() {
                this.exists = function() { return false; };
            }, group, "__perms");
        };
        
        function verify() {
            if (access) this.onError("Access denied");
        };
        function response(v) {
            if (v === undefined) throw "appPreferences failed to respond in time";
        };
    });
}