(function () {
    API.add("File", function (type) {
        if (typeof type === "undefined") { type = "persistent"; }
        var plugin = this, root = plugin.name === "MarkTime" ? "/" : plugin.path.replace("\\", "/").replace("../", "/"), filesystem = undefined, error = false;
        initialize();

        this.read = function (file, mode, encoding) {
            waitForInitialize();
            
            if (typeof mode === "undefined") { mode = "text"; }
            if (typeof file === 'string')
                file = this.getFile(file);
            
            console.log("Reading file " + file + " (" + mode + ", " + (encoding || 'utf-8') + ")");
            
            var reader = new FileReader(), result = undefined;
            reader.onloadend = function (ev) {
                result = ev.target.result;
            };
            reader.onerror = this.onError;

            mode = mode.toLowerCase();
            if (mode === "data")
                reader.readAsDataURL(file);
            else
                reader.readAsText(file, encoding);

            while (typeof result === 'undefined' && !error) {
            }
            error = false;
            
            console.log("Finished reading file " + file);
            
            if (mode === "json")
                result = JSON.parse(result);
            return result;
        };

        this.write = function (file, content, append, mode) {
            waitForInitialize();
            
            if (typeof append === "undefined") { append = false; }
            if (typeof mode === "undefined") { mode = "text"; }
            
            console.log("Writing to file " + file + " with " + content.length + " characters (" + (append ? "appending" : "not appending") + ", " + mode + ")");
            
            if (typeof file === 'string')
                file = this.getFile(file);
            
            var complete = false;
            file.fileEntry.createWriter(function (writer) {
                writer.onwriteend = function (ev) {
                    complete = true;
                };
                writer.onerror = this.onError;

                if (append)
                    writer.seek(writer.length);
                if (mode.toLowerCase() === "json")
                    content = JSON.stringify(content);
                writer.write(content);
            }, this.onError);

            while (!complete && !error) {
            }
            error = false;
            
            console.log("Finished reading file " + file);
            
            return content;
        };

        this.append = function (file, content, mode) {
            if (typeof mode === "undefined") { mode = "text"; }
            return this.write(file, content, true, mode);
        };

        this.onError = function (err) {
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

        this.getFile = function (path) {
            waitForInitialize();
            
            console.log("Getting file at " + path);
            
            var f = undefined;
            filesystem.root.getFile(root + path, null, function (fe) {
                fe.file(function (file) {
                    f = file;
                    f["fileEntry"] = fe;
                }, this.onError);
            }, this.onError);

            while (typeof f === 'undefined' && !error) {
            }
            error = false;
            return f;
        };

        function initialize() {
            type = type.toUpperCase();
            console.log("Initializing file system type " + type);
            
            if (!LocalFileSystem.hasOwnProperty(type))
                throw new Error("A file storage type " + type + " does not exist!");

            window.requestFileSystem(LocalFileSystem[type], 0, function (fs) {
                filesystem = fs;
            }, this.onError);
        }

        function waitForInitialize() {
            while (typeof filesystem === 'undefined' && !error) {
            }
            error = false;
            return;
        }
    });
}());
