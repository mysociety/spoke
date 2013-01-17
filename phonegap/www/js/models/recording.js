/**
 * Recording model
 * Models the data we keep on a recording:
 *    name: the filename of the recording on the device
 *    path: the full path to the recording, in whatever format the device likes it
 *    speaker: the popit url of the speaker on the recording
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        Recording: Backbone.Model.extend({

            localStorage: new Backbone.LocalStorage("Recordings"),

            initialize: function (options) {
                _.bindAll(this);
            },

            refreshLocalStorage: function () {
                this.localStorage = new Backbone.LocalStorage("Recordings");
            },

            addSpeaker: function (speaker) {
                var speakers = this.get("speakers");
                if(_.isUndefined(speakers)) {
                    speakers = [];
                }
                speakers.push({
                    timestamp: new Date().getTime(),
                    speaker: speaker
                });
                this.set("speakers", speakers);
            }
        })
    });

})(SPOKE, Backbone, _, $);