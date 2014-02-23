var LinvoIPC = require("../");
var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;

LinvoIPC.defineService("sample", function(remote, conn, user)
{
    if (user) console.log("Connected via "+user.uid);
    // Service constructor
    var sample = { };

    sample.zing = function (n, cb) { cb(n * 100, new Date()) };
    _.extend(sample, new EventEmitter());
    
    setInterval(function()    
    {
        sample.emit("test", "test str "+Math.random())
    }, 500);
    
    return sample;
});
