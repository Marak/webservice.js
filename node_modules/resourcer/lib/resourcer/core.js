require.paths.unshift(require('path').join(__dirname, '..'));

var sys = require('sys'),
    events = require('events');

var resourcer = exports;

function pp(obj) {
  sys.puts(sys.inspect(obj));
}

resourcer.env = 'development';
resourcer.resources  = {};
resourcer.Resource   = require('resourcer/resource').Resource;
resourcer.engines    = require('resourcer/engines');
resourcer.connection = new(resourcer.engines.memory.Connection);

//
// Select a storage engine
//
resourcer.use = function (engine) {
    if (typeof(engine) === "string") {
        if (engine in resourcer.engines) {
            this.engine = resourcer.engines[engine];
        } else {
            throw new(Error)("unrecognised engine");
        }
    } else if (engine && engine.Connection) {
        this.engine = engine;
    } else {
        throw new(Error)("invalid engine");
    }
    this.connect(null, {});
    return this;
};

//
// Connect to the default storage engine
//
resourcer.connect = function (uri, port, options) {
    var m, protocol = uri && (m = uri.match(/^([a-z]+):\/\/(.+)$/)) && m[1],
        uri    = protocol ? m[2] : uri,
        engine = protocol ? resourcer.engines[protocol] : this.engine;

    this.connection = (function () {
        switch (engine.Connection.length) {
            case 0:
            case 3: return new(engine.Connection)(uri, port, options);
            case 2: return new(engine.Connection)(uri, options);
            case 1: return new(engine.Connection)(options);
        }
    })();

    return this;
};

//
// Default Factory for creating new resources.
//
resourcer.defineResource = function (name, definition) {
    if (typeof(name) === "function" && !definition) {
        definition = name;
        name = definition.name;
    }

    name = capitalize(name || 'resource');

    var F = function Resource(attrs) {
        var that = this;

        this._properties = attrs || {};
        this._properties.resource = name;

        Object.keys(this._properties).forEach(function (k) {
            Object.defineProperty(that, k, {
                get: function () {
                    return this.readProperty(k);
                },
                set: function (val) {
                    return this.writeProperty(k, val);
                }
            });
        });
    };

    // Setup inheritance
    F.__proto__           = resourcer.Resource;
    F.prototype.__proto__ = resourcer.Resource.prototype;

    F.resource = name;
    F.key      = '_id';
    F.emitter  = new(events.EventEmitter);
    F.emitter.addListener('error', function (e) {
        // Logging
    });

    F.schema = {
        name: name,
        properties: {
            _id: { type: 'string', unique: true }
        },
        links: []
    };

    F.delegate('addListener',       'emitter');
    F.delegate('removeListener',    'emitter');
    F.delegate('removeAllListener', 'emitter');
    F.delegate('listeners',         'emitter');
    F.delegate('emit',              'emitter');

    (definition || function () {}).call(F);

    // Delay raising the 'init' event for one tick
    // so that the calling method can get the resource
    // returned before the event is raised.
    process.nextTick(function () {
      F.init();
    });
    
    // Add this resource to the set of resources resourcer knows about
    resourcer.register(name, F);

    return F;
};

//
// Adds the Factory to the set of known resources
//
resourcer.register = function (name, Factory) {
    return this.resources[name] = Factory;
};

//
// Removes the name from the set of known resources;
//
resourcer.unregister = function (name) {
    delete this.resources[name];
};

resourcer.mixin = function (target) {
    var objs = Array.prototype.slice.call(arguments, 1);
    objs.forEach(function (o) {
        Object.keys(o).forEach(function (k) {
            target[k] = o[k];
        });
    });
    return target;
};

resourcer.clone = function (object) {
    return Object.keys(object).reduce(function (obj, k) {
        obj[k] = object[k];
        return obj;
    }, {});
};

resourcer.typeOf = function (value) {
    var s = typeof(value);

    if (Array.isArray(value)) {
        return 'array';
    } else if (s === 'object') {
        if (s) { return 'object' }
        else   { return 'null' }
    } else if (s === 'function') {
        if (s instanceof RegExp) { return 'regexp' }
        else                     { return 'function' }
    } else {
        return s;
    }
};

//
// Utilities
//
function capitalize(str) {
    return str && str[0].toUpperCase() + str.slice(1);
}
