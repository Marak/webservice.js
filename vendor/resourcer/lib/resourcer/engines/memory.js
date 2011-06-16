var resourcer = require('resourcer');
resourcer.Cache = require('resourcer/cache').Cache;
//
// In-memory JSON store
//
this.stores = {};
this.caches = {};
this.Connection = function (options) {
    options = options || {};
    this.uri = options.uri;

    if (typeof(this.uri) === "string") {
        // Application-wide store
        this.store = exports.stores[this.uri] = {};
        this.cache = exports.caches[this.uri] = new(resourcer.Cache);
    } else {
        // Connection-wise store
        this.store = {};
        this.cache = new(resourcer.Cache);
    }
};
this.Connection.prototype = {
    protocol: 'memory',
    load: function (data) {
        this.store = data;
        return this;
    },
    request: function (f) {
        var that = this;

        process.nextTick(function () {
            f.call(that);
        });
    },
    save: function (key, val, callback) {
        if (! key) { throw new(Error)("key is undefined") }
        this.request(function () {
            var update = key in this.store;
            this.store[key] = val;
            callback(null, { status: update ? 200 : 201 });
        });
    },
    put: function () {
        this.save.apply(this, arguments);
    },
    update: function (key, obj, callback) {
        this.put(key, resourcer.mixin({}, this.store[key], obj), callback);
    },
    get: function (key, callback) {
        this.request(function () {
            key = key.toString();
            if (key in this.store) {
                callback(null, this.store[key]);
            } else {
                callback({ status: 404 });
            }
        });
    },
    all: function (callback) {
        this.find({}, callback);
    },
    find: function (conditions, callback) {
        var store = this.store;
        this.filter(function (obj) {
            return Object.keys(conditions).every(function (k) {
                return conditions[k] ===  obj[k];
            });
        }, callback);
    },
    filter: function (filter, callback) {
        this.request(function () {
            var result = [], store = this.store;
            Object.keys(this.store).forEach(function (k) {
                if (filter(store[k])) {
                    result.push(store[k]);
                }
            });
            callback(null, result);
        });
    }
};
