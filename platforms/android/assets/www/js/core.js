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
		console.log("Included all files!");
		
		this.initializeBuiltinAPIs();
		console.log("Initialized all APIs!");
		
		this.initializePlugins();		
		
		initialized = true;		
		
	}
	Core.initialize = initialize;

    /**
     * Includes files such as api.js and plugins.js 
     */
    function includeFiles(){
        var apisToLoad = ["js/api.js"]; 
        
        Utils.include(apisToLoad, function(data){                           //Callback if everything is fine!            
            //console.log(API.get("Preferences", "MarkTimeJS"));            
        }, function (status, error, file){                                  //Callback if errored.
            console.log("Unable to load: "+ file + "("+error+")");
        });
        
        //var prefs = API.get("Preferences", "MarkTime");
        //console.log(prefs);
    }
    Core.includeFiles = includeFiles;

	/**
	 * Used to initialize all the builtin APIs
	 */
	function initializeBuiltinAPIs(){
		var apisToLoad = ["js/apis/preferences.js"]; 
        
        Utils.include(apisToLoad, function(data){                           //Callback if everything is fine!
            //console.log("Finished loading file.");
            console.log(API.getAPINames());
        }, function (status, error, file){                                  //Callback if errored.
            console.log("Unable to load: "+ file + "("+error+")");
        });
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