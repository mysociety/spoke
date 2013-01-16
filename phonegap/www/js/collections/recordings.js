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
                _.bindAll(this);
            },

            checkFilesExist: function (collection) {

                console.log("Checking current collection against files");

                var that = this,
                    gettingFiles = SPOKE.files.getDirectoryEntries(SPOKE.config.filesDirectory);

                gettingFiles.done(function (files) {
                    var modelsToDelete = [];

                    console.log("Looping over models: " + JSON.stringify(collection));
                    console.log("Files: " + JSON.stringify(files));

                    collection.each(function (model) {

                        console.log("Checking model: " + JSON.stringify(model));

                        var fileExists = false;

                        _.each(files, function(file) {
                            if(file.name === model.get("name")) {
                                console.log("File: " + model.get("name") + " exists");
                                fileExists = true;
                            }
                        });

                        if(!fileExists) {
                            console.log("File: " + model.get("name") + " doesn't exist, model will be deleted.");
                            modelsToDelete.push(model);
                        }

                    });

                    console.log("Models which we're going to delete: " + JSON.stringify(modelsToDelete));

                    _.each(modelsToDelete, function(model){
                        console.log("Deleting model: " + JSON.stringify(model));
                        model.destroy();
                    });

                });
            }
		})
	});
})(SPOKE, Backbone, _, $);