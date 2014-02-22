var linvoIPC = require("../");

linvoIPC.user.sample(function (sample/*, conn*/)
{
    sample.zing(33, function (n, d) {
        console.log('n=' + n+" at "+d.getTime());
        //conn.end();
    });
});
