describe('Spoke.storage', function() {

    beforeEach(function () {
        // Clean up localStorage
        window.localStorage.clear();
    })

    afterEach(function () {
        // Clean up localStorage
        window.localStorage.clear();
    })
    
    it("Should save a new speaker", function () {

        var storage;
    	
		SPOKE.storage.addSpeakerToRecording("test_filename", "test_speaker");

        storage = JSON.parse(window.localStorage.getItem("SPOKE"));

        expect(storage.recordings['test_filename'].speaker).toBe("test_speaker");

    });

    it("Should retrieve a speaker", function () {

        var storage = {
            recordings: {
                "test_filename": {
                    speaker: "test_speaker"
                }
            }
        };

        window.localStorage.setItem("SPOKE", JSON.stringify(storage));

        expect(SPOKE.storage.getSpeakerForRecording("test_filename")).toBe("test_speaker");

    });

    it("Should delete a recording", function () {

        var storage = {
            recordings: {
                "test_filename": {
                    speaker: "test_speaker"
                }
            }
        };

        window.localStorage.setItem("SPOKE", JSON.stringify(storage));

        SPOKE.storage.removeRecording("test_filename");

        storage = JSON.parse(window.localStorage.getItem("SPOKE"));

        expect(storage.recordings.hasOwnProperty("test_filename")).toBe(false);

    });

});
