describe('SPOKE.SpeakersView', function () {
    var speakersView;
    var speakers;

    beforeEach(function() {
        speakers = new SPOKE.SpeakersCollection();
        $("#stage").append('<div id="page"></div>');
        speakersView = new SPOKE.SpeakersView({
            el: $("#page"),
            speakers: speakers
        });
    });

    afterEach(function () {
        speakers.remove();
        speakersView.remove();
    });

    it("Should have a list of speakers", function () {
        expect(speakersView.speakers).toEqual(speakers);
    });

    it("Should render an empty message when there are no speakers", function () {
        speakersView.render();
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
        speakers.add(speaker1);
        speakers.add(speaker2);
        speakersView.render();
        expect($('#stage')).toContainHtml('<li><a href="#" class="speaker" data-api-url="http://example.com/speaker/1">speaker1</a></li>');
        expect($('#stage')).toContainHtml('<li><a href="#" class="speaker" data-api-url="http://example.com/speaker/2">speaker2</a></li>');
    });
});