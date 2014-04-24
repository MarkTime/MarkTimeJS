(function () {
    API.add("Preferences", function (group: string): void {
        var prefs: Object = plugins.appPreferences, creator: string = null, access: boolean = false, plugin: Plugins.Plugin = this, exists: boolean = false, error: boolean = false;
        var permsKey: string = "__perms";

        initialize();

        this.name = group;
        group = plugin.name + "." + group;

        this.get = function (key: string): string {
            if (key.toLowerCase() === permsKey) {
                this.onError("Access denied");
                return;
            }

            var v: string = undefined;
            prefs.fetch(function (val: string): void {
                v = val;
            }, this.onError, group, key);

            while (typeof v === 'undefined' && !error) { }
            error = false;

            return v;
        }

        this.set = function (key: string, value: string): string {
            if (key.toLowerCase() == permsKey) {
                this.onError("Access denied");
                return;
            }

            var v: string = undefined;
            prefs.store(function (val: string): void {
                v = val;
            }, this.onError, group, key, value);

            while (typeof v === 'undefined' && !error) { }
            error = false;

            return v;
        }

        this.default = function (key: string, value: string): string {
            if (this.exists(key)) return this.get(key);
            else return this.set(key, value);
        }

        this.exists = function (key?: string): boolean {
            if (typeof key === 'undefined') return exists;
            if (verify()) return;

            var v: any = undefined;
            prefs.fetch(function (): void {
                v = true;
            }, function (): void {
                v = false;
            }, group, key);

            while (typeof v === 'undefined' && !error) { }
            error = false;

            return v;
        }

        this.onError = function (error: string): void {
            throw new Error("Failed to access preferences: " + error);
        }

        function initialize(): void {
            var complete: boolean = false;
            prefs.fetch(function (val: string): void {
                exists = true;
                complete = true;
            }, function (): void {
                exists = false;
                complete = true;
            }, group, permsKey);

            while (!complete && !error) { }
            error = false;
        }
    });
} ());