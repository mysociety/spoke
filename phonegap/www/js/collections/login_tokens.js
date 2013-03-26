/**
 * LoginTokens Collection.
 * A collection of LoginToken models
 */

 ;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        LoginTokensCollection: Backbone.Collection.extend({
            model: SPOKE.LoginToken,
            localStorage: new Backbone.LocalStorage("LoginTokens"),

            initialize: function () {
                // Reset events on the login tokens collection
                console.log("LoginTokens collection initialising");
                _.bindAll(this);
            },

            refreshLocalStorage: function () {
                this.localStorage = new Backbone.LocalStorage("LoginTokens");
                _.each(this.models, function(model) {
                    model.refreshLocalStorage();
                });
            }
        })
    });
})(SPOKE, Backbone, _, $);
