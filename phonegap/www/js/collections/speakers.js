/**
 * Speakers Collection.
 * A collection of Speaker models
 */
 ;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        SpeakersCollection: Backbone.Collection.extend({
            model: SPOKE.Speaker,

            // Custom parse function because the API returns
            // results wrapped up a bit, and we want to add a default
            // speaker
            parse: function(response) {
                console.log("Parsing response: " + JSON.stringify(response));
                var defaultSpeaker = {
                    name: "Unknown",
                    id: 0
                };
                response.objects.unshift(defaultSpeaker);
                return response.objects;
            }
        })
    });

})(SPOKE, Backbone, _, $);
