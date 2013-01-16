/**
 * Speakers view - A list of speakers
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        SpeakersView: Backbone.View.extend({

            template: _.template($("#speakers-template").html()),

            speakers: [],

            initialize: function (options) {
                console.log('Speaker list initialising');
                this.speakers = options.speakers;
                _.bindAll(this);
            },

            render: function () {
                console.log('Speaker list rendering');

                console.log(JSON.stringify(this.speakers.toJSON()));

                this.$el.html(this.template({speakers: this.speakers}));

                return this;
            },

            events: {
                "vclick a.speaker": "speakerChange"
            },

            speakerChange: function(e) {
                e.preventDefault();
                console.log("Speaker clicked");
            }
        })
    });
})(SPOKE, Backbone, _, $);