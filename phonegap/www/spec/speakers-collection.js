describe('SPOKE.SpeakersCollection', function () {
    var speakers;

    beforeEach(function() {
        speakers = new SPOKE.SpeakersCollection();
    });

    afterEach(function () {
        speakers.remove();
    });

    it("Should parse the api response out of response.results and add a default speaker", function () {
        var fakeResponse = {
            results: [
                {
                    name: "Steven Day",
                    slug: "steven-day",
                    personal_details: {
                        date_of_death: {
                        formatted: "",
                        end: null,
                        start: null
                        },
                        date_of_birth: {
                            formatted: "",
                            end: null,
                            start: null
                        }
                    },
                    images: [ ],
                    links: [ ],
                    contact_details: [ ],
                    other_names: [ ],
                    id: "50d1b17071ec32dd6e0019f3",
                    meta: {
                        api_url: "http://spoke-testing.popit.mysociety.org/api/v0.1/person/50d1b17071ec32dd6e0019f3",
                        edit_url: "http://spoke-testing.popit.mysociety.org/person/steven-day"
                    }
                }
            ]
        };
        var defaultSpeaker = {
            name: "Unknown",
            meta: {
                api_url: ""
            }
        };
        var expectedResults = fakeResponse.results.slice(0);
        expectedResults.unshift(defaultSpeaker);

        var received = speakers.parse(fakeResponse);

        expect(_.first(received)).toEqual(defaultSpeaker);
        expect(received).toEqual(expectedResults);
    });

});