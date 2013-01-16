/**
 * Recordings Collection.
 * A collection of Recording models
 */
 ;(function (SPOKE, Backbone, _, $) {
	_.extend(SPOKE, {
		RecordingsCollection: Backbone.Collection.extend({
			model: SPOKE.Recording,
			localStorage: new Backbone.LocalStorage("Recordings"),

            initialize: function () {
                // Reset events on the recordings collection
                console.log("Recordings collection initialising");
                this.on('reset', this.checkFilesExist);
            },

            checkFilesExist: function (models, options) {

                console.log("Checking current collection against files");

                var that = this;
                var gettingFiles = SPOKE.files.getDirectoryEntries(SPOKE.config.filesDirectory);


                gettingFiles.done(function (files) {
                    var clonedCollection = that.clone();

                    console.log("Looping over models: " + JSON.stringify(clonedCollection.models));
                    console.log("Files: " + JSON.stringify(files));

                    clonedCollection.each(function (model) {

                        console.log("Checking model: " + JSON.stringify(model.toJSON()));

                        var fileExists = false;

                        _.each(files, function(file) {
                            if(file.name === model.get("name")) {
                                console.log("File: " + model.get("name") + " exists");
                                fileExists = true;
                            }
                        });

                        if(!fileExists) {
                            console.log("File does not exist for model with name: " + model.get("name"));
                            real_model = that.get(model);
                            real_model.destroy();
                        }

                    });

                });
            }
		})
	});
})(SPOKE, Backbone, _, $);