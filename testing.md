---
layout: default
title: Testing
---

Testing Phonegap
================
Tests for the app can be found in `phonegap/www/spec.html` which you can just open in your browser locally to run.

They run using Jasmine, and can be found in `phonegap/spec`.

Currently they seem to be fine in Chrome or Firefox, but since the code they're testing is not
supposed to be run a desktop browser, this isn't particularly important, though I've found Firefox (well, Firebug)
gives better error messages when dealing with the anonymous functions that define specs, which can help pinpoint
whether it's an error in your code or the test.

Things the tests use
--------------------
- Jasmine - including heavy use of the jasmine spies/mocks to swap out global things and replace them with something predictable
- jasmine-jquery - for nicer matchers like `thing.isVisible()`


Test Helpers
------------
Phonegap's default project comes with a helper file that does some stuff you might want to do in a Jasmine test. While it's not very helpful when you have things like [jasmine-jquery](https://github.com/velesin/jasmine-jquery) (or even just jQuery) around, it gave me the idea to add something that were.

Probably, now that this is setup, it won't need messing with, but it's worth explaining what it does anyway.

Firstly, there are a couple of methods to fake the things that app looks for when deciding whether or not start. Because it relies on phonegap, it won't start until there's a `deviceready` event, which will never happen on a desktop, so we fake one. The app also expects certain global methods/objects to exist like `window.Device`, so there are helpers to create them if needed.

The second main thing that the helpers do is provide *factory* methods (for want of a better description) to create mock objects for Phonegap APIs like the File API. Because these are all quite long-winded, multiple-async-callback affairs, and to test stuff properly you need to specify the behaviour at each step, there are quite a lot of these. They don't mock everything that phonegap can do, or give options for all of the possible eventualities, but they do enough for our needs at the moment.