(function () {
    API.add("GDrive", function() {            
        var rootPath = sanitizePath(this.path);
        var GDrive = {};
        
        function sanitizePath(path){
            path = path.split("\\").join("/").split("../").join("");
            if (path.charAt(0) === "/") path = path.substr(1);  
            return path; 
        }
        
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
        
        GDrive.download = function(fileID, filePath, successCallback){   
            //Test File: 0BwUSzZIPH0AiMWZkdHdCUFdydFYxVXhhaEZ0RTJqV3hXZjZn
            //g.download("https://drive.google.com/uc?export=download&id=0BwUSzZIPH0AiMWZkdHdCUFdydFYxVXhhaEZ0RTJqV3hXZjZn", "img.jpg", function(){console.log("Success!");});             
            
            //0BwUSzZIPH0AiZ0E4c0thaEZTeFE
            var accessToken = gapi.auth.getToken().access_token;
            var xhr = new XMLHttpRequest();
            var downloadURL = "https://docs.google.com/uc?export=download&id="+fileID;
            xhr.open('GET', downloadURL);
            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
            
            function string2ArrayBuffer(string, callback) {
                var bb = new BlobBuilder();
                bb.append(string);
                var f = new FileReader();
                f.onload = function(e) {
                    callback(e.target.result);
                }
                f.readAsArrayBuffer(bb.getBlob());
            }
            
            function loadedFS(){
                console.log("Done!");
                GDrive.result = xhr;
                
            }
            
            function onLoad() {
                console.log("Loading file API..");
                var fileAPI = API.get("File");
                fileAPI.initialize(loadedFS);
            };
            
            xhr.onload = onLoad;                        
            xhr.onerror = function() {
                callback(null);
            };
            xhr.send();
           
           
           /* Old FileTransfer Code             
            filePath = sanitizePath(filePath);
            filePath = "file:///sdcard/"+rootPath+"/"+filePath;
                                
            var fileTransfer = new FileTransfer();
            var uri = encodeURI(url);
            var accessToken = gapi.auth.getToken().access_token;
            
            fileTransfer.download(
                uri,
                filePath,
                successCallback,
                function(error) {
                    console.log("[GDrive] File Download error: " + error.code);
                },
                false,
                {
                    headers: {
                        "Authorization": 'Bearer ' + accessToken
                    }
                }
            );*/
        };
        
        return GDrive;
    });
}());
