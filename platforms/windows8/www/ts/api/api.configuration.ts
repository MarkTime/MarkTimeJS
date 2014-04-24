(function () {
    API.add("Configuration", function (dictionary: string = "__config"): void {
        var plugin: Plugins.Plugin = this, pref = API.get("Preferences", dictionary);

        this.load = function (obj: Object): Object {
            var key: string, ret: Object;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = pref.cache(key, obj[key]);
                }
            }
            return ret;
        }

        this.get = function (key: string): string {
            return pref.get(key);
        }

        this.set = function (key: string, value: string): string {
            return pref.set(key, value);
        }

        this.default = function (key: string, value: string): string {
            return pref.default(key, value);
        }

        this.preferences = pref;
    });
} ());