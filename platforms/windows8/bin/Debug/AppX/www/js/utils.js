var Utils;
(function (Utils) {
    
	/** 
	 * Loads a list of json files
	 * @param array files Array of strings which are URLs of the javascript files to include
	 * @param execute function Callback to call when the files have been loaded
	 * @param error function Callback to call if an error occurs
	 */
    function include(files, finishCallback, errorCallback) {
        if (typeof finishCallback === "undefined") { finishCallback = function() {}; }
        if (typeof errorCallback === "undefined") { errorCallback = defaultError; }
		if (!Array.isArray(files)) files = [files];
		
		var finished = 0;
		for(file in files){
			// Use a closure to avoid annoying async references
			(function() {
				console.log("[Utils] Including file " + files[file]);
				$.ajax({
					url: files[file],
					success: function(data, status, xhr){
						console.log("[Utils] Finished loading file " + files[file]);
						
						var split = files[file].toLowerCase().split(".");
						var ftype = split[split.length - 1] || split[0];
						
						if (includeTypes.hasOwnProperty(ftype)) {
							var r = includeTypes[ftype].call(xhr, data);
							if (typeof r !== 'undefined') data = r;
						}
						
						finished++;
						if (finished >= files.length) finishCallback(data, files[file]);
					},
					error: function (xhr, status, error) {
						console.log("Failed to load file " + files[file] + " because " + status + " " + error.stack);
						errorCallback(status, error, files[file], xhr);
					},
					dataType: "text"
				});
			}());
		}
    }
    Utils.include = include;
	
	var includeTypes = {
		"js": function(content) {
			var s = document.createElement("script");
			var c = document.createTextNode(content);
			s.appendChild(c);
			document.getElementsByTagName("head").item(0).appendChild(s);
		},
		"json": function(content) {
			return JSON.parse(content);
		}
	};
	Utils.includeTypes = includeTypes;

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
	
	function hashCode(text) {
		var hash = 0, i, chr, len;
		if (text.length === 0) return hash;
		for (i = 0, len = text.length; i < len; i++) {
			chr = text.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0;
		}
		return hash;
	}
	Utils.hashCode = hashCode;

    function defaultError(status, error, file) {
        status[0] = status[0].toUpperCase();
        throw new Error(status + " while including '" + file + "' " + error);
    }
})(Utils || (Utils = {}));
