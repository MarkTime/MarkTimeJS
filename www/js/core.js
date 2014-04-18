/**
 * MarkTime Core
 *
 * Contains all the core stuff
 *
 * @author Various people
 * @version 1.0
 */
var Core = {};
(function() {
    /**
     * Include another Javascript file
     *
     * @param string file Filename to include
     * @param function execute A function to call when the Javascript file is read. By default it will load the contents
     */
    Core.include = function(file, execute) {
        if (execute === undefined) execute = function(content) {
            $("<script></script>").appendTo("head").text(content);
        }
        
        $.get(file, {}, function(data) {
            execute(data);
        });
    }
}());