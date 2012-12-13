/**
 * Things to do with Phonegap files
 * Mainly wrappers around their async functions to return Promises
 */ 

;(function($){

	// Create a new file to put our recording's into. This requires
    // calling several async api functions, so we use .pipe() to 
    // connect them all up, and return the resulting promise object
    function createFile () {
    	
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

    // Wrap the async Phonegap way of getting a filesystem in a promise
    function getFileSystem () {
    	
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
    	
        directory = $.Deferred();

        rootDirectory.getDirectory(path, options, directory.resolve, directory.reject);

        return directory.promise();
    }

    // Wrap the async Phonegap way of getting a file in a promise
    function getFile (directory, path, options) {
    	
    	console.log('Getting a file with path: ' + path + ' in directory: ' + directory.fullPath);
    	
        file = $.Deferred();

        directory.getFile(path, options, file.resolve, file.reject);

        return file.promise();
    }

    // Get a list of files in a directory and return a promise which
    // wraps the appropriate asynchronous phonegap api call
    function getDirectoryEntries(dirName) {

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
    
})($);
