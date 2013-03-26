/**
 * Spoke javascript main setup
 */
;(function (SPOKE, Backbone, _, $) {

    var pgReady = $.Deferred(),
        jqmReady = $.Deferred(),
        firstPageReady = $.Deferred();

    // Phonegap is ready
    document.addEventListener('deviceready', pgReady.resolve, false);

    // jQuery Mobile is ready
    $(document).on('mobileinit', jqmReady.resolve);

    // The first page ever loaded is ready
    $(document).one('pageinit', function(event) {
        firstPageReady.resolve();
    });

    var extractSessionIDFromCookieHeader = function(s) {
        var m = s.match(/s=([0-9a-f]+)/);
        if (m) {
            return m[1];
        } else {
            return null;
        }
    };

    // Add an init action to spoke
    _.extend(SPOKE, {
        initialise: function () {
            // Everything is ready now
            console.log('Initialising the SPOKE app');

            // Initialise the app object
            _.extend(SPOKE, {
                router: new SPOKE.AppRouter(),
                recordings: new SPOKE.RecordingsCollection(),
                speakers: new SPOKE.SpeakersCollection(),
                login_tokens: new SPOKE.LoginTokensCollection(),
                currentLoginToken: null,
                instanceUrl: null
            });

            // Extend SPOKE with Backbone event handling, so we can register
            // app-wide events
            _.extend(SPOKE, Backbone.Events);

            // Work out while filename extension to use
            SPOKE.config.audioFilenameExtension = (device.platform.match(/(iPhone|iPod|iPad)/)) ? '.wav' : '.3gp';

            // Bind events for the whole app

            // App resume events
            $(document).on('resume', function() {
                console.log("App is being resumed");
                SPOKE.speakers.fetch({error: function() { console.log(arguments); }});
                SPOKE.recordings.refreshLocalStorage();
                SPOKE.recordings.fetch({error: function() { console.log(arguments); }});
                SPOKE.login_tokens.refreshLocalStorage();
                SPOKE.login_tokens.fetch({error: function() { console.log(arguments); }});
            });

            // Fetch initial data
            SPOKE.speakers.fetch({error: function() { console.log(arguments); }});
            SPOKE.recordings.fetch({error: function() { console.log(arguments); }});
            SPOKE.login_tokens.fetch({error: function() { console.log(arguments); }});

            // Start routing
            Backbone.history.start();
        },

        destroy: function() {
            // Undo all the stuff we did in initialise
            // Only useful in unit testing
            console.log('Destroying the SPOKE app');

            delete SPOKE.login_tokens;
            delete SPOKE.router;
            delete SPOKE.recordings;
            delete SPOKE.speakers;
            delete SPOKE.config.audioFilenameExtension;

            // Stop the history
            Backbone.history.stop();
        },

        mobileLoginURL: function() {

        },

        mobileLoginOnSubmit: function() {
            $.mobile.loading('show');
            console.log("Sending token to: " + SPOKE.config.mobileLoginUrl);
            $.ajax({'url': SPOKE.config.mobileLoginUrl,
                    'type': 'POST',
                    'data': {
                        'login-token': $('#login-token').val()
                    },
                    'dataType': 'json',
                    'success': function(data, textStatus, jqXHR) {
                        var cookieHeader = jqXHR.getResponseHeader('Set-Cookie'),
                            sessionID = extractSessionIDFromCookieHeader(cookieHeader),
                            result = data.result;
                        console.log(cookieHeader);
                        $.mobile.loading('hide');
                        if (! sessionID) {
                            alert("Couldn't find the session ID in the response");
                        }
                        var newLoginToken = new SPOKE.LoginToken(
                            {'instance': result.instance,
                             'user': result.user,
                             'cookie': sessionID,
                             'three_word_token': result['mobile-token']});
                        console.log("Login token created: " + JSON.stringify(newLoginToken));
                        SPOKE.login_tokens.add(newLoginToken);
                        SPOKE.currentLoginToken = newLoginToken;
                        SPOKE.instanceUrl = 'http://' +
                            result.instance.label +
                            "." +
                            SPOKE.config.baseHost;

                        // FIXME: not working for the moment:
                        // SPOKE.login_tokens.sync();

                        // Switch to showing the home page:
                        SPOKE.router.home();
                    },
                    'error': function(jqXHR, textStatus, errorThrown) {
                        $.mobile.loading('hide');
                        alert('Logging in failed');
                    }
            });
        }
    });

    $.when(jqmReady, pgReady, firstPageReady).then(function () {
        console.log("All three init events have happened");
        SPOKE.initialise();
    });

})(SPOKE, Backbone, _, $);