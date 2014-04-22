(function () {
    API.add("File", function (type: string = "persistent") {
        var plugin: Plugins.Plugin = this, root: string = plugin.name === "MarkTime" ? "/" : plugin.path.replace("\\", "/").replace("../", "/"), filesystem: any = undefined, error: boolean = false;
        initialize();

        this.read = function (file: any, mode: string = "text", encoding?: string): string {
            if (typeof file === 'string') file = this.getFile(file);
            var reader: FileReader = new FileReader(), result:string = undefined;
            reader.onloadend = function (ev: ProgressEvent): void {
                result = ev.target.result;
            }
            reader.onerror = this.onError;

            mode = mode.toLowerCase();
            if (mode === "data") reader.readAsDataURL(file);
            else reader.readAsText(file, encoding);

            while (typeof result === 'undefined' && !error) { }
            error = false;

            if (mode === "json") result = JSON.parse(result);
            return result;
        }

        this.write = function (file: any, content: any, append: boolean = false, mode: string = "text"): string {
            if (typeof file === 'string') file = this.getFile(file);
            var complete: boolean = false;
            file.fileEntry.createWriter(function (writer: any): void {
                writer.onwriteend = function (ev: ProgressEvent): void {
                    complete = true;
                }
                writer.onerror = this.onError;

                if (append) writer.seek(writer.length);
                if (mode.toLowerCase() === "json") content = JSON.stringify(content);
                writer.write(content);
            }, this.onError);

            while (!complete && !error) { }
            error = false;

            return content;
        }

        this.append = function (file: any, content: any, mode: string = "text"): string {
            return this.write(file, content, true, mode);
        }

        this.onError = function (err: any): void {
            error = true;
            var out: string = "The operation failed because ";
            switch (err.code) {
                case FileError.QUOTA_EXCEEDED_ERR: out += "no more space is left on the requested drive"; break;
                case FileError.NOT_FOUND_ERR: out += "the file was not found"; break;
                case FileError.SECURITY_ERR: out += "a security issue was encountered"; break;
                case FileError.INVALID_MODIFICATION_ERR: out += "the modification was invalid"; break;
                case FileError.INVALID_STATE_ERR: out += "the state was invalid"; break;
            }
            throw new Error(out);
        }

        this.getFile = function (path: string): File {
            waitForInitialize();
            var f: File = undefined;
            filesystem.root.getFile(root + path, null, function (fe: any): void {
                fe.file(function (file: File): void {
                    f = file;
                    f["fileEntry"] = fe;
                }, this.onError);
            }, this.onError);

            while (typeof f === 'undefined' && !error) { }
            error = false;
            return f;
        }

        function initialize(): void {
            type = type.toUpperCase();
            if (!LocalFileSystem.hasOwnProperty(type)) throw new Error("A file storage type " + type + " does not exist!");

            window.requestFileSystem(LocalFileSystem[type], 0, function (fs: any): void {
                filesystem = fs;
            }, this.onError);
        }

        function waitForInitialize(): void {
            while (typeof filesystem === 'undefined' && !error) { }
            error = false;
            return;
        }
    });
} ());