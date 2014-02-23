var dnode = require("dnode");
var path = require("path");
var mkdirp = require("mkdirp");
var fs = require("fs");
var net = require("net");
var byline = require("byline");
var hat = require("hat");

var systemSocketPath = "/var/run/linvo-ipc";
var userSocketPath = path.join(process.env.HOME, ".linvo-ipc");
mkdirp.sync(userSocketPath);

/*
 * Client
 */
var userServices = {},
    systemServices = {};

function fillServices(socketPath, services, isSystem)
{
    fs.readdirSync(socketPath)
    .filter(function(n) { return n.match(".lipc$") })
    .forEach(function(socket)
    {
        var serviceName = path.basename(socket,".lipc");
        services[serviceName] = function(cb) {
            var d = dnode(),
                c = net.connect(path.join(socketPath, socket));
            d.on("remote", function(remote) { cb(remote.service) });
            
            if (! isSystem) c.pipe(d).pipe(c);
            else /* System service: we need authentication */
            {
                var token = hat(256,16),
                    cookiePath = path.join(userSocketPath, serviceName+".auth");
                fs.writeFile(cookiePath, token, function(err)
                {
                    if (err) console.error(err);
                    c.write("auth:"+cookiePath+":"+token+"\n");
                    c.pipe(d).pipe(c);
                });
            }
        }
    });
}
fillServices(userSocketPath, userServices);
fillServices(systemSocketPath, systemServices, true);


/*
 * Server
 */
function authenticate(connection, ready)
{
    if (process.getuid() != 0) /* No authentication for user services */
        return ready();
    
    var stream = byline.createStream(connection);
    var onLine = function(data)
    {
        var line = data.toString();
        if (! line.match("^auth")) return;
        
        var cookiePath = line.split(":")[1];
        var cookieToken = line.split(":")[2];

        fs.readFile(cookiePath, function(err, buf)
        {
            if (err) console.error(err);
            if (err || buf.toString() != cookieToken)
            {
                console.log("Authentication error: cookie/token mismatch");
                return connection.end();
            }

            fs.stat(cookiePath, function(err, stat)
            {
                /* only this for now; TODO: more */
                ready({ uid: stat.uid });
                stream.removeListener("data", onLine);
            });
        });
    };
    stream.on("data", onLine);
};

function defineService(name, constructor, options)
{
    var socketPath = path.join(process.getuid() == 0 ? systemSocketPath : userSocketPath, name+".lipc");
    
    try { fs.unlinkSync(socketPath) } catch(e){ };
    net.createServer(function(c)
    {
        authenticate(c, function(user)
        {
            var d = dnode(function(remote, conn)
            {
                this.service = constructor(remote, conn, user);
            }, options);
            c.pipe(d).pipe(c);
        });
    }).listen(socketPath);
    if (process.getuid() == 0) fs.chmodSync(socketPath, "0766");
}

module.exports = {
    user: userServices,
    system: systemServices,
    defineService: defineService
};
