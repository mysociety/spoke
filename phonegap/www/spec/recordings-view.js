describe('SPOKE.RecordingsView', function () {
    var recordingsView;
    var recordings;

    beforeEach(function() {
        recordings = new SPOKE.RecordingsCollection();
        $("#stage").append('<div id="page"></div>');
        recordingsView = new SPOKE.RecordingsView({
            el: $("#page"),
            recordings: recordings
        });
    });

    afterEach(function () {
        recordings.remove();
        recordingsView.remove();
    });

    it("Should have a list of recordings", function () {
        expect(recordingsView.recordings).toEqual(recordings);
    });

    it("Should render an empty message when there are no recordings", function () {
        recordingsView.render();
        expect($('#stage')).toContainHtml("<li>There are no recordings yet</li>");
    });

    it("Should render the filename of each recording when there are recordings", function () {
        var recording1 = new SPOKE.Recording({
            name: "acdc.wav",
            path: "/acdc.wav",
            speaker: "http://example.com/speaker/1"
        });
        var recording2 = new SPOKE.Recording({
            name: "jpriest.wav",
            path: "/jpriest.wav",
            speaker: "http://example.com/speaker/2"
        });
        recordings.add(recording1);
        recordings.add(recording2);
        recordingsView.render();
        expect($('#stage')).toContainHtml("<li>acdc.wav</li>");
        expect($('#stage')).toContainHtml("<li>jpriest.wav</li>");
    });

    it("Shouldn't show an upload button when there are no recordings", function () {
        recordingsView.render();
        expect($('#stage')).not.toContainHtml('<a href="#" id="upload-button" data-role="button" data-icon="check">Upload</a>');
    });

    it("Should show an upload button when there are recordings", function () {
        var recording1 = new SPOKE.Recording({
            name: "acdc.wav",
            path: "/acdc.wav",
            speaker: "http://example.com/speaker/1"
        });
        recordings.add(recording1);
        recordingsView.render();
        expect($('#stage')).toContainHtml('<a href="#" id="upload-button" data-role="button" data-icon="check">Upload</a>');
    });

    it("Should try to upload when the upload button is clicked ", function () {
        var recording1 = new SPOKE.Recording({
            name: "acdc.wav",
            path: "/acdc.wav",
            speaker: "http://example.com/speaker/1"
        });
        spyOn(SPOKE.files, "uploadFile").andReturn($.Deferred());
        recordings.add(recording1);
        recordingsView.render();
        $("#upload-button").click();
        expect(SPOKE.files.uploadFile).toHaveBeenCalledWith('/acdc.wav', {speaker: "http://example.com/speaker/1"});
    });

    it("Should try to delete the file if the upload is successful", function () {
        var fakeUploadResult = $.Deferred();
        var recording1 = new SPOKE.Recording({
            name: "acdc.wav",
            path: "/acdc.wav",
            speaker: "http://example.com/speaker/1"
        });

        spyOn(SPOKE.files, "uploadFile").andReturn(fakeUploadResult);
        spyOn(SPOKE.files, "deleteFile").andReturn($.Deferred());

        navigator.notification = jasmine.createSpyObj('navigation', ['alert']);

        recordings.add(recording1);
        recordingsView.render();
        $("#upload-button").click();
        fakeUploadResult.resolve();

        expect(SPOKE.files.deleteFile).toHaveBeenCalledWith('/acdc.wav');
    });

    it("Should remove the model if the upload and delete are successful", function () {
        var fakeUploadResult = $.Deferred();
        var fakeDeleteResult = $.Deferred();
        var recording1 = new SPOKE.Recording({
            name: "acdc.wav",
            path: "/acdc.wav",
            speaker: "http://example.com/speaker/1"
        });

        spyOn(SPOKE.files, "uploadFile").andReturn(fakeUploadResult);
        spyOn(SPOKE.files, "deleteFile").andReturn(fakeDeleteResult);
        spyOn(recording1, "destroy");

        navigator.notification = jasmine.createSpyObj('navigation', ['alert']);

        recordings.add(recording1);
        recordingsView.render();
        $("#upload-button").click();
        fakeUploadResult.resolve();
        fakeDeleteResult.resolve();

        expect(recording1.destroy).toHaveBeenCalled();
    });

    it("Should alert the user if the upload is unsuccessful and not delete the model or file", function () {
        var fakeUploadResult = $.Deferred();
        var recording1 = new SPOKE.Recording({
            name: "acdc.wav",
            path: "/acdc.wav",
            speaker: "http://example.com/speaker/1"
        });

        spyOn(SPOKE.files, "uploadFile").andReturn(fakeUploadResult);
        spyOn(SPOKE.files, "deleteFile");
        spyOn(recording1, "destroy");

        navigator.notification = jasmine.createSpyObj('navigation', ['alert']);

        recordings.add(recording1);
        recordingsView.render();
        $("#upload-button").click();
        fakeUploadResult.reject({code: 1});

        expect(navigator.notification.alert).toHaveBeenCalled();
        expect(recording1.destroy).not.toHaveBeenCalled();
        expect(SPOKE.files.deleteFile).not.toHaveBeenCalled();
    });

    it("Should alert the user if the delete is unsuccessful and not delete model", function () {
        var fakeUploadResult = $.Deferred();
        var fakeDeleteResult = $.Deferred();
        var recording1 = new SPOKE.Recording({
            name: "acdc.wav",
            path: "/acdc.wav",
            speaker: "http://example.com/speaker/1"
        });

        spyOn(SPOKE.files, "uploadFile").andReturn(fakeUploadResult);
        spyOn(SPOKE.files, "deleteFile").andReturn(fakeDeleteResult);
        spyOn(recording1, "destroy");

        navigator.notification = jasmine.createSpyObj('navigation', ['alert']);

        recordings.add(recording1);
        recordingsView.render();
        $("#upload-button").click();
        fakeUploadResult.resolve();
        fakeDeleteResult.reject({code: 1});

        expect(recording1.destroy).not.toHaveBeenCalled();
        expect(navigator.notification.alert).toHaveBeenCalled();
    });
});