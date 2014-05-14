/**
 * @author John Board
 * 
 * This API is for working with the file system. 
 */
(function () {
    API.add("File", function (type) {       
        var File = {}; 
        var rootDirectory;             
        var rootPath = sanitizePath(this.path);
        
        File.initialized = false;
        
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
        File.initialize = function(successCallback, errorCallback){
            var previouslyErrored = false;
            function onError(err){        
                console.log("[File] ERROR: "+err);
                if(errorCallback != undefined) errorCallback(err);                
            }        
            window.requestFileSystem(LocalFileSystem[type], 0, function(fs){
                console.log("[File] Got the file system");
                
                //Sets rootDirectory to /MarkTime/plugins/<plugin-name>
                function gotRootDirectory(directory){
                    rootDirectory = directory;                    
                    console.log("[File] Got MarkTime root directory");
                    console.log("[File] Initialized!");                
                    File.initialized = true;                    
                    if(successCallback != undefined) successCallback();
                }                
                
                function checkPluginRootExists(){
                    fs.root.getDirectory(rootPath, {create: true, exclusive: false}, gotRootDirectory, onError);
                }
                fs.root.getDirectory("MarkTime/plugins/", {create: true, exclusive: false}, checkPluginRootExists, onError);                
                                                
            }, onError);            
        };                   
        
        /**
         * Throws an error if the File API has not yet been initialized. 
         */
        File.checkInitialization = function(){
            if(File.initialized == false) throw new Error("File API not initialized yet!");
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
        File.getEntries = function(path, flags, successCallback, errorCallback){
            File.checkInitialization();
            
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
                reader.readEntries(filter, errorCallback);
            }
            
            //Gets the specified directory so it can create a reader on it, and start reading in entries
            rootDirectory.getDirectory(path, {}, gotDirectory, errorCallback);
        };
        
        /**
         * Reads information from a file
         * @param string filepath Path to the file
         * @param function successCallback Callback to call on finish 
         * @return string Returns read string
         */
        File.read = function(filepath, successCallback){
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
        },       
        
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
            if (typeof flags === 'function') {
                var c = successCallback;
                successCallback = flags;
                flags = c;
            }
            filepath = sanitizePath(filepath);
            
            //Run when the file entry has been gotten
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
            
            //Gets the specified file from the directory
            rootDirectory.getFile(filepath, {create: true, exclusive: false}, gotFileEntry, File.onError);  
        },
        
        File.createDirectory = function(path, successCallback){            
            function gotDirectory(){
                if(successCallback != undefined) successCallback();
            }
            rootDirectory.getDirectory(path, {create: true, exclusive: false}, gotDirectory); 
        },
        
        /**
         * Deletes the specified directory
         * @param string path Path of the directory 
         */
        File.deleteDirectory = function(path){
            function gotDirectory(directory){
                directory.remove();
            }
            rootDirectory.getDirectory(path, {create: false}, gotDirectory);
        },
        
        /**
         * Deletes a directory, and all it's subdirectories
         * @param string path Path of the directory 
         */
        File.deleteDirectoryRecursively = function(path){
            function gotDirectory(directory){
                directory.removeRecursively();
            }
            rootDirectory.getDirectory(path, {create: false}, gotDirectory);
        },
        
        /**
         * Deletes a file
         * @param string path The path of the file to delete 
         */
        File.deleteFile = function(path){
            function gotFileEntry(fileEntry){
                fileEntry.remove();
            }
            rootDirectory.getFile(path, {create: false}, gotFileEntry);
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
            }
            throw new Error(out);
        };
        
        return File;
    });
}());