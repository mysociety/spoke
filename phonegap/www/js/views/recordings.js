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
            },

            render: function () {
                console.log('Recordings list rendering');

                console.log(this.collection);

                this.$el.html(this.template({recordings: this.collection}));

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