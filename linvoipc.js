var dnode = require("dnode");
var path = require("path");
var mkdirp = require("mkdirp");
var fs = require("fs");
var _ = require("underscore");

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
        services[serviceName] = _.partial(dnode.connect, path.join(socketPath, socket));
    });
}
fillServices(userSocketPath, userServices);

function defineService(name, constructor, options)
{
    var server = dnode(constructor, options);
    var socketPath = path.join(userSocketPath, name+".lipc");
    
    try { fs.unlinkSync(socketPath) } catch(e){ };
    server.listen(socketPath);
}

module.exports = {
    user: userServices,
    system: systemServices,
    defineService: defineService
};
