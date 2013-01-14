/**
 * Speakers Collection.
 * A collection of Speaker models
 */
 ;(function (SPOKE, Backbone, _, $) {
	_.extend(SPOKE, {
		SpeakersCollection: Backbone.Collection.extend({
			model: SPOKE.Speaker,
			url: SPOKE.config.popItUrl + '/api/v0.1/person/',
		})
	});

})(SPOKE, Backbone, _, $);