﻿/**
 * @author John Board
 * 
 * This API is for working with the file system. 
 */
(function () {
    API.add("File", function (type) {       
        var File = {}; 
        var rootDirectory;             
        var rootPath = sanitizePath(this.path);
        var initialized = false;
                
        function sanitizePath(path){
            path = path.split("\\").join("/").split("../").join("");
            if (path.charAt(0) === "/") path = path.substr(1);  
            return path; 
        }
        
        /*
         * If  type is not defined, set the default to PERSISTENT storage
         * Else, make sure the input is capitalized
         * Also make sure that the storage type exists
         */
        if(typeof type == "undefined") {type = "PERSISTENT";} else {type = type.toUpperCase();};
        if (!LocalFileSystem.hasOwnProperty(type)) throw new Error("A file storage type " + type + " does not exist!");  
                
        /**
         * This function gets the file system. The file system is required
         * to get files. This is a pre-requisit for any other functions.
         */
        File.initialize = function(successCallback){
            if (initialized) {
                console.log("[File] File API can't be initialized twice! Skipping initialization.");
                successCallback();
                return;
            }
            
            var previouslyErrored = false;       
            window.requestFileSystem(LocalFileSystem[type], 0, function(fs){
                console.log("[File] Got the file system");
                
                //Sets rootDirectory to /MarkTime/plugins/<plugin-name>
                function gotRootDirectory(directory){
                    rootDirectory = directory;                    
                    console.log("[File] Got MarkTime root directory");
                    console.log("[File] Initialized!");                
                    initialized = true;
                    
                    for (var i = 0; i < initializationCallbacks.length; i++) initializationCallbacks[i]();
                    if(successCallback != undefined) successCallback();
                }                
                
                function checkPluginRootExists(){
                    console.log("[*****] Checking plugin root exists");
                    fs.root.getDirectory(rootPath, {create: true, exclusive: false}, gotRootDirectory, File.onError);
                }
                console.log("[******] Getting MarkTime/plugins");
                fs.root.getDirectory("MarkTime/plugins/", {create: true, exclusive: false}, checkPluginRootExists, File.onError);                
                
            }, File.onError);            
        };                   
        
        var initializationCallbacks = [];
        function checkInitialization(callback){
            if (!initialized) initializationCallbacks.push(callback);
            else callback();
        };
        File.waitForReady = checkInitialization;
        
        /**
         * Turns:
         * /home/pi/test.txt
         * Into:
         * test.txt
         * 
         * @param string path Path to strip the directories off 
         */
        File.stripPath = function(path){
            return path.substring(path.lastIndexOf("/")+1, path.length);
        };               
        
        /**
         * Returns an array of file entries 
         * @param string path Path of the directory to list the entries in
         * @param object flags
         *  filter:
         *   - name: Returns an array of the file/directory names
         *   - file: Returns an array of all the FileEntries
         *   - directory: Returns an array of all the DirectoryEntries
         * @param function successCallback Callback on success
         * @param errorCallback Callback on error
         */
        File.getEntries = function(path, flags, successCallback){
            checkInitialization(function() {
            
                //If the path isn't defined...
                if(path == undefined) path = "";
                
                //If the path is the root directory...
                if(path == ""){                               
                    gotDirectory(rootDirectory);
                    return;
                }
                
                /**
                 * Filters the entry array depending on the flags given
                 * @param array entries Array of FileEntries or DirectoryEntries
                 */
                function filter(entries){
                    if(flags.hasOwnProperty("filter")){                                          
                        filteredEntries = [];
                        
                        //Iterates over the entries
                        for(entry=0;entry<entries.length;entry++){
                            
                            //Filter according to the filter type
                            if(flags.filter == "name"){
                                //Regex removes the full path leaving just the file name
                                filteredEntries.push(entries[entry].fullPath.replace(/^.*[\\\/]/, ''));
                            
                            } else if (flags.filter == "file"){
                                if(entries[entry].isFile) filteredEntries.push(entries[entry]);
                            
                            } else if (flags.filter == "directory"){
                                if(entries[entry].isDirectory) filteredEntries.push(entries[entry]);
                                
                              //If all else fails, then don't filter.
                            } else {
                                filteredEntries = entries; 
                                break;
                            }
                        }
                        
                        //Callback the successCallback with the filtered entries
                        if(successCallback != undefined) successCallback(filteredEntries);
                                                                
                    } else {
                        if(successCallback != undefined) successCallback(entries);
                    }
                }    
                
                /**
                 * Called when the specified directory has been gotten (See below function) 
                 */             
                function gotDirectory(directory){
                    //Reads in the entries in the directory, and spits them out to the filter
                    reader = directory.createReader();
                    reader.readEntries(filter, File.onError);
                }
                
                //Gets the specified directory so it can create a reader on it, and start reading in entries
                rootDirectory.getDirectory(path, {}, gotDirectory, File.onError);
            });
        };
        
        /**
         * Reads information from a file
         * @param string filepath Path to the file
         * @param function successCallback Callback to call on finish 
         * @return string Returns read string
         */
        File.read = function(filepath, successCallback){
            checkInitialization(function() {
                filepath = sanitizePath(filepath);
                
                function gotFileEntry(fileEntry){fileEntry.file(gotFile, File.onError);}
                function gotFile(file){
                    var reader = new FileReader();
                    function onReadingEnd(event){
                        console.log("[File] Finished reading in '"+filepath+"'");                    
                        if(successCallback != undefined) successCallback(event.target.result);
                    }
                    reader.onloadend = onReadingEnd;   
                    reader.onerror = File.onError;                 
                    reader.readAsText(file);
                }
                
                rootDirectory.getFile(filepath, {create: true}, gotFileEntry, File.onError);
            });
        };
        
        File.readAsBinaryString = function(filepath, succcessCallback){
            filepath = sanitizePath(filepath);
            
            function gotFileEntry(fileEntry){fileEntry.file(gotFile, File.onError);}
            function gotFile(file){
                var reader = new FileReader();
                function onReadingEnd(event){
                    console.log("[File] Finished reading in '"+File.stripPath(filepath)+"'");                    
                    if(successCallback != undefined) successCallback(event.target.result);
                }
                reader.onloadend = onReadingEnd;   
                reader.onerror = File.onError;                 
                reader.readAsBinaryString(file);
            }
            
            rootDirectory.getFile(filepath, {create: true}, gotFileEntry, File.onError); 
        };
        
        File.readAsDriveUploadableFile = function(filepath, successCallback){
            filepath = sanitizePath(filepath);
            
            function gotFileEntry(fileEntry){fileEntry.file(gotFile, File.onError);}
            function gotFile(file){
                var reader = new FileReader();
                var metadata;
                function onLoad(e) {
                    var contentType = file.type || 'application/octet-stream';
                    metadata = {
                        'title': File.stripPath(filepath),
                        'mimeType': contentType
                    };
                };
                function onReadingEnd(event){
                    console.log("[File] Finished reading in '"+File.stripPath(filepath)+"' as a GDrive uploadable file");                    
                    if(successCallback != undefined) successCallback(reader.result, metadata);
                }
                reader.onload = onLoad;
                reader.onloadend = onReadingEnd;                  
                reader.onerror = File.onError;                 
                reader.readAsBinaryString(file);
            }
            
            rootDirectory.getFile(filepath, {create: true}, gotFileEntry, File.onError); 
        };
        
        /**
         * Writes text to a file
         * @param string filepath The file to write to
         * @param string text Text to write
         * @param object flags Flags for this operation
         *  append:
         *   - true/false
         * @param function successCallback Function to call on success  
         * If flags aren't passed, the flags parameter is assumed to be the callback
         */
        File.write = function(filepath, text, flags, successCallback){
            checkInitialization(function() {
                if (typeof flags === 'function') {
                    var c = successCallback;
                    successCallback = flags;
                    flags = c;
                }
                filepath = sanitizePath(filepath);
                
                //Run when the file entry has been gotten
                console.log("[******] Getting file entry for '" + filepath + "'");
                function gotFileEntry(fileEntry){fileEntry.createWriter(gotFileWriter, File.onError);}
                
                //Called when ready to start writing
                function gotFileWriter(writer){
                    //Called when the writing has finished
                    function onWritingEnd(){
                        if(successCallback != undefined) successCallback();
                    }
                    writer.onwriteend = onWritingEnd();                                
                    
                    //Checks flags for append property, and acts accordingly
                    if(flags != undefined && flags.hasOwnProperty("append")){
                        if(flags.append == true) writer.seek(writer.length);
                    }
                    
                    //Writes the text to the file
                    writer.write(text); 
                }
                
                console.log("[******] Getting file for '" + filepath + "'")
                //Gets the specified file from the directory
                rootDirectory.getFile(filepath, {create: true, exclusive: false}, gotFileEntry, File.onError);
            });
        },
        
        File.createDirectory = function(path, successCallback){
            checkInitialization(function() {
                function gotDirectory(){
                    if(successCallback != undefined) successCallback();
                }
                rootDirectory.getDirectory(path, {create: true, exclusive: false}, gotDirectory);
            });
        },
        
        /**
         * Deletes the specified directory
         * @param string path Path of the directory 
         */
        File.deleteDirectory = function(path){
            checkInitialization(function() {
                function gotDirectory(directory){
                    directory.remove();
                }
                rootDirectory.getDirectory(path, {create: false}, gotDirectory);
            });
        },
        
        /**
         * Deletes a directory, and all it's subdirectories
         * @param string path Path of the directory 
         */
        File.deleteDirectoryRecursively = function(path){
            checkInitialization(function() {
                function gotDirectory(directory){
                    directory.removeRecursively();
                }
                rootDirectory.getDirectory(path, {create: false}, gotDirectory);
            });
        },
        
        /**
         * Deletes a file
         * @param string path The path of the file to delete 
         */
        File.deleteFile = function(path){
            checkInitialization(function() {
                function gotFileEntry(fileEntry){
                    fileEntry.remove();
                }
                rootDirectory.getFile(path, {create: false}, gotFileEntry);
            });
        },
        
        /**
         * 'Correctly' handles errors 
         */
        File.onError = function (err) {
            error = true;
            var out = "The operation failed because ";
            switch (err.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    out += "no more space is left on the requested drive";
                    break;
                case FileError.NOT_FOUND_ERR:
                    out += "the file was not found";
                    break;
                case FileError.SECURITY_ERR:
                    out += "a security issue was encountered";
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    out += "the modification was invalid";
                    break;
                case FileError.INVALID_STATE_ERR:
                    out += "the state was invalid";
                    break;
                case FileError.PATH_EXISTS_ERR:
                    out += "the path already exists";
                    break;
                default:
                    out += "of an unknown reason (code is " + err.code + ")";
            }
            console.log("File error!", err);
            throw /*new Error(*/out/*)*/;
        };
        
        File.initialize();
        
        return File;
    }, function(unit) {
        unit.expect(1);
        
        var file = API.get("File"), iscomplete = false;
        file.waitForReady(function() {
            iscomplete = true;
            unit.assert(true, "File initializing time (should be <2s)");
        });
        setTimeout(function() {
            if (!iscomplete) unit.assert(false, "File initializing time (should be <2s)");
        }, 2000);
    });
}());