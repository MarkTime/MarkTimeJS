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
		console.log("Core initializing!");
		FastClick.attach(document.body);	
			
		this.initializeBuiltinAPIs();
		this.initializePlugins();		
		
		initialized = true;
	}
	Core.initialize = initialize;

	/**
	 * Used to initialize all the builtin APIs
	 */
	function initializeBuiltinAPIs(){
		API.respond();
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