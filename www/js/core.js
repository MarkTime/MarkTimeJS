/** 
 * @author John Board
 * This file is the "Main JavaScript Class". It takes care
 * of initializing the required files and systems.  
 */

var Core;
(function (Core) {    
	var initialized = false;
    
    Core.debug = false;
	
	/**
	 * Function that initializes all the systems of the app
	 * @requires "deviceready" event to have been fired
	 */
	/*function initialize(){
		FastClick.attach(document.body);	
			
		this.includeFiles();
		
		//this.initializeBuiltinAPIs();
		//console.log("Initialized all APIs!"); //Replaced, everything added in this.includeFiles();
		
		this.initializePlugins();		
		
		initialized = true;		
		
	}
	Core.initialize = initialize;*/
    
    var files = [
        "js/api.js",
        "js/plugins.js"
    ];
    Core.files = files;
    Core.debug = true;
    
    /**
     * Function that initializes all the systems of the app
     * @requires "deviceready" event to have been fired
     */
    function initialize(complete) {
        /**
        * TODO
        * Show a loading symbol *until* after the `Plugins.initialize()` line. This is when everything is loaded.
        */
		/*var DEBUGGING_MODE = true;
		if (!DEBUGGING_MODE){
			console.log = function(){};
		}*/
			
        console.log("== INITIALIZING MARKTIME ==");
		
        FastClick.attach(document.body);
        $.getScript("js/api.js", function() {
            API.autoload(function() {
                $.getScript("js/plugins.js", function() {
                    console.log("== INITIALIZATION COMPLETE ==");
                    initialized = true;
                    if (complete) complete();
                });
            });
        });
        
        initialized = true;
    }
    Core.initialize = initialize;
    
    /*function includeFiles(complete) {
        var donecount = 0;
        Utils.include(files, function() {
            donecount++;
            if (donecount >= files.length) {
                complete();
            }
        });
    }
    Core.includeFiles = includeFiles;*/
    
    function isInitialized() {
        return initialized;
    }

    /**
     * Includes files such as api.js and plugins.js 
     */
    /*function includeFiles(){
        var filesToLoad = ["js/api.js",
                          "js/apis/preferences.js",
                          "js/apis/configuration.js", 
                          "js/plugins.js"]; 
        
        for(file in filesToLoad){
            file = filesToLoad[file];
            console.log("Getting file: "+file);
            Utils.include(file, function(data, fileGotten){
                console.log("Success loading: "+fileGotten);
            }, function(status, error, file){
                console.log("Unable to load: "+ file + " ("+error+")");
            });
        }
        //setTimeout(function(){console.log(API.get("Preferences"));}, 1000);
        
        //var prefs = API.get("Preferences", "MarkTime");
        //console.log(prefs);
    }
    Core.includeFiles = includeFiles;*/

	/**
	 * Used to initialize all the builtin APIs
	 */
	/*function initializeBuiltinAPIs(){
		var apisToLoad = ["js/apis/preferences.js"]; 
        
        Utils.include(apisToLoad, function(data){                           //Callback if everything is fine!
            console.log(API.get("Preferences", "MarkTimeJS"));
        }, function (status, error, file){                                  //Callback if errored.
            console.log("Unable to load: "+ file + "("+error+")");
        });
	}
	Core.initializeBuiltinAPIs = initializeBuiltinAPIs;*/
	
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