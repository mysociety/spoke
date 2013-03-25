describe('SPOKE.files', function () {

    // Mock instance variables
    var filename,
        mockFile,
        mockRootDirectoryReader,
        mockRootDirectory,
        mockFilesDirectoryReader,
        mockFilesDirectory,
        mockFileSystem,
        mockFileTransfer,
        oldDate,
        oldLocalFileSystem,
        oldRequestFileSystem,
        oldFileTransfer,
        oldDevice,
        oldFilenameExtension;

    beforeEach(function () {
        var timestamp, filesEntries;

        // Mock the moment.utc() method so that we can get the same filename every time
        timestamp = moment.utc([2000, 0, 1, 0, 0, 0, 0]);
        spyOn(moment, "utc").andReturn(timestamp);

        // Fix the filename extension used
        if(SPOKE.config.hasOwnProperty('audioFilenameExtension')) {
            oldFilenameExtension = SPOKE.config.audioFilenameExtension;
        }
        SPOKE.config.audioFilenameExtension = '.3gp';

        // Mock the phonegap file apis
        filename = "recording_" + timestamp.valueOf() + SPOKE.config.audioFilenameExtension;
        mockFile = helper.mockFile(filename, "/spoke/" + filename);

        // A mock directory for files
        mockFilesDirectoryReader = helper.mockDirectoryReader([mockFile]);
        filesEntries = {};
        filesEntries[filename] = mockFile;
        mockFilesDirectory = helper.mockDirectory("spoke", "/spoke", filesEntries, mockFilesDirectoryReader);

        // A mock root directory containing the files directory
        mockRootDirectoryReader = helper.mockDirectoryReader([mockFilesDirectory]);
        mockRootDirectory = helper.mockDirectory("root", "/", {"spoke":mockFilesDirectory}, mockRootDirectoryReader);

        // A mock file system object to hold the directories
        mockFileSystem = helper.mockFileSystem("filesystem", mockRootDirectory);

        // Mock or create some global window variables and functions we expect to be present
        if(window.hasOwnProperty("LocalFileSystem")) {
            oldLocalFileSystem = window.LocalFileSystem;
        }
        window.LocalFileSystem = {
            PERSISTENT:0
        };

        // Mock the file system getting function to return ours
        if(window.hasOwnProperty('requestFileSystem')) {
            oldRequestFileSystem = window.requestFileSystem;
        }
        window.requestFileSystem = helper.mockRequestFileSystem(true, mockFileSystem);

        // Mock the FileTransfer method
        if(window.hasOwnProperty('FileTransfer')) {
            oldFileTransfer = window.FileTransfer();
        }
        mockFileTransfer = helper.mockFileTransfer(true);
        window.FileTransfer = function() { return mockFileTransfer; };

        // Mock the FileUploadOptions method
        if(window.hasOwnProperty('FileUploadOptions')) {
            oldFileUploadOptions = window.FileUploadOptions;
        }
        window.FileUploadOptions = helper.mockFileUploadOptions;

        // Mock the "device" window object
        if(window.hasOwnProperty('device')) {
            oldDevice = window.device;
        }
        window.device = {};

        // Set instanceURL to something we know
        SPOKE.instanceURL = "http://" + SPOKE.config.baseHost;

    });

    afterEach(function() {
        // Undo all the crazy mocking we did
        if(typeof oldLocalFileSystem !== 'undefined') {
            window.LocalFileSystem = oldLocalFileSystem;
        }
        else {
            delete window.LocalFileSystem;
        }

        if(typeof oldRequestFileSystem !== 'undefined') {
            window.requestFileSystem = oldRequestFileSystem;
        }
        else {
            delete window.requestFileSystem;
        }

        if(typeof oldFileTransfer !== 'undefined') {
            window.FileTransfer = oldFileTransfer;
        }
        else {
            delete window.FileTransfer;
        }

        if(typeof oldDevice != 'undefined') {
            window.device = oldDevice;
        }
        else {
            delete window.device;
        }

        if(typeof oldFilenameExtension != 'undefined') {
            SPOKE.config.audioFilenameExtension = oldFilenameExtension;
        }
        else {
            delete SPOKE.config.audioFilenameExtension;
        }
    });

    it("Should create a new file", function () {
        var creatingFile,
            callback = jasmine.createSpy();

        runs(function () {
            creatingFile = SPOKE.files.createFile();
            creatingFile.always(callback);
        });

        waitsFor(function () {
            return callback.calls.length > 0;
        }, "Creating file's promise callback should be called", 250);

        runs(function() {
            expect(callback).toHaveBeenCalledWith(mockFile);
        });
    });

    it("Should delete a file", function () {
        var deletingFile,
            successCallback = jasmine.createSpy(),
            alwaysCallback = jasmine.createSpy();

        runs(function () {
            spyOn(mockFile, 'remove').andCallThrough();

            deletingFile = SPOKE.files.deleteFile('/spoke/' + filename);
            deletingFile.done(successCallback);
            deletingFile.always(alwaysCallback);
        });

        waitsFor(function () {
            return alwaysCallback.calls.length > 0;
        }, "Deleting file's promise callback should be called", 250);

        runs(function() {
            expect(successCallback).toHaveBeenCalled();
            expect(mockFile.remove).toHaveBeenCalled();
        });
    });

    it("Should get directory entries", function () {
        var gettingEntries,
            callback = jasmine.createSpy();

        runs(function () {
            gettingEntries = SPOKE.files.getDirectoryEntries('spoke');
            gettingEntries.always(callback);
        });

        waitsFor(function () {
            return callback.calls.length > 0;
        }, "Getting file entries' promise callback should be called", 250);

        runs(function() {
            expect(callback).toHaveBeenCalledWith([mockFile]);
        });
    });

    it("Should get the full directory path when on Android", function () {
        var gettingPath,
            callback = jasmine.createSpy();

        runs(function () {
            window.device.platform = 'Android';
            gettingPath = SPOKE.files.getFullFilePath("spoke/" + filename);
            gettingPath.always(callback);
        });

        waitsFor(function () {
            return callback.calls.length > 0;
        }, "Getting full file path's promise callback should be called", 250);

        runs(function() {
            expect(callback).toHaveBeenCalledWith("//spoke/" + filename);
        });
    });

    it("Should get the relative directory path when on iOS", function () {
        var gettingPath,
            callback = jasmine.createSpy();

        runs(function () {
            window.device.platform = 'iPhone';
            gettingPath = SPOKE.files.getFullFilePath("spoke/" + filename);
            gettingPath.always(callback);

        });

        waitsFor(function () {
            return callback.calls.length > 0;
        }, "Getting full file path's promise callback should be called", 250);

        runs(function() {
            expect(callback).toHaveBeenCalledWith("spoke/" + filename);
        });
    });

    it("Should upload a file with the supplied params", function () {
        var uploadingFile,
            callback = jasmine.createSpy(),
            params = {'speaker':'abcde'},
            expectedOptions = {
                fileKey : 'audio',
                fileName : mockFile.name,
                chunkedMode : false,
                mimeType : 'audio/3gpp',
                params : params
            };

        runs(function () {
            SPOKE.config.audioFilenameExtension = "3gp";
            spyOn(mockFileTransfer, 'upload').andCallThrough();

            uploadingFile = SPOKE.files.uploadFile(mockFile.fullPath, params);
            uploadingFile.always(callback);
        });

        waitsFor(function () {
            return callback.calls.length > 0;
        }, "Uploading file's promise callback should be called", 250);

        runs(function() {
            expect(callback).toHaveBeenCalled();
            expect(mockFileTransfer.upload).toHaveBeenCalledWith(
                mockFile.fullPath,
                SPOKE.config.apiUrl,
                jasmine.any(Function),
                jasmine.any(Function),
                expectedOptions);
        });
    });

});