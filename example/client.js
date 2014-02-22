var linvoIPC = require("./");

linvoIPC.user.sample(function (remote, conn)
{
    var start = Date.now();
    remote.zing(33, function (n, d) {
        console.log('n=' + n+" at "+d.getTime());
        console.log("took "+(Date.now()-start));
        //conn.end();
    });
});
