
var resourcer = require('resourcer');

resourcer.cache = {
    stores: [],
    push: function (store) {
        return this.stores.push(store);
    },
    clear: function () {
        this.stores.forEach(function (s) { s.clear() });
        return this;
    }
};

this.Cache = function (options) {
    this.size = 0;
    this.store = {};

    resourcer.cache.push(this);
};

this.Cache.prototype = {
    get: function (id) {
        return this.store[id + ""] || false;
    },
    put: function (id, obj) {
        if (! this.has(id)) { this.size ++ }
        this.store[id] = obj;
    },
    clear: function (id) {
        if (id) { delete(this.store[id]) }
        else    { this.store = {} }
    },
    has: function (id) {
        return id in this.store;
    }
};
