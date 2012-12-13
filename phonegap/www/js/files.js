/**
 * Things to do with Phonegap files
 * Mainly wrappers around their async functions to return Promises
 */ 

SPOKE.files = ( function($, SPOKE) {

    var my = {};

	// Create a new file to put our recording's into. This requires
    // calling several async api functions, so we use .pipe() to 
    // connect them all up, and return the resulting promise object
    my.createFile = function () {
    	
    	console.log('Creating a file');
    	
        // Chain a bunch of promises together to return one thing
        // which encapsulates all the async calls
        return getFileSystem()
            .pipe( function (filesystem) {
            	
            	console.log('Filesystem returned: ' + filesystem);
            	
                return getDirectory(filesystem.root, SPOKE.audioDirectory, {create: true});
            })
            .pipe( function (directory) {
            	
            	console.log('Directory returned: ' + directory.fullPath);

            	// Create a new file, the path is relative to the directory we just got
                // Use a timestamp to the nearest millisecond as a unique name
                var timestamp = new Date().getTime();
                path = 'recording_' + timestamp + SPOKE.audioFilenameExtension;
                return getFile(directory, path, {create: true, exclusive: true});
            });
    }

    // Delete a file from the filesystem
    my.deleteFile = function (folder, filename) {

        console.log("Deleting file: " + filename + " in folder: " + folder);

        return getFileSystem()
            .pipe(function (filesystem) {
                return getDirectory(filesystem.root, folder);
            })
            .pipe(function (directory) {
                return getFile(directory, filename, {});
            })
            .pipe(function (file) {
                var deletingFile = $.Deferred();
                file.remove(deletingFile.resolve, deletingFile.reject);
                return deletingFile;
            });

    }

    // Upload a file to the Spoke server
    my.uploadFile = function (path, params) {

        console.log("Uploading file: " + path);

        var uploadingFile = $.Deferred(),
            options = new FileUploadOptions(),
            transfer;
        
        options.fileKey = "file"; // Form element name that'll be given to the server
        options.fileName = ""; // Filename on server, I think the server should decide this
        try {
           options.mimeType = getMimeType(path);
        }
        catch(error) {
            // Something went wrong getting the mime type, so just return
            // a broken promise immediately
            uploadingFile.reject(error);
            return uploadingFile;
        }
        options:params = params // Other data to send (object of Key/Value pairs)

        transfer = new FileTransfer();
        //transfer.upload(path, SPOKE.apiUrl, uploadingFile.resolve, uploadingFile.reject, options);

        // For testing
        uploadingFile.resolve({});

        return uploadingFile;
    }

    // Get a list of files in a directory and return a promise which
    // wraps the appropriate asynchronous phonegap api call
    my.getDirectoryEntries = function (dirName) {

        console.log('Getting directory entries for directory: ' + dirName);

        // Get the list of recordings currently on the device, we
        // need to make several async calls to do this, so we use
        // .pipe() to connect them up and return the resulting promise
        return getFileSystem()
            .pipe(function (filesystem) {
                return getDirectory(filesystem.root, dirName);
            })
            .pipe(function (directory) {
                var directoryReader = directory.createReader();
                var gettingEntries = $.Deferred();

                directoryReader.readEntries(gettingEntries.resolve, gettingEntries.reject);
                
                return gettingEntries.promise();
            });
    }

    // Wrap the async Phonegap way of getting a filesystem in a promise
    function getFileSystem() {
    	
    	console.log('Getting the file system');
    	
        var filesystem = $.Deferred();

        window.requestFileSystem(
            LocalFileSystem.PERSISTENT, 
            0,
            filesystem.resolve, 
            filesystem.reject
        );

        return filesystem.promise();
    }

    // Wrap the async Phonegap way of getting a directory in a promise
    function getDirectory (rootDirectory, path, options) {
    	
    	console.log('Getting a directory');
    	
        var directory = $.Deferred();

        rootDirectory.getDirectory(path, options, directory.resolve, directory.reject);

        return directory.promise();
    }

    // Wrap the async Phonegap way of getting a file in a promise
    function getFile (directory, path, options) {
    	
    	console.log('Getting a file with path: ' + path + ' in directory: ' + directory.fullPath);
    	
        var file = $.Deferred();

        directory.getFile(path, options, file.resolve, file.reject);

        return file.promise();
    }

    // Get the mimetype for a file
    function getMimeType (path) {
        var extension = path.substr(path.lastIndexOf('.'));

        if(extension.length > 0) {
            return "audio/" + extension;
        }
        else {
            throw "Could not get file extension to determine mime type";
        }
    }

    return my;

})($, SPOKE);
