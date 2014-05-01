(function () {
    API.add("Configuration", function (dictionary) {        
        if (typeof dictionary === "undefined") { dictionary = "__config"; }
        var plugin = this, pref = API.get("Preferences", dictionary);
        
        var Configuration = {};
        Configuration.load = function (obj) {
            console.log("[Configuration] Loading config keys in dictionary " + plugin.name + "." + dictionary);
            
            var key, ret = {}, count = 0;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = pref.default(key, obj[key]);
                    count++;
                }
            }
            console.log("[Configuration] loaded " + count + " keys");
            return ret;
        };

        Configuration.get = function (key) {
            return pref.get(key);
        };

        Configuration.set = function (key, value) {
            return pref.set(key, value);
        };

        Configuration.default = function (key, value) {
            return pref.default(key, value);
        };

        Configuration.preferences = pref;
        
        return Configuration;
    });
}());
