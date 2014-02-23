var LinvoIPC = require("../");
var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;

LinvoIPC.defineService("sample", function(remote/*, conn*/)
{
    var sample = { };
    // Service constructor
    sample.zing = function (n, cb) { cb(n * 100, new Date()) };
    _.extend(sample, new EventEmitter());
    
    // This needs to be worked-around; instead of passing a function and extending it's context,
    // we should return a brand-new sevice object and find a way to automatically bind all it's methods to it's context
    sample.on = sample.on.bind(sample);
    setInterval(function()    
    {
        sample.emit("test", "test str")
    }, 500);
    
    return sample;
});
