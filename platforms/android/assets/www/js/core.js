/** 
 * @author John Board
 * This file is the "Main JavaScript Class". It takes care
 * of initializing the required files and systems.  
 */

var Core;
(function (Core) {
	var initialized = false;
	
	/**
	 * Function that initializes all the systems of the app
	 * @requires "deviceready" event to have been fired
	 */
	function initialize(){
		FastClick.attach(document.body);	
			
		this.includeFiles();
		this.initializeBuiltinAPIs();
		this.initializePlugins();		
		
		initialized = true;
	}
	Core.initialize = initialize;

    /**
     * Includes files such as api.js and plugins.js 
     */
    function includeFiles(){        
        Utils.include("js/api.js", function(){console.log("Finished loading files!");}, function (){console.log("Errah!");});
    }
    Core.includeFiles = includeFiles;

	/**
	 * Used to initialize all the builtin APIs
	 */
	function initializeBuiltinAPIs(){
		
	}
	Core.initializeBuiltinAPIs = initializeBuiltinAPIs;
	
	/**
	 * Used to initalize the plugin system 
	 */
	function initializePlugins(){
		
	}
	Core.initializePlugins = initializePlugins;

	/**
	 * @return boolean Whether the Core has been initialized yet or not 
	 */
	function hasBeenInitialized(){
		return initialized;
	}
	Core.hasBeenInitialized = hasBeenInitialized;
	
})(Core || (Core = {}));