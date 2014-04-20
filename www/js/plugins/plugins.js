/**
 * Core manager for plugins
 *
 * @author Tom Barham me@mrfishie.com
 * @version 0.1
 * @namespace Plugins
 */

// Initialize plugins object for future use (in other documents too)
var Plugins = {}, API = {};

(function(p) {
    var pref = new API.get("Preferences", "Plugins");
    var pluginPath = pref.cache("plugin_folder", "/marktime/plugins/");
    
    p.getPlugin = function(name) {
        return new Plugin(name);
    }
    
    /**
     * Class for a plugin
     *
     * @author Tom Barham me@mrfishie.com
     * @version 0.1
     * @namespace Plugins
     */
    function Plugin(name) {
        var path = pluginPath + encodeURI(name);
    }
}(Plugins));