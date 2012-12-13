/**
 * Spoke/SayIt javascript main setup
 * See individual javascript files like recordings.js and files.js
 * for specific functionality
 */
 var SPOKE = ( function ($) {

    // Use jQuery Deffered to track when both jquery mobile, phonegap, 
	// and the first page are ready
    var my = {},
        pgReady = $.Deferred(),
        jqmReady = $.Deferred(),
        firstPageReady = $.Deferred();

    my.EMPTY_MESSAGE = 'There are no recordings yet';

    /**
     * Setup & Bindings
     */

    // Phonegap is ready
    document.addEventListener('deviceready', pgReady.resolve, false);

    // jQuery Mobile is ready
    $(document).on('mobileinit', jqmReady.resolve);
    
    // The first page ever loaded is ready
    $(document).one('pageinit', function(event) {
    	if(event.target.id === 'record-page') {
    		firstPageReady.resolve();
    	}
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function() {
        // Everything is ready now
    	console.log('Initialising the SayIt app');

        console.log('Device platform is: ' + device.platform);

        my.audioDirectory = 'spoke';
        my.audioFilenameExtension = (device.platform.match(/(iPhone|iPod|iPad)/)) ? '.wav' : '.amr';
        my.recordings = Array();
        my.apiUrl = "http://localhost:8000";
    	
    	// Fire up the record page manually, because a pageinit will have already
    	// happened for it, but before everything else was ready
    	SPOKE.recordingPage.recordPage();
    	
    	// Bind further page initialisation events to do the right stuff for those pages
    	$(document).on('pageinit', function(event) {
	    	switch(event.target.id) {
	            case 'record-page':
	                SPOKE.recordingPage.recordPage();
	                break;
	        }
        });
    });

    return my;

})($);