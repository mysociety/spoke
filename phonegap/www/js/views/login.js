/**
 * Login view, the initial view of the app
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        LoginView: Backbone.View.extend({

            template: _.template($("#login-template").html()),

            login_tokens: [],

            initialize: function (options) {
                console.log('Login page initialising');
		console.log('this.login_tokens is:', this.login_tokens);
		this.login_tokens = options.login_tokens;
		this.listenTo(this.login_tokens, "all", this.render);
                _.bindAll(this);
            },

            render: function () {
                console.log('Login page rendering');
                this.$el.html(this.template({login_tokens: this.login_tokens}));

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
