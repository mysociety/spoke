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
                this.login_tokens = options.login_tokens;
                console.log('this.login_tokens is:', this.login_tokens);
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

            events: {
                "click #login-tokens a": "login_using_token"
            },

            destroy: function () {
                this.remove();
            },

            login_using_token: function(e) {
                var token = $(e.target).attr('data-token');
                $("#login-token").val(token);
                $("#login-form").submit();
            }
        })
    });
})(SPOKE, Backbone, _, $);
