var LinvoIPC = require("./");

LinvoIPC.defineService("sample", function(remote, conn)
{
    // Service constructor
    this.zing = function (n, cb) { cb(n * 100, new Date()) };
});
