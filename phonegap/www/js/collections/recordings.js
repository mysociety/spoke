/**
 * Recordings Collection.
 * A collection of Recording models
 */
 ;(function (SPOKE, Backbone, _, $) {
	_.extend(SPOKE, {
		RecordingsCollection: Backbone.Collection.extend({
			model: SPOKE.Recording,
			url: SPOKE.apiUrl
		})
	});

})(SPOKE, Backbone, _, $);