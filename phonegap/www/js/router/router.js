/**
* Router
* An extended version of Backbone's Router class which provides
* the 'glue' that combines our models and views into an app that
* responds to url changes. Uses jQuery Mobile's manual "changePage"
* function to actually do the changing, so that jQM understands
* what Backbone is playing at.
*/
;(function (SPOKE, Backbone, _, $) {
    _.extend(SPOKE, {
        AppRouter: Backbone.Router.extend({

            currentView: null,

            routes:{
                "": "home",
                "recording": "recording"
            },

            home: function () {
                this.changePage(new SPOKE.HomeView({
                        tagName: 'div',
                        id: "home-page",
                        attributes: {
                            "data-role": "page"
                        },
                        recordings: SPOKE.recordings
                    })
                );
            },

            recording: function () {
                this.changePage(new SPOKE.RecordingControlsView({
                        tagName: 'div',
                        id: "recording-page",
                        attributes: {
                            "data-role": "page"
                        },
                        speakers: SPOKE.speakers,
                        recordings: SPOKE.recordings
                    })
                );
            },

            changePage:function (view) {
                view.render();
                $("body").append($(view.el));
                // Tell jQuery Mobile what just happened
                $.mobile.changePage(
                    $(view.el),
                    {
                        changeHash: false,
                        transition: $.mobile.defaultPageTransition
                    }
                );
                // Remove the old view
                if(!_.isNull(this.currentView)) {
                    this.currentView.destroy();
                }
                // Keep track of the current view for next time
                this.currentView = view;
            }

        })
    });
})(SPOKE, Backbone, _, $);