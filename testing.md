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