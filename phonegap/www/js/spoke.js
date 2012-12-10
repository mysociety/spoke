/**
 * Spoke/SayIt javascript
 */
 ;(function($, SPOKE) {

    // Use jQuery Deffered to track when both jquery mobile, phonegap, 
	// and the first page are ready
    var pgReady = $.Deferred(),
        jqmReady = $.Deferred(),
        firstPageReady = $.Deferred();

    // Options for phonegap audio capture
    var speechCaptureOptions = {
        limit: 1, // > 1 means more than one recording at a time
        duration: 120, // Max length in seconds
    };

    /**
     * Functions 
     */

    function speechCaptureSuccess(mediaFiles) {
        console.log("Captured Audio:")
        console.log(mediaFiles);
    }  

    function speechCaptureError(error) {
        console.log("Error capturing audio:");
        console.log(error);
    }
    
    function recordPage() {
    	console.log("Binding record page click handlers")
    	$("#record-button").on("tap", function(e) {
            e.preventDefault();

            console.log("Capturing Audio");

            // Start recording a new audio file
            var capture = navigator.device.capture;
            capture.captureAudio(
                speechCaptureSuccess,
                speechCaptureError,
                speechCaptureOptions);
        });
    }

    /**
     * Setup & Bindings
     */

    // Phonegap is ready
    document.addEventListener('deviceready', pgReady.resolve, false);

    // jQuery Mobile is ready
    $(document).on('mobileinit', jqmReady.resolve);
    
    // The first page ever loaded is ready
    $(document).one('pageinit', function(event) {
    	if(event.target.id === "record-page") {
    		firstPageReady.resolve();
    	}
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function() {
        // Everything is ready now
    	console.log("Initialising the SayIt app");
    	
    	// Fire up the record page manually, because a pageinit will have already
    	// happened for it, but probably before everything else was ready
    	recordPage();
    	
    	// Bind further page initialisation events to do the right stuff for those pages
    	$(document).on('pageinit', function(event) {
	    	switch(event.target.id) {
	            case "record-page":
	                recordPage();
	                break;
	        }
        });
    });

})($, SPOKE);