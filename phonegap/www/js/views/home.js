/**
 * Home view, the initial view of the app
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        HomeView: Backbone.View.extend({

            template: _.template($("#home-template").html()),

            recordingsView: null,

            recordings: [],

            initialize: function (options) {
                console.log('Home page initialising');
                this.recordings = options.recordings;
                // Create a child recordings view that shows up in
                // the #recordings div of our template
                this.recordingsView = new SPOKE.RecordingsView({
                    recordings: this.recordings
                });
                this.listenTo(this.recordings, "all", this.render);
                _.bindAll(this);
            },

            render: function () {
                console.log('Home page rendering');
                this.$el.html(this.template());

                this.recordingsView.setElement(this.$("#recordings")).render();

                // Force jQuery Mobile to do it's stuff to the template html
                this.$el.trigger("pagecreate");
                return this;
            },

            destroy: function () {
                this.recordingsView.remove();
                this.remove();
            }
        })
    });
})(SPOKE, Backbone, _, $);