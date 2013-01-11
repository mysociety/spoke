/**
 * Recordings view - A list of recordings
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        RecordingsView: Backbone.View.extend({

            template: _.template($("#recordings-template").html()),

            initialize: function (options) {
                console.log('Recordings list initialising');
                // TODO - give it a collection of recordings!
            },

            render: function () {
                console.log('Recordings list rendering');

                this.$el.html(this.template({recordings: {}));

                return this;
            },

            events: {
                "vclick #upload-button": "uploadButton"
            },

            uploadButton: function (e) {
                e.preventDefault();
                
                console.log('Uploading Audio');
            }
        }) 
    });
})(SPOKE, Backbone, _, $);