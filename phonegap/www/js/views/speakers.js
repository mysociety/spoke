/**
 * Speakers view - A list of speakers
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        SpeakersView: Backbone.View.extend({

            template: _.template($("#speakers-template").html()),

            speakers: [],

            liveRecording: null,

            initialize: function (options) {
                console.log('Speaker list initialising');
                this.speakers = options.speakers;
                this.listenTo(SPOKE, 'startRecording', function (liveRecording) {
                    this.liveRecording = liveRecording;
                });
                this.listenTo(SPOKE, 'stopRecording', function() {
                    this.liveRecording = null;
                });
                _.bindAll(this);
            },

            render: function () {
                console.log('Speaker list rendering');

                console.log(JSON.stringify(this.speakers.toJSON()));

                this.$el.html(this.template({speakers: this.speakers}));

                return this;
            },

            events: {
                "click a.speaker": "speakerChange"
            },

            speakerChange: function(e) {
                console.log("Speaker clicked");
                e.preventDefault();
                if(!_.isNull(this.liveRecording)) {
                    console.log("Adding speaker to live recording");
                    var speaker = $(e.target).attr("data-api-url");
                    this.liveRecording.addSpeaker(speaker);
                }
            }
        })
    });
})(SPOKE, Backbone, _, $);