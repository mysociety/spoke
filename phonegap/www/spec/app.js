describe('SPOKE', function () {
    var appRouter,
        recordingsCollection,
        speakersCollection,
        oldRouter,
        oldRecordingsCollection,
        oldSpeakersCollection;

    beforeEach(function() {
        // Mock things we need to start the app
        appRouter = jasmine.createSpyObj('appRouter',['route', 'navigate']);
        recordingsCollection = jasmine.createSpyObj('recordingsCollection', ['fetch', 'on']);
        speakersCollection = jasmine.createSpyObj('speakersCollection',['fetch']);

        if(SPOKE.hasOwnProperty("AppRouter")) {
            oldRouter = SPOKE.AppRouter;
        }
        SPOKE.AppRouter = function () { return appRouter; };

        if(SPOKE.hasOwnProperty("RecordingsCollection")) {
            oldRecordingsCollection = SPOKE.RecordingsCollection;
        }
        SPOKE.RecordingsCollection = function () { return recordingsCollection; };

        if(SPOKE.hasOwnProperty("SpeakersCollection")) {
            oldSpeakersCollection = SPOKE.SpeakersCollection;
        }
        SPOKE.SpeakersCollection = function () { return speakersCollection; };
    });

    afterEach(function() {
        // Reset all the mocks
        if(typeof oldRouter !== 'undefined') {
            SPOKE.AppRouter = oldRouter;
        }
        else {
            delete SPOKE.AppRouter;
        }

        if(typeof oldRecordingsCollection !== 'undefined') {
            SPOKE.RecordingsCollection = oldRecordingsCollection;
        }
        else {
            delete SPOKE.RecordingsCollection;
        }

        if(typeof oldSpeakersCollection !== 'undefined') {
            SPOKE.SpeakersCollection = oldSpeakersCollection;
        }
        else {
            delete SPOKE.SpeakersCollection;
        }

        SPOKE.destroy();
    });

    it("Should only initialise when everything's ready", function () {
        spyOn(window.SPOKE, 'initialise');

        // Fake the app start
        helper.fakeAppStart();

        // Expect initialise to have been called
        expect(window.SPOKE.initialise).toHaveBeenCalled();
    });

    it("Should create a router when it's initialised", function () {
        SPOKE.initialise();
        expect(SPOKE.router).toBeDefined();
    });

    it("Should create a recordings collection when it's initialised and fetch() it", function () {
        SPOKE.initialise();
        expect(SPOKE.recordings).toBeDefined();
        expect(recordingsCollection.fetch).toHaveBeenCalled();
    });

    it("Should create a speakers collection when it's initialised and fetch() it", function () {
        SPOKE.initialise();
        expect(SPOKE.speakers).toBeDefined();
        expect(speakersCollection.fetch).toHaveBeenCalled();
    });

    it("Should fetch collections when a resume event happens", function () {
        SPOKE.initialise();
        $(document).trigger('resume');
        expect(recordingsCollection.fetch).toHaveBeenCalledWith();
        expect(speakersCollection.fetch).toHaveBeenCalledWith();
    });
});