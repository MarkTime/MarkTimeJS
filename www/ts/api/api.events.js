(function () {
    var events = {};

    API.add("Events", function (event) {
        var plugin = this, namespace = (plugin.name === "MarkTime") ? "" : (plugin.name + ".");
        if (!events.hasOwnProperty(event))
            events[event] = [];

        this.subscribe = function (callback) {
            var pname = plugin.name.toLowerCase();
            if (!events.hasOwnProperty(pname))
                events[pname] = {};
            if (!events[pname].hasOwnProperty(event))
                events[pname][event] = [];

            events[pname][event].push(callback);
        };
        this.unsubscribe = function (callback) {
            var eventlist = events[event];
            var index = eventlist.indexOf(callback);
            if (index > -1)
                eventlist.splice(index, 1);
        };
        this.trigger = function () {
            var parameters = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                parameters[_i] = arguments[_i + 0];
            }
            var pluginName;
            for (pluginName in events) {
                if (events.hasOwnProperty(pluginName)) {
                    triggerFill(pluginName, parameters);
                }
            }
        };

        if (plugin.name === "MarkTime") {
            this.triggerPlugin = function (plugin) {
                var parameters = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    parameters[_i] = arguments[_i + 1];
                }
                return triggerFill(plugin.name.toLowerCase(), parameters);
            };
        }

        function triggerFill(p, parameters) {
            if (!events.hasOwnProperty(p))
                events[p] = {};
            var pevents = events[p], eventname = namespace + event;

            if (pevents.hasOwnProperty(eventname)) {
                var eventlist = pevents[eventname];
                eventlist.forEach(function (value) {
                    value.apply(plugin, parameters);
                });
            }
        }
    });
}());
