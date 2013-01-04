afterEach(function() {
    document.getElementById('stage').innerHTML = '';
});

var helper = {
    
    // Trigger an event from a particular object
    trigger: function(obj, name) {
        var e = document.createEvent('Event');
        e.initEvent(name, true, true);
        obj.dispatchEvent(e);
    },

    // Get the computed style for an element
    getComputedStyle: function(querySelector, property) {
        var element = document.querySelector(querySelector);
        return window.getComputedStyle(element).getPropertyValue(property);
    },

    // Fake the starting up of a JQM + Phonegap app
    fakeAppStart: function() {
        // Create a fake jquery mobile page
        var pageDiv = window.document.createElement("div");
        pageDiv.id = 'record-page';
        $('body').append(pageDiv);

        // create a fake device object
        window.device = {
            platform: "Android"
        };

        helper.trigger(window.document, 'deviceready');
        helper.trigger(window.document, 'mobileinit');  
        helper.trigger(pageDiv, 'pageinit');
    },

    // Mock File object from Phonegap's File api
    mockFile: function (name, fullPath) {
        return {
            isFile: true,
            isDirectory: false,
            name: name,
            fullPath: fullPath,
            remove: function(onSuccess, onError) {
                onSuccess();
            }
        }
    },

    // Mock Directory object from Phonegap's File api
    mockDirectory: function(name, fullPath, entries, reader) {
        return {
            isFile: false,
            isDirectory: true,
            name: name,
            fullPath: fullPath,
            getFile: function(path, options, onSuccess, onError) {
                if(entries.hasOwnProperty(path)) {
                    onSuccess(entries[path]);
                }
                else {
                    onError({code:1});
                }
            },
            createReader: function() {
                return reader;
            },
            getDirectory: function(path, options, onSuccess, onError) {
                if(entries.hasOwnProperty(path)) {
                    onSuccess(entries[path]);
                }
                else {
                    onError({code:1});
                }
            },
        }
    },

    // Function to create a mock DirectoryReader object
    mockDirectoryReader: function(files) {
        return {
            readEntries: function (onSuccess, onFail) {
                onSuccess(files);
            }
        }
    },

    // Function to create a mock FileSystem object from Phonegap's File api
    mockFileSystem: function(name, root) {
        return {
            name: name,
            root: root
        }
    },

    // Function to create a mock requestFileSystem method from Phonegap's File api
    mockRequestFileSystem: function(returnSuccess, fileSystem, error) {

        return function(type, someNumber, onSuccess, onFail) {
            
            if(returnSuccess) {
                onSuccess(fileSystem);
            }
            else {
                onFail(error);
            }
        };
    },

    // Function to create a mock FileTransfer object
    mockFileTransfer: function(shouldSucceed) {
        return {
            upload: function(path, url, onSuccess, onError, options) {
                if(shouldSucceed) {
                    onSuccess({});
                }
                else {
                    onError({code:1});
                }
            }
        }
    },

    mockFileUploadOptions: function() {
        return {};
    }

};
