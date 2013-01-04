describe('Spoke.files', function () {

	// Mock instance variables
	var filename,
		mockFile, 
		mockRootDirectoryReader,		
		mockRootDirectory,
		mockFilesDirectoryReader,
		mockFilesDirectory,
		mockFileSystem,
		oldDate,
		oldLocalFileSystem,
		oldRequestFileSystem;

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
	
});