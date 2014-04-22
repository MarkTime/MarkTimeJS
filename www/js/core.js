/// <reference path="api/api.ts" />
/// <reference path="plugins/plugins.ts" />
var Core;
(function (Core) {
    function include(file, execute, error) {
        if (typeof execute === "undefined") { execute = defaultExecute; }
        if (typeof error === "undefined") { error = defaultError; }
        $.ajax({
            url: file,
            success: execute,
            error: function (xhr, status, error) {
                error(status, error, file, xhr);
            }
        });
    }
    Core.include = include;

    /**
    * Compares two version strings (formatted like "x.x.x")
    * Converted to TypeScript from http://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
    */
    function versionCompare(v1, v2, options) {
        var lexicographical = options && options.lexicographical, zeroExtend = options && options.zeroExtend, v1parts = v1.split('.'), v2parts = v2.split('.');

        function isValidPart(x) {
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
            return NaN;
        }

        if (zeroExtend) {
            while (v1parts.length < v2parts.length)
                v1parts.push("0");
            while (v2parts.length < v1parts.length)
                v2parts.push("0");
        }

        if (!lexicographical) {
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);
        }

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length == i)
                return 1;

            if (v1parts[i] == v2parts[i])
                continue;
            else if (v1parts[i] > v2parts[i])
                return 1;
            else
                return -1;
        }

        if (v1parts.length != v2parts.length)
            return -1;
        return 0;
    }
    Core.versionCompare = versionCompare;

    function defaultExecute(content) {
        $("<script></script>").appendTo("head").text(content);
    }
    function defaultError(status, error, file) {
        status[0] = status[0].toUpperCase();
        throw new Error(status + " while including '" + file + "' " + error);
    }
})(Core || (Core = {}));
