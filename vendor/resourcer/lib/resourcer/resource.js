require.paths.unshift(require('path').join(__dirname, '..'));

var events = require('events'),
    util = require('util');

var definers  = require('resourcer/schema').definers;
var resourcer = require('resourcer');
var validator = require('resourcer/validator');

var render = require('resourcer/resource/view').render;
var pluralize = function (s) { return s + 's' };

//
// CRUD
//
this.Resource = function () {
    Object.defineProperty(this, 'isNewRecord', {
        value: true, writable: true
    });
};
this.Resource.filter = require('resourcer/resource/view').filter;

//
// Hooks
//
this.Resource.after = function (event, callback) {
    this.hook(event, 'after', callback);
};
this.Resource.before = function (event, callback) {
    this.hook(event, 'before', callback);
};
this.Resource.hook = function (event, timing, callback) {
    this.hooks[timing][event] = this.hooks[timing][event] || [];
    this.hooks[timing][event].push(callback);
};
this.Resource.runBeforeHooks = function (method, obj, callback, finish) {
    if (method in this.hooks.before) {
        (function loop(hooks) {
            var hook = hooks.shift();

            if (hook) {
                hook(obj, function (e, obj) {
                    if (e || obj) { callback(e, obj) }
                    else          { loop(hooks) }
                });
            } else {
                finish();
            }
        })(this.hooks.before[method].slice(0));
    } else { finish() }
};
this.Resource.runAfterHooks = function (method, e, obj, finish) {
    if (method in this.hooks.before) {
        (function loop(hooks) {
            var hook = hooks.shift();

            if (hook) {
                hook(e, obj, function (e, obj) {
                    if (e) { finish(e, obj) }
                    else   { loop(hooks) }
                });
            } else {
                finish();
            }
        })(this.hooks.after[method].slice(0));
    } else { finish() }
};

//
// Raises the init event. Called from resourcer.defineResource
//
this.Resource.init = function () {
    this.emit('init', this);
};

// 
// Registers the current instance's resource with resourcer
//
this.Resource.register = function () {
    return resourcer.register(this.resource, this);
};

//
// Unregisters the current instance's resource from resourcer
//
this.Resource.unregister = function () {
    return resourcer.unregister(this.resource);
};

this.Resource._request = function (/* method, [key, obj], callback */) {
    var args     = Array.prototype.slice.call(arguments),
        that     = this,
        callback = args.pop(),
        method   = args.shift(),
        key      = args.shift(),
        obj      = args.shift();

    key && args.push(key);
    obj && args.push(obj.properties ? obj.properties : obj);

    this.runBeforeHooks(method, obj, callback, function () {
        args.push(function (e, result) {
            var Factory;

            if (e) {
                if (e.status >= 500) {
                    throw new(Error)(e);
                } else {
                    that.runAfterHooks(method, e, obj, function () {
                        that.emit("error", e, obj);
                        callback(e);
                    });
                }
            } else {
                if (Array.isArray(result)) {
                    result = result.map(function (r) {
                        return resourcer.instantiate.call(that, r);
                    });
                } else {
                    if (method === 'destroy') {
                        that.connection.cache.clear(key);
                    } else {
                        if (result.rev) {
                            // Set the revision if available, so it can be saved
                            // to the cache. If we're saving a new object,
                            // '_rev' won't be a member of 'resource._properties'
                            // so we need to set it here so resource.toJSON() includes it.
                            if (obj instanceof resourcer.Resource && !obj._rev) {
                                resourcer.defineProperty(obj, '_rev');
                            }
                            obj._rev = result.rev;
                        }
                        result = resourcer.instantiate.call(that, method === 'get' ? result : obj);

                        if (method === 'update') {
                            // TODO: Not necessary for identity map
                            that.connection.cache.update(key, obj);
                        } else {
                            // TODO: We only need to do this if the key doesn't exist
                            that.connection.cache.put(key, result);
                        }
                    }
                }
                that.runAfterHooks(method, null, obj, function (e, res) {
                    if (e) { that.emit('error', e) }
                    else   { that.emit(method, res || result) }
                    callback(e || null, result);
                });
            }
        });
        that.connection[method].apply(that.connection, args);
    });
};

this.Resource.get = function (id, callback) {
    if (!id) return callback(new Error('key is undefined'));
    return this._request("get", id, callback);
};

this.Resource.create = function (attrs, callback) {
    if (this._timestamps) { attrs.ctime = attrs.mtime = Date.now() }

    // Before we create a new resource, perform a validation based on its schema
    var validate = validator.validate(attrs, {
      properties: this.schema.properties || {}
    });
    
    if (!validate.valid) {
      callback(validate.errors);
    }
    else {
      var instance = new(this)(attrs);
      instance.save(function (e, res) {
          if (res) {
              instance._id  = instance._id || res.id;
              res.rev && (instance._rev = res.rev);
          }
          callback(e, instance);
      });
    }
};

