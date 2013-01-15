/**
 * Speakers Collection.
 * A collection of Speaker models
 */
 ;(function (SPOKE, Backbone, _, $) {
	_.extend(SPOKE, {
		SpeakersCollection: Backbone.Collection.extend({
			model: SPOKE.Speaker,
			url: SPOKE.config.popItUrl + '/api/v0.1/person/',
			
			// Custom parse function because the popit API returns
			// results wrapped up a bit, and we want to add a default
			// speaker
			parse: function(response) {
				var defaultSpeaker = {
					name: "Unknown",
					api_url: ""
				};
				response.results.unshift(defaultSpeaker);
				return response.results;
			}
		})
	});

})(SPOKE, Backbone, _, $);