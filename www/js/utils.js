/// <reference path="api/api.ts" />
/// <reference path="plugins/plugins.ts" />
var Utils;
(function (Utils) {
	/** 
	 * Loads a list of javascript files
	 * @param array files Array of strings which are URLs of the javascript files to include
	 * @param execute function Callback to call when the files have been loaded
	 * @param error function Callback to call if an error occurs
	 */
	//TODO: Implement multi-file loading, rather than just a single file
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
    Utils.include = include;

    /**
    * Compares two version strings (formatted like "x.x.x")
    * Converted to TypeScript from http://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
    */
    function versionCompare(v1, v2, options) {
        if (typeof options === "undefined") { options = {}; }
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
    Utils.versionCompare = versionCompare;

    function defaultExecute(content) {
        $("<script></script>").appendTo("head").text(content);
    }
    function defaultError(status, error, file) {
        status[0] = status[0].toUpperCase();
        throw new Error(status + " while including '" + file + "' " + error);
    }
})(Utils || (Utils = {}));
