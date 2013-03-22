/**
 * Login view, the initial view of the app
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        LoginView: Backbone.View.extend({

            template: _.template($("#login-template").html()),

            recordingsView: null,

            recordings: [],

            initialize: function (options) {
                console.log('Login page initialising');
                _.bindAll(this);
            },

            render: function () {
                console.log('Login page rendering');
                this.$el.html(this.template());

                // Force jQuery Mobile to do it's stuff to the template html
                this.$el.trigger("pagecreate");
                return this;
            },

            destroy: function () {
                this.remove();
            }
        })
    });
})(SPOKE, Backbone, _, $);
