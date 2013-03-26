describe('SPOKE.Recording', function () {
    var recording,
        timestamp,
        oldDate;

    beforeEach(function() {
        this.recording = new SPOKE.Recording({
            name: "1.wav",
            path: "/1.wav"
        });
        // Mock the moment.utc() method so that we can get the same filename every time
        this.timestamp = moment.utc([2000, 0, 1, 0, 0, 0, 0]);
        spyOn(moment, "utc").andReturn(this.timestamp);
    });

    afterEach(function () {
        this.recording.destroy();
        this.recording = null;
    });

    it("Should have an empty list of speakers initially", function () {
        expect(this.recording.get("speakers")).toBeUndefined();
    });

    it("Should add speakers to it's internal list when addSpeaker is called", function () {
        var fakeSpeaker = "123";

        expect(this.recording.get("speakers")).toBeUndefined();

        this.recording.addSpeaker(fakeSpeaker);

        expect(this.recording.get("speakers")).toEqual([{timestamp: this.timestamp.valueOf(), speaker: fakeSpeaker}]);
    });
});
