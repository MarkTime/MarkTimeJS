﻿/** 
 * @author John Board
 * This file is the "Main JavaScript Class". It takes care
 * of initializing the required files and systems.  
 */

var Core;
(function (Core) {    
	var initialized = false;
    
    Core.debug = true;    
    
    var files = [
        "js/api.js",
        "js/plugins.js"
    ];
    Core.files = files;
    
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
			
        console.log("[Core] == INITIALIZING MARKTIME ==");
		
        FastClick.attach(document.body);
        console.log("[Core] Loading API...");
        Utils.include("js/api.js", function() {
            console.log("[Core] Starting API autoload...");
            API.autoload(function() {
                console.log("[Core] Loading plugins...");
                Utils.include("js/plugins.js", function() {
                    console.log("[Core] Starting API tests...");
                    API.testAll(Plugins.Default, function(success, m) {
                        if (!success) console.log("[Core] Some of the tests failed! Continuing anyway...");
                        else console.log("[Core] All tests passed!");
                        
                        console.log("[Core] == INITIALIZATION COMPLETE ==");
                        initialized = true;
                        if (complete) complete();
                    });
                });
            });
        });
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