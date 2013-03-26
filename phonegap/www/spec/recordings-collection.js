describe('SPOKE.RecordingsCollection', function () {
    var recordings;

    beforeEach(function() {
        recordings = new SPOKE.RecordingsCollection();
    });

    afterEach(function () {
        recordings.remove();
    });

    it("Should check the list of files on the device when it's reset", function () {
        spyOn(SPOKE.files, 'getDirectoryEntries').andReturn($.Deferred());
        recordings.reset();
        expect(SPOKE.files.getDirectoryEntries).toHaveBeenCalled();
    });

    it("Should destroy models which don't have a file on the filesystem when it's reset", function () {
        var fakeFilesList = [
            {name: "2.wav"}
        ];
        var fakeGettingFilesResult = $.Deferred();
        var model1 = new SPOKE.Recording({name: "1.wav", path: "/1.wav", speaker: "1"});
        var model2 = new SPOKE.Recording({name: "2.wav", path: "/2.wav", speaker: "2"});

        spyOn(SPOKE.files, 'getDirectoryEntries').andReturn(fakeGettingFilesResult);
        spyOn(model1, 'destroy');
        spyOn(model2, 'destroy');

        recordings.reset([model1, model2]);
        fakeGettingFilesResult.resolve(fakeFilesList);

        expect(model1.destroy).toHaveBeenCalled();
        expect(model2.destroy).not.toHaveBeenCalled();
    });
});
