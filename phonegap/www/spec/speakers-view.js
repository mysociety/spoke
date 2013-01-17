describe('SPOKE.SpeakersView', function () {
    var speakersView,
        speakers;

    beforeEach(function() {
        this.speakers = new SPOKE.SpeakersCollection();
        $("#stage").append('<div id="page"></div>');
        this.speakersView = new SPOKE.SpeakersView({
            el: $("#page"),
            speakers: this.speakers
        });
    });

    afterEach(function () {
        this.speakers.remove();
        this.speakersView.remove();
    });

    it("Should have a list of speakers", function () {
        expect(this.speakersView.speakers).toEqual(this.speakers);
    });

    it("Should render an empty message when there are no speakers", function () {
        this.speakersView.render();
        expect($('#stage')).toContainHtml("<li>There are no speakers yet</li>");
    });

    it("Should render the name of each speaker when there are speakers", function () {
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        var speaker2 = new SPOKE.Speaker({
            name: "speaker2",
            meta: {
                api_url: "http://example.com/speaker/2"
            }
        });
        this.speakers.add(speaker1);
        this.speakers.add(speaker2);
        this.speakersView.render();
        expect($('#stage')).toContainHtml('<li><a href="#" class="speaker" data-api-url="http://example.com/speaker/1">speaker1</a></li>');
        expect($('#stage')).toContainHtml('<li><a href="#" class="speaker" data-api-url="http://example.com/speaker/2">speaker2</a></li>');
    });

    it("Should store the live recording, only whilst the recording is happening", function () {
        var fakeRecording = new SPOKE.Recording({
            name: "test.wav",
            fullPath: "test.wav"
        });
        expect(this.speakersView.liveRecording).toEqual(null);
        SPOKE.trigger("startRecording", fakeRecording);
        expect(this.speakersView.liveRecording).toEqual(fakeRecording);
        SPOKE.trigger("stopRecording", fakeRecording);
        expect(this.speakersView.liveRecording).toEqual(null);
    });

    it("Should add a speaker to the liveRecording whenever a speaker is clicked", function () {
        var fakeRecording = new SPOKE.Recording({
            name: "test.wav",
            fullPath: "test.wav"
        });
        var speaker1 = new SPOKE.Speaker({
            name: "speaker1",
            meta: {
                api_url: "http://example.com/speaker/1"
            }
        });
        var speaker2 = new SPOKE.Speaker({
            name: "speaker2",
            meta: {
                api_url: "http://example.com/speaker/2"
            }
        });
        this.speakers.add(speaker1);
        this.speakers.add(speaker2);
        this.speakersView.render();
        expect(this.speakersView.liveRecording).toEqual(null);

        SPOKE.trigger("startRecording", fakeRecording);

        expect(this.speakersView.liveRecording.get("speakers")).toBeUndefined();

        $("#stage a.speaker").first().trigger('click');

        expect(this.speakersView.liveRecording.get("speakers")).toEqual([
            {
                timestamp: jasmine.any(Number),
                speaker: "http://example.com/speaker/1"
            }
        ]);

        $("#stage a.speaker").last().trigger('click');

        expect(this.speakersView.liveRecording.get("speakers")).toEqual([
            {
                timestamp: jasmine.any(Number),
                speaker: "http://example.com/speaker/1"
            },
            {
                timestamp: jasmine.any(Number),
                speaker: "http://example.com/speaker/2"
            }
        ]);

    });
});