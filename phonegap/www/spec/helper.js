afterEach(function() {
    document.getElementById('stage').innerHTML = '';
});

var helper = {
    trigger: function(obj, name) {
        var e = document.createEvent('Event');
        e.initEvent(name, true, true);
        obj.dispatchEvent(e);
    },
    getComputedStyle: function(querySelector, property) {
        var element = document.querySelector(querySelector);
        return window.getComputedStyle(element).getPropertyValue(property);
    },
    fakeAppStart: function() {
        // Create a fake jquery mobile page
        var pageDiv = window.document.createElement("div");
        pageDiv.id = 'record-page';
        $('body').append(pageDiv);

        // create a fake device object
        window.device = {
            platform: "Android"
        };

        helper.trigger(window.document, 'deviceready');
        helper.trigger(window.document, 'mobileinit');  
        helper.trigger(pageDiv, 'pageinit');
    }

};
