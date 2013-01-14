/**
 * Home view, the initial view of the app
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        HomeView: Backbone.View.extend({

            template: _.template($("#home-template").html()),

            initialize: function (options) {
                console.log('Home page initialising');
                this.listenTo(this.collection, "all", this.render);
            },

            render: function () {
                var recordingsView;
                console.log('Home page rendering');
                this.$el.html(this.template());
                // Create a child recordings view that shows up in
                // the #recordings div of our template
                recordingsView = new SPOKE.RecordingsView({
                    el: this.$el.find("#recordings"),
                    collection: this.collection
                });
                recordingsView.render();
                // Force jQuery Mobile to do it's stuff to the template html
                this.$el.trigger("pagecreate");
                return this;
            },

            events: {
                "vclick #record-button": "recordButton"
            },

            recordButton: function (e) {
                e.preventDefault();
                console.log('Recording Audio');
            }
        }) 
    });
})(SPOKE, Backbone, _, $);