(function () {
    API.add("GDrive", function() {            
        
        var GDrive = {};
        
        GDrive.initialize = function(successCallback){
            function apiAuthenticated(){
                if(successCallback != undefined) successCallback();
            }
            function apiLoaded(){
                GDrive.authenticate(apiAuthenticated);
            }
            GDrive.load(apiLoaded);    
        },
        
        GDrive.load = function(successCallback){
            function gotDriveClientAPI(){
                console.log("[GDrive] Loaded the drive library");
                if(successCallback != undefined) successCallback();
            }
            function gotGAPI(){
                gapi.client.load("drive", "v2", gotDriveClientAPI);
                console.log("[GDrive] Loaded the gapi library");                
            }            
            function loadingGAPI(){
                if(gapi.client == undefined) {setTimeout(loadingGAPI, 100); return;}     
                gotGAPI();                                          
            }               
            $.getScript("https://apis.google.com/js/client.js", loadingGAPI);     
        },
        
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
                    console.log("[GDrive] ERROR: Unable to obtain auth token!");
                    if (typeof callback != "undefined") callback();
                } else {                                    
                    GDrive.token = {
                        access_token: token,
                        state: ['https://www.googleapis.com/auth/drive'], 
                        };
                     
                    gapi.auth.setToken(GDrive.token);
                    console.log("[GDrive] Authenticated with drive!");
                    
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