this.Resource.save = function (obj, callback) {
    // Before we save a resource,  perform a validation based on its schema
    var validate = validator.validate(obj, {
      properties: this.schema.properties || {}
    });

    if (!validate.valid) {
      return callback(validate.errors);
    }
    
    if (this._timestamps) {
        obj.mtime = Date.now();
        if (obj.isNewRecord) { obj.ctime = obj.mtime }
    }

    return this._request("save", obj.key, obj, callback);
};

this.Resource.destroy = function (key, callback) {
    return this._request("destroy", key, callback);
};

this.Resource.update = function (key, obj, callback) {
    if (this._timestamps) { obj.mtime = Date.now() }
    return this._request("update", key, obj, callback);
};

this.Resource.all = function (callback) {
    return this._request("all", callback);
};

this.Resource.view = function (path, params, callback) {
    return this._request("view", path, params, callback);
};

this.Resource.find = function (conditions, callback) {
    if (typeof(conditions) !== "object") {
        throw new(TypeError)("`find` takes an object as first argument.");
    }
    return this._request("find", conditions, callback);
};

this.Resource.use     = function () { return resourcer.use.apply(this, arguments) };
this.Resource.connect = function () { return resourcer.connect.apply(this, arguments) };

// Define getter / setter for connection property
this.Resource.__defineGetter__('connection', function () {
    return this._connection || resourcer.connection;
});
this.Resource.__defineSetter__('connection', function (val) {
    return this._connection = val;
});

// Define getter / setter for engine property
this.Resource.__defineGetter__('engine', function () {
    return this._engine || resourcer.engine;
});
this.Resource.__defineSetter__('engine', function (val) {
    return this._engine = val;
});

// Define getter / setter for resource property
this.Resource.__defineGetter__('resource', function () {
    return this._resource;
});
this.Resource.__defineSetter__('resource', function (name) {
    return this._resource = name;
});

// Define getter for properties, wraps this resources schema properties
this.Resource.__defineGetter__('properties', function () {
    return this.schema.properties;
});

// Define getter / setter for key property. The key property is required by CouchDB
this.Resource.__defineSetter__('key', function (val) { return this._key = val });
this.Resource.__defineGetter__('key', function ()    { return this._key });

this.Resource.__defineGetter__('children', function (name) {
    return this._children.map(function (c) { return resourcer.resources[c] });
});
this.Resource.__defineGetter__('parents', function (name) {
    return this._parents.map(function (c) { return resourcer.resources[c] });
});

//
// many-to-many
//
// user.groups = [1,2,3,4,5]
//
// new(User).groups() // -> bulk GET on user.groups property
//                    // OR linked documents view
//                    // OR cache
//                    // - Define Users.byGroup(group_id)
//
// new(Group).users() // -> Users.byGroup(this._id) // view
//
// group = {};
//
// User.child('group')
// Group.child('user');
//

//
// Entity relationships
//
this.Resource.child = function (resource, options) {
    this._relationship('child', resource, options);
};
this.Resource.parent = function (resource, options) {
    this._relationship('parent', resource, options);
};
this.Resource._relationship = function (type, r, options) {
    var that = this,
        rfactory,     // Resource factory/constructor
        rstring,      // Resource string
        rstringp,     // Resource pluralized string
        rstringc;     // Resource capitalized string

    if (typeof(r) === 'string') {
        rstring  = r; 
        rfactory = resourcer.resources[capitalize(r)];
    } else if (typeof(r) === 'function') {
        rstringc = r.resource;
        rfactory = r;
    } else {
        throw new(TypeError)("argument must be a string or constructor");
    }
    rstringp = pluralize(rstring);
    rstringc = capitalize(rstring);

    if (this._children.indexOf(rstringc) !== -1) { return }
    if (rfactory === undefined) throw new(Error)("unknown resource " + rstring);

    if (type == 'child') {
        this._children.push(rstringc);
        this.property(rstring + '_ids', Array, { default: [] });
        //
        // Parent.children(id, callback)
        //
        this[rstringp] = function (id, callback) {
            return rfactory['by' + rstringc](id, callback);
        };
        //
        // parent.children(callback)
        //
        this.prototype[rstringp] = function (callback) {
            return this.constructor[rstringp](this._id, callback);
        };
    } else {
        this._parents.push(rstringc);
        //
        // Child.byParent(id, callback)
        //
        this.filter('by' + rstringc, { include_docs: true }, {
             map: render(function () {
                 if (doc.resource === $resource) {
                     for (var i = 0; i < doc.$children.length; i++) {
                         emit(doc.$children[i], null);
                     }
                 }
             }, { resource: that.resource, children: that.resource + '_ids' })
        });
        //
        // child.parent(callback)
        //
        this.prototype[rstring] = function (callback) {
            return rfactory.get(this[rstring_id], callback);
        };
        this.property(rstring + '_id', String, { default: null });
    }
};

