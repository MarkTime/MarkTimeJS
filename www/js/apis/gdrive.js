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
                console.log("Loading...");                
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
        
        /**
         * Uploads a file to the current 
         * 
         * @param string filename
         * @param object flags
         *  overwrite:
         *   - boolean
         *  fileID:
         *   - string (ID)
         *  create:
         *   - boolean
         */
        GDrive.upload = function(filename, successCallback){            
            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";                        
            
            var fileData = "";
            function finishedReading(data, metadata){               
                var base64Data = btoa(data);
                var multipartRequestBody =
                    delimiter +
                    'Content-Type: application/json\r\n\r\n' +
                    JSON.stringify(metadata) +
                    delimiter +
                    'Content-Type: ' + metadata.mimeType + '\r\n' +
                    'Content-Transfer-Encoding: base64\r\n' +
                    '\r\n' +
                    base64Data +
                    close_delim;
                console.log(multipartRequestBody);
                var request = gapi.client.request({
                    'path': '/upload/drive/v2/files',
                    'method': 'POST',
                    'params': {'uploadType': 'multipart'},
                    'headers': {
                      'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                    },
                    'body': multipartRequestBody});
                
                function onUpload(file){
                    console.log("[GDrive] Finished uploading! Result: "+file);
                    if(successCallback != undefined) successCallback(file);
                }
                
                request.execute(onUpload);
            }                       
            function initializedFileAPI(){                
                fileAPI.readAsDriveUploadableFile(filename, finishedReading);
            }            
            var fileAPI = API.get("File");
            fileAPI.initialize(initializedFileAPI);
        };
        
        GDrive.download = function(){
            
        };
        
        return GDrive;
    });
}());
