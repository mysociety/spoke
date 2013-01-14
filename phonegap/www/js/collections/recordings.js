/**
 * Recordings Collection.
 * A collection of Recording models
 */
 ;(function (SPOKE, Backbone, _, $) {
	_.extend(SPOKE, {
		RecordingsCollection: Backbone.Collection.extend({
			model: SPOKE.Recording,
			localStorage: new Backbone.LocalStorage("Recordings")
		})
	});

})(SPOKE, Backbone, _, $);