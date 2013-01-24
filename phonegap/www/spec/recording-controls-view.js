describe('SPOKE.RecordingControlsView', function () {
    var recordingControlsView,
        speakers,
        recordings,
        oldMedia,
        oldNotification;

    beforeEach(function() {
        speakers = new SPOKE.SpeakersCollection();
        recordings = new SPOKE.RecordingsCollection();
        $("#stage").append('<div id="page"></div>');
        recordingControlsView = new SPOKE.RecordingControlsView({
            el: $("#page"),
            speakers: speakers,
            recordings: recordings
        });
        if(window.hasOwnProperty("Media")) {
            oldMedia = window.Media;
        }
        // We don't mock window.Media() because it's complicated and needs
        // behaviour specifying, so use helper.mockMedia when you want it
        if(navigator.hasOwnProperty('notification')) {
            oldNotification = navigator.notification;
        }
        navigator.notification = jasmine.createSpyObj('navigation', ['alert']);
    });

    afterEach(function () {
        speakers.remove();
        recordings.remove();
        recordingControlsView.remove();
        if(typeof oldMedia !== 'undefined') {
            window.Media = oldMedia;
        }
        else {
            delete window.Media;
        }
        if(typeof oldNotification !== 'undefined') {
            navigator.notification = oldNotification;
        }
        else {
            delete navigator.notification;
        }
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

    it("Should alert the user when something goes wrong creating a recording file", function () {
        var fakeCreatingFile = $.Deferred();
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        speakers.add(speaker1);

        spyOn(SPOKE.files, "createFile").andReturn(fakeCreatingFile);

        recordingControlsView.render();

        $("#stage a.speaker").first().trigger("click");
        fakeCreatingFile.reject({code: 1});

        expect(navigator.notification.alert).toHaveBeenCalledWith('Something went wrong creating a file, error code: 1');
    });

    it("Should show a timer and a stop button, and hide the title when recording starts", function () {
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

        expect("#stop-button").not.toBeHidden();
        expect("#timer").not.toBeHidden();
    });

    it("Should re-render when recording stops", function () {
        var fakeCreatingFile = $.Deferred();
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        var media = jasmine.createSpyObj('media', ['startRecord', 'stopRecord']);
        var expectedRecording = {
            name: "1.wav",
            path: "/1.wav"
        };

        speakers.add(speaker1);
        spyOn(SPOKE.files, "createFile").andReturn(fakeCreatingFile);
        spyOn(recordings, "create");
        window.Media = helper.mockMedia(true);

        runs(function() {
            recordingControlsView.render();
            $("#stage a.speaker").first().trigger("click");
            fakeCreatingFile.resolve({name: "1.wav", fullPath: "/1.wav"});
            $("#stage #stop-button").trigger('click');
        });

        waitsFor(function () {
            return $("#stop-button").css('display') === "none";
        }, "Footer should be hidden", 500);

        runs(function () {
            expect($("#stop-button").css('display')).toEqual("none");
            expect($("#stop-button").css('display')).toEqual("none");
            expect("#intro-title").not.toBeHidden();
        });

    });

    it("Should save the recording into the recordings collection when recording stops", function () {
        var fakeCreatingFile = $.Deferred();
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        var media = jasmine.createSpyObj('media', ['startRecord', 'stopRecord']);
        var expectedRecording = {
            name: "1.wav",
            path: "/1.wav"
        };

        speakers.add(speaker1);
        spyOn(SPOKE.files, "createFile").andReturn(fakeCreatingFile);
        spyOn(recordings, "create");
        window.Media = helper.mockMedia(true);

        recordingControlsView.render();
        $("#stage a.speaker").first().trigger("click");
        fakeCreatingFile.resolve({name: "1.wav", fullPath: "/1.wav"});
        $("#stop-button").trigger('click');

        expect(recordings.create).toHaveBeenCalled();
    });

    it("Should alert the user when recording finishes successfully", function () {
        var fakeCreatingFile = $.Deferred();
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        var media = jasmine.createSpyObj('media', ['startRecord', 'stopRecord']);
        var expectedRecording = {
            name: "1.wav",
            path: "/1.wav"
        };

        speakers.add(speaker1);
        spyOn(SPOKE.files, "createFile").andReturn(fakeCreatingFile);
        spyOn(recordings, "create");
        window.Media = helper.mockMedia(true);

        recordingControlsView.render();
        $("#stage a.speaker").first().trigger("click");
        fakeCreatingFile.resolve({name: "1.wav", fullPath: "/1.wav"});
        $("#stop-button").trigger('click');

        expect(navigator.notification.alert).toHaveBeenCalledWith('Recording saved!');
    });

    it("Should alert the user when something goes wrong with recording", function () {
        var fakeCreatingFile = $.Deferred();
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        var media = jasmine.createSpyObj('media', ['startRecord', 'stopRecord']);
        var expectedRecording = {
            name: "1.wav",
            path: "/1.wav"
        };

        speakers.add(speaker1);
        spyOn(SPOKE.files, "createFile").andReturn(fakeCreatingFile);
        spyOn(recordings, "create");
        window.Media = helper.mockMedia(false);

        recordingControlsView.render();
        $("#stage a.speaker").first().trigger("click");
        fakeCreatingFile.resolve({name: "1.wav", fullPath: "/1.wav"});
        $("#stop-button").trigger('click');

        expect(navigator.notification.alert).toHaveBeenCalledWith('Something went wrong recording the audio: mock error');
    });

});