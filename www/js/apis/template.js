//This function is run when it's loaded
(function () {
    //Registers itself as an API
    API.add("TemplateAPI", function (parameter) {        
        if (typeof parameter === "undefined") { parameter = "default_value"; }
        
        //TemplateAPI is the object that will be instantiated whenever API.get("TemplateAPI", ...) is called
        var TemplateAPI = {};
        TemplateAPI.saySomething = function(something) {
            console.log("TemplateAPI Says: "+something);
        };
        
        //The TemplateAPI object is returned whenever API.get is called
        return TemplateAPI;
    });
}());
