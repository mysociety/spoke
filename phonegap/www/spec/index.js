describe('app', function() {
    
    it("should fire the record page function when everything's ready", function() {
    	
		spyOn(SPOKE.recordingPage, 'recordPage');
    	// We need to fake all the events which would happen
    	// because this won't be run in a mobile browser
    	helper.fakeAppStart();
    	expect(SPOKE.recordingPage.recordPage).toHaveBeenCalled();

    });
});
