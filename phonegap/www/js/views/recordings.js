/**
 * Recordings view - A list of recordings
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        RecordingsView: Backbone.View.extend({

            template: _.template($("#recordings-template").html()),

            initialize: function (options) {
                console.log('Recordings list initialising');
                this.listenTo(this.collection, "all", this.render);
                _.bindAll(this);
            },

            render: function () {
                console.log('Recordings list rendering');

                console.log(this.collection.toJSON());

                this.$el.html(this.template({recordings: this.collection}));

                return this;
            },

            events: {
                "vclick #upload-button": "uploadButton"
            },

            uploadButton: function (e) {
                e.preventDefault();

                var uploadingPromises = new Array(),
                    that = this;

                console.log('Upload button clicked');

                console.log('Trying to upload the recordings in: ' + this.collection.toJSON());

                // Do the uploading
                this.collection.clone().each(function(recording) {

                    console.log('Uploading file: ' + recording.toJSON());

                    params = {};
                    if(typeof recording.get('speaker') !== "undefined") {
                        params.speaker = recording.get('speaker');
                    }

                    // uploadingFiles is, you guessed it, a Promise
                    var uploadingFile = SPOKE.files.uploadFile(recording.get('path'), params);

                    uploadingPromises.push(uploadingFile);

                    uploadingFile.done(function (result) {

                        // result.response contains the server response if we want
                        // to do anything with it
                        console.log('File: ' + recording.toJSON() + ' successfully uploaded.');
                        
                        // Delete the file from local disk
                        // Another async process, so another Promise
                        deletingFile = SPOKE.files.deleteFile(recording.get('path'));
                        
                        deletingFile.done(function () {
                            console.log('File removed successfully, destroying model');
                            var real_recording = that.collection.get(recording);
                            real_recording.destroy();
                        });

                        deletingFile.fail(function (error) {
                            var message = 'An error occured deleting the file: ' + recording.toJSON() + ' error was: ' + error.code;
                            console.log(message);
                            navigator.notification.alert(message);
                        });

                    });

                    uploadingFile.fail(function (error) {
                        var message = 'Failed to upload the file: ' + recording + ' error code was: ' + error.code;
                        console.log(message);
                        navigator.notification.alert(message);
                    });

                });    

                // When all the promises have completed in some way or another
                $.when.apply(null, uploadingPromises)
                    .done(function () {
                        navigator.notification.alert('All files uploaded');
                    });
            }
        }) 
    });
})(SPOKE, Backbone, _, $);