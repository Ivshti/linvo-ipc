var LinvoIPC = require("../");
var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;

LinvoIPC.defineService("sample", function(remote/*, conn*/)
{
    // Service constructor
    this.zing = function (n, cb) { cb(n * 100, new Date()) };
    _.extend(this, new EventEmitter());
    
    // This needs to be worked-around; instead of passing a function and extending it's context,
    // we should return a brand-new sevice object and find a way to automatically bind all it's methods to it's context
    this.on = this.on.bind(this);
    
    var self = this;
    setInterval(function()
    {
        self.emit("test", "test str")
    }, 500);
});
