var events = require('events');
var Resource = require('resourcer/resource').Resource;

var render = function (template, attributes) {
    return ['map', 'reduce', 'rereduce'].reduce(function (view, f) {
        if (template[f]) {
            view[f] = Object.keys(attributes).reduce(function (str, k) {
                var attribute = attributes[k];
                if (typeof(attribute) !== 'string') {
                    attribute = JSON.stringify(attribute);
                }
                return str.replace('$' + k, attribute)
                          .replace(/"/g, "'");
            }, template[f].toString().replace(/\n/g, '').replace(/\s+/g, ' '));
            return view;
        } else {
            return view;
        }
    }, {});
};

//
// Define a Resource filter
//
this.filter = function (name /* [options], filter */) {
    var args = Array.prototype.slice.call(arguments),
        filter = args.pop(),
        options = (typeof(args[args.length - 1]) === 'object') && args.pop();
    
    this.addListener('init', function (R) {
        var view;

        if (R.connection.protocol === 'database') {
            if (typeof(filter) === 'object' && filter.map) {

              Object.keys(filter).forEach(function (key) {
                filter[key] = filter[key].toString().replace(/\n|\r/g, '')
                                                    .replace(/\s+/g, ' ');
              });
              R.views[name] = filter;
            }
            else if (typeof(filter) === 'object') { 
                R.views[name] = render({
                    map: function (doc) {
                        var object = $object;
                        if (doc.resource === $resource) {
                            if (Object.keys(object).every(function (k) {
                                return object[k] === doc[k]; 
                            })) {
                                emit(doc._id, doc);
                            }
                        }
                    }
                }, { object: filter, resource: JSON.stringify(R.resource) });
            } else if (typeof(filter) === 'function') {
                R.views[name] = render({
                    map: function (doc) {
                        if (doc.resource === $resource) {
                            emit($key, doc);
                        }
                    }
                }, { key: "doc." + Object.keys(filter("$key"))[0],
                     resource: JSON.stringify(R.resource) });
            } else { throw new(TypeError)("last argument must be an object or function") }

            // Here we create the named filter method on the Resource
            //
            // Sample Usage:
            //   resource.someFilter('targetKey');
            //   resoure.someFilter({ startKey: 0, endKey: 1 });
            //
            R[name] = function () {
                var that = this,
                    args = Array.prototype.slice.call(arguments),
                    params = {},
                    callback = (typeof(args[args.length - 1]) === 'function') && args.pop(),
                    promise = new(events.EventEmitter);
                
                if (typeof args[0] === 'object') params = args[0];
                else if (typeof args[0] !== 'undefined' && args[0] !== null) params = { key: args[0] };

                if (options) {
                  Object.keys(options).forEach(function (key) {
                    params[key] = options[key];
                  });
                }
                
                // Make sure our _design document is up to date
                this.reload(function () {
                    that.view([that.resource, name].join('/'), params, callback);
                });
            };
        }
    });
};

//
// Get the Resource's _design document.
//
Resource.__defineGetter__('_design', function () {
    var that = this,
        design = ["_design", this.resource].join('/'),
        promise;
        
    if (this.__design) {
        return this.__design;
    } else {
        promise = new(events.EventEmitter);
        // Get the _design doc from the database.
        this.connection.get(design, function (e, doc) {
            // If there was an error, such as a 404,
            // we need to initialize the document, and save
            // it to the database.
            if (e) {
                that.__design = {
                    _id: design,
                    views: that.views || {}
                };
                that.connection.put(that.__design._id, that.__design, function (e, res) {
                    if (e) {/* TODO: Catch errors here. Needs a rewrite, because of the race */}
                            /* condition, when the design doc is trying to be written in parallel */
                    // We might not need to wait for the document to be
                    // persisted, before returning it. If for whatever reason
                    // the insert fails, it'll just re-attempt it. For now though,
                    // to be on the safe side, we wait.
                    promise.emit('success', that.__design);
                });
            } else {
                promise.emit('success', that.__design = doc);
            }
        });
        return promise;
    }
});
//
// Set the Resource's _design document.
//
Resource.__defineSetter__('_design', function (obj) {
    return this.__design = obj;
});

this.view = function () {


};



