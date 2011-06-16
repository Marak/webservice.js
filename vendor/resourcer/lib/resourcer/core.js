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
resourcer.use = function (engine, options) {
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
    this.connect(options || {});
    return this;
};
//
// Connect to the resource's storage engine, or one specified by the URI protocol
//
resourcer.connect = function (/* [uri], [port], [options] */) {
    var args = Array.prototype.slice.call(arguments),
        options = {}, protocol, engine, m;

    args.forEach(function (a) {
        switch (typeof(a)) {
            case 'number': options.port = parseInt(a); break;
            case 'string': options.uri  = a;           break;
            case 'object': options      = a;           break;
        }
    });
    // Extract the optional 'protocol'
    // ex: "database://127.0.0.1" would have "database" as protocol.
    if (m = options.uri && options.uri.match(/^([a-z]+):\/\//)) {
        protocol = m[1];
        options.uri = options.uri.replace(protocol + '://', '');
    }
    engine = protocol ? resourcer.engines[protocol] : this.engine;
    this.connection = new(engine.Connection)(options);

    return this;
};

//
// Default Factory for creating new resources.
//
resourcer.define = function (name, definition) {
    if (typeof(name) === "function" && !definition) {
        definition = name;
        name = definition.name;
    }

    if (name) {
        name = resourcer.capitalize(name);
    } else { // Use the next available resource name
        for (var i = 0; !name || (name in resourcer.resources); i ++) {
            name = 'Resource' + i;
        }
    }

    var F = function Resource(attrs) {
        var that = this;

        resourcer.Resource.call(this);

        Object.defineProperty(this, '_properties', {
            value: {},
            enumerable: false
        });

        Object.keys(F.properties).forEach(function (k) {
            that._properties[k] = F.properties[k].default;
        });

        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                that._properties[k] = attrs[k];
            });
        }

        this._properties.resource = name;

        Object.keys(this._properties).forEach(function (k) {
            resourcer.defineProperty(that, k);
        });
    };

    // Setup inheritance
    F.__proto__           = resourcer.Resource;
    F.prototype.__proto__ = resourcer.Resource.prototype;

    F.resource  = name;
    F.key       = '_id';
    F.views     = {};
    F._children = [];
    F._parents  = [];

    F.schema = {
        name: name,
        properties: {
            _id: { type: 'string', unique: true }
        },
        links: []
    };

    F.hooks = { before: {}, after:  {} };

    ['get', 'save', 'update', 'create', 'destroy'].forEach(function (m) {
        F.hooks.before[m] = [];
        F.hooks.after[m]  = [];
    });

    F.emitter = new(events.EventEmitter);

    Object.keys(events.EventEmitter.prototype).forEach(function (k) {
        F[k] = function () {
            return F['emitter'][k].apply(F['emitter'], arguments);
        };
    });

    F.on('error', function () {
        // Logging
    });

    (definition || function () {}).call(F);

    F.init();

    // Add this resource to the set of resources resourcer knows about
    resourcer.register(name, F);

    return F;
};
resourcer.defineResource = resourcer.define;

resourcer.defineProperty = function (obj, property) {
    Object.defineProperty(obj, property, {
        get: function () {
            return this.readProperty(property);
        },
        set: function (val) {
            return this.writeProperty(property, val);
        },
        enumerable: true
    });
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
            if (! o.__lookupGetter__(k)) {
                target[k] = o[k];
            }
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
resourcer.capitalize = function (str) {
    return str && str[0].toUpperCase() + str.slice(1);
};
