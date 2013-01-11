/**
 * Home view, the initial view of the app
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        HomeView: Backbone.View.extend({

            template: _.template($("#home").html()),

            initialize: function (options) {
                console.log('Home page initialising');

                //this.listenTo(this.model, "change", this.render);
                // Phonegap's resume event for when the app is resumed
                this.listenTo($(document), "resume", this.render);
            },

            render: function () {
                console.log('Home page rendering');

                this.$el.html(this.template());
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