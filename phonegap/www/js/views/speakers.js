/**
 * Speakers view - A list of speakers
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        SpeakersView: Backbone.View.extend({

            template: _.template($("#speakers-template").html()),

            speakers: [],

            liveRecording: null,

            selectedListItem: null,

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
                var listItem = $(e.target).parents("li").first();

                console.log("Speaker clicked");

                e.preventDefault();

                if(!_.isNull(this.liveRecording)) {
                    var speaker = $(e.target).attr("data-id");
                    console.log("Adding speaker: " + speaker + " to live recording");
                    this.liveRecording.addSpeaker(speaker);
                }

                // Update the styles to make it look like the speaker is selected
                // Deselect the old selectedListItem if there is any
                if(!_.isNull(this.selectedListItem)) {
                    this.deselectListItem(this.selectedListItem);
                }
                // select the current list item and save it in this.selectedListItem
                this.selectListItem(listItem);
                this.selectedListItem = listItem;
            },

            deselectListItem: function (item) {
                $(item).removeClass("ui-btn-down-a").addClass("ui-btn-up-c");
            },

            selectListItem: function (item) {
                $(item).removeClass("ui-btn-up-c").addClass("ui-btn-down-a");
            }
        })
    });
})(SPOKE, Backbone, _, $);
