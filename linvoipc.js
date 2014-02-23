var dnode = require("dnode");
var path = require("path");
var mkdirp = require("mkdirp");
var fs = require("fs");

var systemSocketPath = "/var/run/linvo-ipc";
var userSocketPath = path.join(process.env.HOME, ".linvo-ipc");
mkdirp.sync(userSocketPath);

var userServices = {},
    systemServices = {};

function fillServices(socketPath, services)
{
    fs.readdirSync(socketPath)
    .filter(function(n) { return n.match(".lipc$") })
    .forEach(function(socket)
    {
        var serviceName = path.basename(socket,".lipc");
        services[serviceName] = function(cb) {
            dnode.connect(path.join(socketPath, socket), function(remote, conn) { cb(remote.service) });
        }
    });
}
fillServices(userSocketPath, userServices);
fillServices(systemSocketPath, systemServices);

function defineService(name, constructor, options)
{
    var server = dnode(function(remote, conn)
    {
        this.service = constructor(remote, conn);
    }, options);
    
    var socketPath = path.join(process.getuid() == 0 ? systemSocketPath : userSocketPath, name+".lipc");
    
    try { fs.unlinkSync(socketPath) } catch(e){ };
    server.listen(socketPath);
    if (process.getuid() == 0) fs.chmodSync(socketPath, "0766");
}

module.exports = {
    user: userServices,
    system: systemServices,
    defineService: defineService
};
