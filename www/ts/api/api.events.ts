(function () {
    var events: Object = {};

    API.add("Events", function (event: string) {
        var plugin: Plugins.Plugin = this, namespace = (plugin.name === "MarkTime") ? "" : (plugin.name + ".");
        if (!events.hasOwnProperty(event)) events[event] = [];

        this.subscribe = function (callback: Function): void {
            var pname: string = plugin.name.toLowerCase();
            if (!events.hasOwnProperty(pname)) events[pname] = {};
            if (!events[pname].hasOwnProperty(event)) events[pname][event] = [];

            events[pname][event].push(callback);
        }
        this.unsubscribe = function (callback: Function): void {
            var eventlist: Array<Function> = events[event];
            var index: number = eventlist.indexOf(callback);
            if (index > -1) eventlist.splice(index, 1);
        }
        this.trigger = function (...parameters: string[]): void {
            var pluginName: string;
            for (pluginName in events) {
                if (events.hasOwnProperty(pluginName)) {
                    triggerFill(pluginName, parameters);
                }
            }
        }

        if (plugin.name === "MarkTime") {
            this.triggerPlugin = function (plugin: Plugins.Plugin, ...parameters: string[]): void {
                return triggerFill(plugin.name.toLowerCase(), parameters);
            }
        }

        function triggerFill(p: string, parameters: string[]): void {
            if (!events.hasOwnProperty(p)) events[p] = {};
            var pevents: Object = events[p], eventname: string = namespace + event;

            if (pevents.hasOwnProperty(eventname)) {
                var eventlist: Array<Function> = pevents[eventname];
                eventlist.forEach(function (value: Function) {
                    value.apply(plugin, parameters);
                });
            }
        }
    });
}());