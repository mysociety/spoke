---
layout: default
title: Developing The App
---

Developing the SayIt App
========================

The SayIt app is built on Phonegap/Cordova 2.2.0, using Backbone.js 0.9.9 and
jQuery Mobile 1.2.0.

General Structure
-----------------

The app is built around a single global object: `SPOKE` which has some modules
added to it via a liberal use of Underscore's `extend`. Each module is usually
inside its own file and declared inside an IEF. At the moment each module does
the extending of SPOKE itself, which is probably not ideal, and it should
instead just export an object which we can choose to assign, like we do for the
instances of Backbone routers and collections we use.

The global variable gets declared in `index.html` and then mainly fleshed out
from a Backbone point-of-view in `phonegap/www/js/app.js`, which is also the
main entry/starting point for the code.

Backbone and jQuery Mobile
--------------------------

### Routing

Because both Backbone and jQM like to do ajaxy single-page app things, they
both try to listen to url/hash changes in the browser and act on them.

Unforunately, this means that left to their own devices they clash and break
our app. To fix this, we have to add some configuration for jQM to tell it to
stop trying to be a router and let Backbone do it.

This is found in `phonegap/www/js/jqm-config.js` along with some other
configuration stuff.

### Markup

As well as the routing, there is the slight problem that jQuery Mobile does all
sorts of clever things to the page markup, adding bits and bobs (lots of
classes and some html) to your document in order to produce its styling from
the `data-` attributes you add to your markup.

This is a problem because it expects to be in charge of the whole page-loading
process and hence know when to do this. It also (rather sillily) expects to
only have to do this once for each page, ie: it doesn't expect you to add or
change the markup and want the magic done again.

The way Backbone works, by constantly adding/removing/changing the dom instead
of loading real new pages, means that you need to do this quite a lot, and so I
add some extra calls to jQM to force it to do its stuff over again. This is
usually in the render methods for any view and looks something like:

    this.$el.trigger("pagecreate");

For whole-page views. For sub-elements there are a variety of things you can
`trigger` with a varying degree of success usually. jQM is working on improving
that, but it's currently been pushed to version 1.4 at least I think, so if in
doubt, trigger pagecreate again, it doesn't seem to do any harm.

Templates
---------

For now, all the templates are inside the `index.html` in `<script
type="text/template">` tags and use the standard [Underscore templating
language](http://underscorejs.org/#template) because I haven't found anything I
can't do with it yet. If we end up with loads more we can move them into their
own file(s), but then we'll have to do something like use require.js (not
neccessarily a bad thing) to load them in, and testing things locally will need
a web server running. All overhead which I tried to avoid for the time being.

Views
-----

The views are pretty standard Backbone views, though they have a bit of a whiff
of Controllers about them in that they manage a lot of the actual logic of
starting/stopping recordings, uploading etc. This is mainly because most of
things happen on some kind of direct event from a view element (eg: a button
click, etc) and Backbone has a nice thing that binds these events and handles
unbinding them too.

Where I've strayed from the built-in code a little is in the way I do
sub-views, which is copied from [this
chap](http://ianstormtaylor.com/rendering-views-in-backbonejs-isnt-always-simple/).

Put simply, I have a view for whole pages and then views for components inside
them. The whole-page view manages the main jQuery Mobile *page*, which contains
placeholders for the bits the sub-views add. The main page view then hands each
sub-view a DOM element to play with in the way mr Storm Taylor describes in the
link above.

I've also added a (perhaps poorly named) `destroy` method to each whole-page
view, which handles removing all the subviews as well as itself.

Models & Storage
----------------

There are two types of models in the app, kind of matching the data in the
website.

### Speakers

Firstly we have speakers, which use the standard Backbone method of supplying a
url (in this case a PopIt url) and syncing from that. We don't let people add
speakers, so this is just a GET operation. The only tricksy part is that we
override the parse method on the collection to automatically add an "Unknown"
speaker at the top of the list.

### Recordings

The second kind of model is Recordings, which is more complicated because it is
stored in several places.

The real Backbone model data is stored in local storage via the
[Backbone.localStorage
module](https://github.com/jeromegn/Backbone.localStorage), part of this data
is a path to a recording file which is saved on the phone's SD card (or
internal storage) via Phonegap's File apis.

This real file stuff happens in our custom module: `phonegap/www/js/files.js`.

Recordings are then uploaded manually (ie: rather than through the Backbone
magic) by some more of the Phonegap apis, because we need to send the audio
file as well as the model data.

