function Preferences(filePath, fileSystem) {
	this.filePath = filePath;
	this.fileSystem = fileSystem;
	this.fileReader = null;
	this.data = {};
}

Preferences.prototype.printQuota = function(){
	window.webkitStorageInfo.queryUsageAndQuota(webkitStorageInfo.TEMPORARY, //the type can be either TEMPORARY or PERSISTENT
	function(used, remaining) {
		console.log("Used quota: " + used + ", remaining quota: " + remaining);
	}, function(e) {
		console.log('Error', e); 
	} );
}

Preferences.prototype.load = function(onLoadedCallback){
	this.onLoadedCallback = onLoadedCallback;
	this.currentCallback = this.onLoadedCallback;
	this.fileSystem.root.getFile(this.filePath, null, this.gotFileEntry_Read, this.onError);
}

Preferences.prototype.save = function(onSavedCallback){
	this.onSavedCallback = onSavedCallback;
	this.currentCallback = this.onSavedCallback;
	console.log(this.filePath);
	console.log("Trying to create a file!");
	fileSystem.root.getFile(this.filePath, {create: true}, this.gotFileEntry_Write, this.onError);	
}

Preferences.prototype.getString = function(){
	return JSON.stringify(this.data);
}

Preferences.prototype.write = function(key, value){
	this.data[key] = value;
}

Preferences.prototype.read = function(file){
	var reader = new FileReader();
	reader.onloadend = this.onLoadedCallback; //When the reader finishes, call the "load" callback
	this.currentCallback = null; //Clears the current callback (Callback now handled by reader)
	reader.readAsText();
}

/* ========== Events ========== */

Preferences.prototype.gotFileEntry_Read = function(fileEntry){ //Called when filesystem returns fileEntry
	fileEntry.file(this.gotFile, this.onError);
}

Preferences.prototype.gotFileEntry_Write = function(fileEntry){ //Called when filesystem returns fileEntry
	console.log("Got file entry!");
	fileEntry.createWriter(this.gotFileWriter, this.onError);
}

Preferences.prototype.gotFile = function(file){ //Called when the FileEntry returns the actual file
	this.read(file);
}

Preferences.prototype.gotFileWriter = function(writer){
	console.log("Got file writer!");
	this.onwrite = function(evt){
		this.onSavedCallback(true);
	}
	writer.write(this.getString());
}

Preferences.prototype.onError = function(evt) { //Called when an error occurs
	console.log(evt);
	if (this.currentCallback != null){ //If there is an active callback, then call it with the error code
		this.currentCallback(evt);
	}
}