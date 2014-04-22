(function () {
    API.add("Configuration", function (dictionary) {
        if (typeof dictionary === "undefined") { dictionary = "__config"; }
        var plugin = this, pref = API.get("Preferences", dictionary);

        this.load = function (obj) {
            var key, ret;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = pref.cache(key, obj[key]);
                }
            }
            return ret;
        };

        this.get = function (key) {
            return pref.get(key);
        };

        this.set = function (key, value) {
            return pref.set(key, value);
        };

        this.default = function (key, value) {
            return pref.default(key, value);
        };

        this.preferences = pref;
    });
}());
