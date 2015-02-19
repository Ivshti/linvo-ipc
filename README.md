# linvo-ipc

Very simple system IPC layer over dnode. Runs on UNIX systems, allows for Node.js programs to communicate between each other seamlessly over UNIX sockets.
See examples/ directory to see how it's used.

Think of it as simpler & more powerful DBus. 

Basic example would be:

**server**
```javascript
var LinvoIPC = require("../");

LinvoIPC.defineService("sample", function(remote, conn, user)
{
    var sample = { };
    sample.zing = function (n, cb) { cb(n * 100, new Date()) };
    return sample;
});
```

**client**
```javascript
var linvoIPC = require("../");

linvoIPC.system.sample(function (sample/*, conn*/)
{
    sample.zing(33, function (n, d) {
        console.log(n, d)
    });
});
```
