var dnode = require("dnode");
var path = require("path");
var mkdirp = require("mkdirp");
var fs = require("fs");
var _ = require("underscore");

var userSocketPath = path.join(process.env.HOME, ".linvo-ipc");
mkdirp.sync(userSocketPath);

var userServices = {},
    systemServices = {};

fs.readdirSync(userSocketPath)
    .filter(function(n) { return n.match(".lipc$") })
    .forEach(function(socket)
    {
        var serviceName = path.basename(socket,".lipc");
        userServices[serviceName] = _.partial(dnode.connect, path.join(userSocketPath, socket));
    });

function defineService(name, constructor)
{
    var socketPath = path.join(userSocketPath, name+".lipc");
    var server = dnode(constructor);
    
    try { fs.unlinkSync(socketPath) } catch(e){ };
    server.listen(socketPath);
}

module.exports = {
    user: userServices,
    system: systemServices,
    defineService: defineService
};
