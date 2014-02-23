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
                fs.writeFile(cookiePath, token, function()
                {
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
    if (process.getuid() != 0)
        return ready();
    
    byline.createStream(connection).on("data", function(data)
    {
        if (data.toString().match("^auth"))
            ready();
    });
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
