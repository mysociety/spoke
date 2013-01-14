/**
 * Speakers view - A list of speakers
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        SpeakersView: Backbone.View.extend({

            template: _.template($("#speakers-template").html()),

            initialize: function (options) {
                console.log('Speaker list initialising');
                this.listenTo(this.collection, "all", this.render);
            },

            render: function () {
                console.log('Speaker list rendering');

                console.log(this.collection);

                this.$el.html(this.template({speakers: this.collection}));

                return this;
            }
        }) 
    });
})(SPOKE, Backbone, _, $);