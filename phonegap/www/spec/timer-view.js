describe('SPOKE.TimerView', function () {
    var timerView;

    beforeEach(function() {
        $("#stage").append('<div id="page"></div>');
        timerView = new SPOKE.TimerView({
            el: $("#page")
        });
    });

    afterEach(function () {
        timerView.remove();
    });

    it("Should start an interval when SPOKE.startRecording happens", function () {
        spyOn(window, "setInterval").andCallThrough();
        SPOKE.trigger("startRecording", {});
        expect(window.setInterval).toHaveBeenCalled();
    });

    it("Should clear an interval when SPOKE.stopRecording happens", function () {
        spyOn(window, "clearInterval").andCallThrough();
        SPOKE.trigger("startRecording", {});
        SPOKE.trigger("stopRecording", {});
        expect(window.clearInterval).toHaveBeenCalled();
    });
});