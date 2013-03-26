/**
 * Login token model
 * Models one of the three-word login tokens that has been previously used
 */
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        LoginToken: Backbone.Model.extend({

            validate: function (attributes) {
                if (!attributes.three_word_token) {
                    return "A LoginToken must at least have three_word_token set";
                }
            },

            initialize: function () {
                _.bindAll(this);
            },

            defaults: {
                instance: null,
                user: null,
                cookie: null
            },

            authenticated: function () {
                return ! (this.instance === null && this.user === null);
            },

            toString: function () {
                if (this.authenticated()) {
                    return this.get('instance').label + " as " +
                        this.get('user');
                } else {
                    return "[unused] " + this.three_word_token;
                }
            },

            localStorage: new Backbone.LocalStorage("LoginTokens"),

            refreshLocalStorage: function () {
                this.localStorage = new Backbone.LocalStorage("LoginTokens");
            }

        })
    });

})(SPOKE, Backbone, _, $);
