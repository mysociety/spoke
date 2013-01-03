/**
 * Things to do with localStorage
 */ 

SPOKE.storage = ( function($, SPOKE) {
	
	var my = {};

	my.addSpeakerToRecording = function (filename, speaker) {

		console.log("Saving speaker: " + speaker + " for filename: " + filename);

		var storage = getStorageObject();
		if(!storage.recordings.hasOwnProperty(filename)) {
			storage.recordings[filename] = {};
		}
		storage.recordings[filename].speaker = speaker;

		saveStorageObject(storage);
	}

	my.getSpeakerForRecording = function (filename) {

		console.log("Returning speaker for filename: " + filename);

		var storage = getStorageObject();

		if(storage.recordings.hasOwnProperty(filename) 
			&& storage.recordings[filename].hasOwnProperty('speaker')) {

			return storage.recordings[filename].speaker;
		}		
		else {

			console.log("Filename not found or has no speaker");
			return null;
		}
	}

	function getStorageObject() {

		console.log("Getting storage object from localStorage");

		var storage_string = window.localStorage.getItem("SPOKE");

		console.log("Storage object is: " + storage_string);
		
		if(storage_string === null) {
			
			console.log("No current storage object, so creating one");
			
			return createStorageObject();
		} 
		else {
			return JSON.parse(storage_string);
		}
	}

	function createStorageObject() {
		
		console.log("Creating storage object");

		var object = {
			recordings: {}
		};
		
		window.localStorage.setItem("SPOKE", JSON.stringify(object));
		
		return object;
	}

	function saveStorageObject(object) {

		var storage_string = JSON.stringify(object);
		
		console.log("Saving storage object" + storage_string);

		window.localStorage.setItem("SPOKE", storage_string);
	}

	return my;

})($, SPOKE);