/**
 * Preferences API
 *
 * @author John Board johnrobboard@gmail.com
 * @version 1.0
 */

/**
 * Constructor, instantiates all the variables, etc
 * 
 * @param object parent The instantiating object 
 */
function API(parent){
	this.parent = parent;
	this.apis = {};
}

/**
 * Adds/Registers an API
 * 
 * @param string name Name of the API to add
 * @param function constructor The constructor the API to add 
 */
API.prototype.add = function(name, constructor){
	this.apis[name] = constructor;
};

/**
 * Checks to see whether an API exists
 * 
 * @param string name The name of the API to check
 * @returns boolean Whether the API exists
 */
API.prototype.has = function(name){
	return name in this.apis;
};

/**
 * Returns a new object of the specified API 
 * 
 * @param string name The name of the API to get
 * @param array parameters The parameters to pass to the API
 * 
 * @return object Returns a new instance of the API
 */
API.prototype.get = function(name, parameters){
	
};

/**
 * Gets the class instantiator
 * 
 * @return object The class instantiator 
 */
API.prototype.getParent = function (){
	return this.parent;
};