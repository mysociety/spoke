describe('Spoke.files', function () {

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
		oldFileTransfer;

	beforeEach(function () {		
		var timestamp, filesEntries;

		// Mock the Date() object so that we can get the same filename every time
		oldDate = Date;
		Date = function (fake) {
			return new oldDate('01/01/2000');
		};
		timestamp = new Date().getTime();

        // Mock the phonegap file apis	
        filename = "recording_" + timestamp + SPOKE.audioFilenameExtension;
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
        if(window.hasOwnProperty("LocalFileSystem")) {;
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

    });

	afterEach(function() {
		// Undo all the crazy mocking we did
		Date = oldDate;
		
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
	});

    it("Should create a new file", function () {
    	var creatingFile,
    		callback = jasmine.createSpy();

    	runs(function () {
    		creatingFile = SPOKE.files.createFile();
    		creatingFile.always(callback);
    	});

    	waitsFor(function () {
    		return callback.calls.length > 0
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
    		return alwaysCallback.calls.length > 0
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
    		return callback.calls.length > 0
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
    		return callback.calls.length > 0
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

    		// Reset the platform to Android as the default
    		window.device.platform = 'Android';
    		gettingPath.always(callback);

    	});

    	waitsFor(function () {
    		return callback.calls.length > 0
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
    		spyOn(mockFileTransfer, 'upload').andCallThrough();

    		uploadingFile = SPOKE.files.uploadFile(mockFile.fullPath, params);
    		uploadingFile.always(callback);
    	});

    	waitsFor(function () {
    		return callback.calls.length > 0
    	}, "Uploading file's promise callback should be called", 250);

    	runs(function() {
    		expect(callback).toHaveBeenCalled();
    		expect(mockFileTransfer.upload).toHaveBeenCalledWith(
    			mockFile.fullPath, 
    			SPOKE.apiUrl, 
    			jasmine.any(Function), 
    			jasmine.any(Function), 
    			expectedOptions);
    	});
    });
	
});