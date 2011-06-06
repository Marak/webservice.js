var sys = require('sys')
var path = require('path');

var resourcer = require('resourcer'),
    cradle = require('cradle');

resourcer.Cache = require('resourcer/cache').Cache;

this.Connection = function (host, port, config) {
    this.connection = new(cradle.Connection)({
        host: host || '127.0.0.1',
        port: port || 5984,
        raw: true,
        cache: false,
        auth: config && config.auth || null
    }).database(resourcer.env); 
    this.cache = new(resourcer.Cache);
};

this.Connection.prototype = {
    protocol: 'database',
    load: function(data) {
				throw new(Error)("Load not valid for database engine.");
    },
    request: function (method) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.connection[method].apply(this.connection, args);
    },
    get: function () {
        var args = Array.prototype.slice.call(arguments);
        return this.request.apply(this, ['get'].concat(args));
    },
    put: function (id, doc, callback) {
        var args = Array.prototype.slice.call(arguments);
        return this.request('put', id, doc, function (e, res) {
            if (e) {
                callback(e);
            } else {
                res.status = 201;
                callback(null, res);
            }
        });
    },
    save: function () {
        return this.put.apply(this, arguments);
    },
    destroy: function () {
        var args = Array.prototype.slice.call(arguments);
        return this.request.apply(this, ['remove'].concat(args));
    },
    view: function (path, opts, callback) {
        return this.request.call(this, 'view', path, opts, function (e, res) {
            if (e) { callback(e) }
            else {
                callback(null, res.rows.map(function (r) { 
                  return r.doc ? r.doc : r.value 
                }));
            }
        });
    }
};
