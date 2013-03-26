/**
 * Things to do with Phonegap files
 * Mainly wrappers around their async functions to return Promises
 */

 ;(function (SPOKE, Backbone, _, $, moment) {
    _.extend(SPOKE, {
        files: {
            // Create a new file to put our recording's into. This requires
            // calling several async api functions, so we use .pipe() to
            // connect them all up, and return the resulting promise object
            createFile: function () {

                console.log('Creating a file');

                // Chain a bunch of promises together to return one thing
                // which encapsulates all the async calls
                return getFileSystem()
                    .pipe( function (filesystem) {

                        console.log('Filesystem returned: ' + filesystem);

                        return getDirectory(filesystem.root, SPOKE.config.filesDirectory, {create: true});
                    })
                    .pipe( function (directory) {

                        console.log('Directory returned: ' + directory.fullPath);

                        // Create a new file, the path is relative to the directory we just got
                        // Use a timestamp to the nearest millisecond as a unique name
                        var timestamp = moment.utc().valueOf();
                        path = 'recording_' + timestamp + SPOKE.config.audioFilenameExtension;
                        return getFile(directory, path, {create: true, exclusive: true});
                    });
            },

            // Delete a file from the filesystem
            deleteFile: function (path) {

                console.log('Deleting file: ' + path);

                // Turn path into a filename
                var filename = path.split('/').pop();

                return getFileSystem()
                    .pipe(function (filesystem) {
                        return getDirectory(filesystem.root, SPOKE.config.filesDirectory);
                    })
                    .pipe(function (directory) {
                        return getFile(directory, filename, {});
                    })
                    .pipe(function (file) {
                        var deletingFile = $.Deferred();
                        file.remove(deletingFile.resolve, deletingFile.reject);
                        return deletingFile;
                    });

            },

            // Upload a file to the Spoke server
            uploadFile: function (path, params, progress) {
                var uploadUrl = SPOKE.instanceUrl + SPOKE.config.apiPath;

                console.log('Uploading file: ' + path + " to: " + uploadUrl);
                console.log('Using login token: ' + JSON.stringify(SPOKE.currentLoginToken) + ' to authenticate');

                var uploadingFile = $.Deferred(),
                    options = new FileUploadOptions(),
                    transfer;

                options.fileKey = 'audio'; // Form element name that'll be given to the server
                options.fileName = path.split('/').pop(); // Filename on server, I think the server should decide this
                options.chunkedMode = false;
                console.log("Setting Cookie in header to: s=" + SPOKE.currentLoginToken.get('cookie'));
                options.headers = {
                    'Cookie': 's=' + SPOKE.currentLoginToken.get('cookie')
                }
                try {
                   options.mimeType = getMimeType(path);
                }
                catch(error) {
                    // Something went wrong getting the mime type, so just return
                    // a broken promise immediately
                    uploadingFile.reject(error);
                    return uploadingFile;
                }

                // Other data to send (object of Key/Value pairs)
                if(params) {
                    console.log("Sending params: " + params);
                    options.params = params;
                }

                transfer = new FileTransfer();
                transfer.onprogress = progress;
                transfer.upload(path,
                    uploadUrl,
                    uploadingFile.resolve,
                    uploadingFile.reject,
                    options);

                return uploadingFile;
            },

            // Get a list of files in a directory and return a promise which
            // wraps the appropriate asynchronous phonegap api call
            getDirectoryEntries: function (dirName) {

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
            },

            // Work around the fact that Android returns different paths than iOS
            // sometimes
            getFullFilePath: function (path) {

                console.log('Getting full path for file at: ' + path);

                var gettingFilesystem,
                    gettingFullFilePath = $.Deferred();

                if (device.platform.match(/Android/)) {

                    console.log('Platform detected as Android, so getting root filesystem');

                    // Resolve when we have the root filesystem folder
                    gettingFilesystem = getFileSystem();
                    gettingFilesystem.done(function (filesystem) {

                        console.log('Returning full filepath: ' + filesystem.root.fullPath + '/' + path);

                        gettingFullFilePath.resolve(filesystem.root.fullPath + '/' + path);
                    });
                } else  {
                    // Resolve immediately with the path because it is the full path

                    console.log('Platform detected as not Android, so returning path as it is: ' + path);

                    gettingFullFilePath.resolve(path);
                }

                return gettingFullFilePath.promise();
            }

        }
    });

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

        console.log('Getting a directory: ' + path);

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

        console.log('Getting mimetype for file at: ' + path);

        var extension = path.substr(path.lastIndexOf('.') + 1);

        console.log('File extension parsed as: ' + extension);

        if(extension.length > 0) {
            // Some mimetypes don't map exactly to extensions
            if(extension === '3gp') {
                return 'audio/3gpp';
            }
            else {
                return 'audio/'  + extension;
            }
        }
        else {
            throw 'Could not get file extension to determine mime type';
        }
    }

})(SPOKE, Backbone, _, $, moment);
