/**
 * Recordings view - A list of recordings
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        RecordingsView: Backbone.View.extend({

            template: _.template($("#recordings-template").html()),

            uploadingMsgTemplate: _.template($("#uploading-message").html()),

            recordings: [],

            uploadPercentages: [],

            initialize: function (options) {
                console.log('Recordings list initialising');
                this.recordings = options.recordings;
                this.listenTo(this.recordings, "all", this.render);
                _.bindAll(this);
            },

            render: function () {
                console.log('Recordings list rendering');
                console.log(this.recordings.toJSON());
                this.$el.html(this.template({recordings: this.recordings}));
                return this;
            },

            showUploadingDialog: function() {
                // Show the loader with the current percentages
                $.mobile.loading('show', {
                    theme:'a',
                    textonly:false,
                    textVisible:true,
                    html: this.uploadingMsgTemplate({
                        fileCount: this.recordings.length,
                        uploadPercentages:this.uploadPercentages
                    })
                });
            },

            updateUploadingPercentage: function(index, percentage) {
                this.uploadPercentages[index] = percentage;
                $("#uploading-percentage-" + index).html(percentage);
            },

            events: {
                "click #upload-button": "uploadButton"
            },

            uploadButton: function (e) {
                e.preventDefault();

                var uploadingPromises = [],
                    that = this;

                console.log('Upload button clicked');

                console.log('Trying to upload the recordings in: ' + this.recordings.toJSON());

                // Populate the initial percentages and show the loading screen
                for(var i = 0; i < this.recordings.length; i++) {
                    this.uploadPercentages[i] = 0;
                }
                this.showUploadingDialog();

                // Do the uploading
                this.recordings.clone().each(function(recording, index) {

                    console.log('Uploading file: ' + JSON.stringify(recording.toJSON()));

                    params = {};
                    if(!_.isUndefined(recording.get('speakers'))) {
                        params.timestamps = recording.get('speakers');
                    }

                    // Upload progress callback
                    // TODO - make this something that the view binds to and thus updates
                    // automatically with a new render?
                    var progress = function(progressEvent) {
                        if(progressEvent.lengthComputable) {
                            console.log("Upload progress Event for file at index: " + index);
                            console.log("Loaded: " + progressEvent.loaded + " total: " + progressEvent.total);
                            var percentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                            that.updateUploadingPercentage(index, percentage);
                        }
                    };

                    // uploadingFiles is, you guessed it, a Promise
                    var uploadingFile = SPOKE.files.uploadFile(recording.get('path'), params, progress);
                    uploadingPromises.push(uploadingFile);

                    uploadingFile.done(function (result) {

                        // result.response contains the server response if we want
                        // to do anything with it
                        console.log('File: ' + JSON.stringify(recording.toJSON()) + ' successfully uploaded.');

                        // Update the percentage
                        that.updateUploadingPercentage(index, 100);

                        // Delete the file from local disk
                        // Another async process, so another Promise
                        deletingFile = SPOKE.files.deleteFile(recording.get('path'));

                        deletingFile.done(function () {
                            console.log('File removed successfully, destroying model');
                            var real_recording = that.recordings.get(recording);
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
                $.whenAll.apply(null, uploadingPromises)
                    .done(function () {
                        navigator.notification.alert('All files uploaded');
                    })
                    .always(function () {
                        // Hide the loader
                        $.mobile.loading('hide');
                    });
            }
        })
    });
})(SPOKE, Backbone, _, $);