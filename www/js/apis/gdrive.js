(function () {
    API.add("GDrive", function() {            
        
        var GDrive = {};
        
        /**
         * 
         * @param function callback Callback to call once auth is finished (either successfully or not)
         * @return string Returns token or null to callback on success 
         */
        GDrive.authenticate = function (callback){
            chrome.runtime.setManifest({
                oauth2: {
                    client_id: '1046109656623-p5vam8l1iv93e3e72f5j4eh1ebi5i54a.apps.googleusercontent.com',
                    scopes: ['https://www.googleapis.com/auth/drive']
                }
            });
                
            chrome.identity.getAuthToken({interactive: true}, function(token) {
                if(typeof token == "undefined") {                    
                    console.log("[GDrive] Unable to obtain auth token!");
                    if (typeof callback != "undefined") callback();
                } else {
                    console.log("[GDrive] Authenticated with drive!");
                    GDrive.token = token;
                    if (typeof callback != "undefined") callback(token);
                }                                       
            });
        };
        
        GDrive.upload = function(){
            
        };
        
        GDrive.download = function(){
            
        };
        
        return GDrive;
    });
}());
