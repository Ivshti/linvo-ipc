var LinvoIPC = require("../");
var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;

LinvoIPC.defineService("sample", function(remote/*, conn*/)
{
    var sample = { };
    // Service constructor
    sample.zing = function (n, cb) { cb(n * 100, new Date()) };
    _.extend(sample, new EventEmitter());
    
    setInterval(function()    
    {
        sample.emit("test", "test str")
    }, 500);
    
    return sample;
});
