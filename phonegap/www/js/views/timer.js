;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        TimerView: Backbone.View.extend({

            template: _.template($("#timer-template").html()),

            initialize: function (options) {
                console.log('Timer initialising');
                this.render();
                this.listenTo(SPOKE, "startRecording", this.start);
                this.listenTo(SPOKE, "stopRecording", this.stop);
                _.bindAll(this);
            },

            render: function () {
            	console.log("Timer rendering")
            	this.$el.html(this.template());
                return this;
            },

            // Start a HH:MM:SS timer which updates three <span> elements
		    start: function () {

		    	var that = this;

		        console.log('Starting recording timer');

		        // Stop any old one, just in case
		        this.stop();

		        var sec = 0;
		        this.timer = setInterval( function(){
		            that.$el.find('#seconds').html(that.pad(++sec % 60));
		            that.$el.find('#minutes').html(that.pad(parseInt(sec / 60, 10)));
		            that.$el.find('#hours').html(that.pad(parseInt(sec / (60 * 60), 10)));
		        }, 1000);

		    },

		    // Stop the timer and blank the values it holds
		    stop: function() {
		        
		        console.log('Stopping recording timer');

		        if(typeof this.timer !== 'undefined') {
		            clearInterval(this.timer);
		        }

		        this.$el.find('#seconds').html('00');
		        this.$el.find('#minutes').html('00');
		        this.$el.find('#hours').html('00');

		    },

		    // Simple function to pad a number to two digits
		    pad: function ( val ) { 
		        return val > 9 ? val : '0' + val; 
		    }
        })
	});
})(SPOKE, Backbone, _, $);