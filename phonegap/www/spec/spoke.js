describe('Spoke', function() {
    
    it("Should fire the record page function once when everything's ready", function () {
    	
		spyOn(SPOKE.recordingPage, 'recordPage');
    	
    	// We need to fake all the events which would happen
    	// because this won't be run in a mobile browser
    	helper.fakeAppStart();
    	
    	expect(SPOKE.recordingPage.recordPage).toHaveBeenCalled();
    	expect(SPOKE.recordingPage.recordPage.calls.length).toBe(1);

    });

    it("Should fire the record page function when the record page is init-ed", function () {
    	
    	spyOn(SPOKE.recordingPage, 'recordPage');
    	
    	helper.trigger(document.getElementById('record-page'), 'pageinit');

    	expect(SPOKE.recordingPage.recordPage).toHaveBeenCalled();
    	expect(SPOKE.recordingPage.recordPage.calls.length).toBe(1);
    	
    });
});