this.Resource.property = function (name, typeOrSchema, schema) {
    var definer = {};
    var type = (function () {
        switch (typeof(typeOrSchema)) {
            case "string":    return typeOrSchema;
            case "function":  return typeOrSchema.name.toLowerCase();
            case "object":    schema = typeOrSchema;
            case "undefined": return "string";
            default:          throw new(Error)("Argument Error"); 
        }
    })();

    schema = schema || {};
    schema.type = schema.type || type;

    this.schema.properties[name] = definer.property = schema;
    
    resourcer.mixin(definer, definers.all, definers[schema.type] || {});

    return definer;
};
this.Resource.timestamps = function () {
    this._timestamps = true;
    this.property('ctime');
    this.property('mtime');
};

this.Resource.define = function (schema) {
    return resourcer.mixin(this.schema, schema);
};

//
// Synchronize a Resource's design document with the database.
//
this.Resource.sync = function (callback) {
    var that = this,
        id   = ["_design", this.resource].join('/');

    this.once('sync', function (d) { callback(null, d) });

    if (this._synching) { return }
    else                { this._synching = true }

    var synched = function (e, design) {
        that._synching = false;
        that.emit('sync', design);
    };

    if (this.connection.protocol === 'database') {
        this._design = this._design || {};

        if (this._design._rev) { return synched(null) }

        this.connection.head(id, function (e, headers, status) {
            if (headers.etag) {
                that._design._rev = headers.etag.slice(1, -1);
            }
            that.connection.put(id, that._design, function (e, res) {
                if (e) { 
                    if (e.reason === 'no_db_file') {
                        that.connection.connection.create(function () {
                            that.sync(callback);
                        });
                    }
                    
                    /* TODO: Catch errors here. Needs a rewrite, because of the race */
                    /* condition, when the design doc is trying to be written in parallel */
                } 
                else {
                    // We might not need to wait for the document to be
                    // persisted, before returning it. If for whatever reason
                    // the insert fails, it'll just re-attempt it. For now though,
                    // to be on the safe side, we wait.
                    that._design._rev = res.rev;
                    synched(null, that._design);
                }
            });
        });
    } else { process.nextTick(function () { synched(null) }) }
};

//
// Prototype
//
this.Resource.prototype = {
    save: function (callback) {
        var that = this;
        if (this.isValid) {
            this.constructor.save(this, function (e, res) {
                if (!e) { that.isNewRecord = false }
                callback(e, res);
            });
        } else {
        }
    },
    update: function (obj, callback) {
        return this.constructor.update(this._id, obj, callback);
    },
    saveAttachment: function (name, data, callback) {
        return this.constructor.saveAttachment(this._id, this._rev, name, data, callback);
    },
    destroy: function () {},
    reload: function () {},
    readProperty: function (k) {
        return this._properties[k];
    },
    writeProperty: function (k, val) {
        return this._properties[k] = val;
    },

    get key () {
        return this[this.constructor.key];
    },
    get id () {
        if (this.constructor.key === '_id') { return this._id }
        else                                { return undefined }
    },
    get isValid () {
        return true;
    },
    
    get properties () {
        return this._properties;
    },
    set properties (props) {
        var that = this;
        Object.keys(props).forEach(function (k) {
            that[k] = props[k];
        });
        return props;
    },

    toJSON: function () {
        return resourcer.clone(this.properties);
    },
    inspect: function () {
        return util.inspect(this.properties);
    },
    toString: function () {
        return JSON.stringify(this.properties);
    }
};

resourcer.clone = function (obj) {
    var clone = {};
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i ++) {
        clone[keys[i]] = obj[keys[i]];
    }
    return clone;
};

resourcer.instantiate = function (obj) {
    var instance, Factory, id;

    obj.resource = obj.resource || this.resource;
    Factory = resourcer.resources[obj.resource];

    id = obj[this.key];

    if (id && this.connection.cache.has(id)) {
        obj = this.connection.cache.get(id);
    }

    if (Factory) {
        // Don't instantiate an already instantiated object
        if (obj instanceof Factory) { return obj }
        else                        { return new(Factory)(obj) }
    } else {
        throw new(Error)("unrecognised resource '" + obj.resource + "'");
    }
};

//
// Utilities
//
function capitalize(str) {
    return str && str[0].toUpperCase() + str.slice(1);
}
