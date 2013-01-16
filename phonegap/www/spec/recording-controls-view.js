describe('SPOKE.RecordingControlsView', function () {
    var recordingControlsView;
    var speakers;
    var recordings;

    beforeEach(function() {
        speakers = new SPOKE.SpeakersCollection();
        recordings = new SPOKE.RecordingsCollection();
        $("#stage").append('<div id="page"></div>');
        recordingControlsView = new SPOKE.RecordingControlsView({
            el: $("#page"),
            speakers: speakers,
            recordings: recordings
        });
    });

    afterEach(function () {
        speakers.remove();
        recordings.remove();
        recordingControlsView.remove();
    });

    it("Should have a list of speakers and a list of recordings", function () {
        expect(recordingControlsView.speakers).toEqual(speakers);
        expect(recordingControlsView.recordings).toEqual(recordings);
    });

    it("Should create a recording file when the first speaker is clicked, but not for subsequent clicks", function () {
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        speakers.add(speaker1);
        spyOn(SPOKE.files, "createFile").andReturn($.Deferred());

        recordingControlsView.render();

        $("#stage a.speaker").first().trigger("click");

        expect(SPOKE.files.createFile).toHaveBeenCalled();

        $("#stage a.speaker").first().trigger("click");

        expect(SPOKE.files.createFile.calls.length).toEqual(1);

    });

});