describe('SPOKE.SpeakersCollection', function () {
    var speakers;

    beforeEach(function() {
        speakers = new SPOKE.SpeakersCollection();
    });

    afterEach(function () {
        speakers.remove();
    });

    it("Should parse the api response out of response.objects and add a default speaker", function () {
        var fakeResponse = {
            objects: [
                {
                    name: "Steven Day",
                    id: "50",
                }
            ]
        };
        var defaultSpeaker = {
            name: "Unknown",
            id: 0
        };
        var expectedResults = fakeResponse.objects.slice(0);
        expectedResults.unshift(defaultSpeaker);

        var received = speakers.parse(fakeResponse);

        expect(_.first(received)).toEqual(defaultSpeaker);
        expect(received).toEqual(expectedResults);
    });

});
