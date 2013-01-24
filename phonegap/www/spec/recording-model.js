describe('SPOKE.Recording', function () {
    var recording,
        timestamp,
        oldDate;

    beforeEach(function() {
        this.recording = new SPOKE.Recording({
            name: "1.wav",
            path: "/1.wav"
        });
        // Mock the Date.UTC() method so that we can get the same filename every time
        this.timestamp = new Date('01/01/2000').getTime();
        spyOn(Date, "UTC").andReturn(this.timestamp);
    });

    afterEach(function () {
        this.recording.destroy();
        this.recording = null;
    });

    it("Should have an empty list of speakers initially", function () {
        expect(this.recording.get("speakers")).toBeUndefined();
    });

    it("Should add speakers to it's internal list when addSpeaker is called", function () {
        var fakeSpeaker = "http://www.example.com/speaker/123";

        expect(this.recording.get("speakers")).toBeUndefined();

        this.recording.addSpeaker(fakeSpeaker);

        expect(this.recording.get("speakers")).toEqual([{timestamp: this.timestamp, speaker: fakeSpeaker}]);
    });
});