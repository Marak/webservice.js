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
        R = this,
        filter = args.pop(),
        options = (typeof(args[args.length - 1]) === 'object') && args.pop();

    if (this._design && this._design._rev) {
        throw new(Error)("Cannot call 'filter' after design has been saved to database");
    }

    if (R.connection.protocol === 'database') { // Only CouchDB for now
        this._design = this._design || {
            _id:   ['_design', this.resource].join('/'),
            views: R.views || {}
        };
        if (typeof(filter) === 'object') {
            // In this case, we treat the filter as a raw view object,
            // and copy it as-is.
            if (typeof(filter.map) === 'function') {
                Object.keys(filter).forEach(function (key) {
                  filter[key] = filter[key].toString().replace(/\n|\r/g, '')
                                                      .replace(/\s+/g, ' ');
                });
                R.views[name] = filter;
            // Here, we treat the filter as a sub-object which must be matched
            // in the document to pass through.
            } else {
                R.views[name] = render({
                    map: function (doc) {
                        var object = $object;
                        if (doc.resource === $resource) {
                            if (function () {
                                for (var k in object) {
                                    if (object[k] !== doc[k]) { return false }
                                }
                                return true;
                            }()) { emit(doc._id, doc) }
                        }
                    }
                }, { object: filter, resource: JSON.stringify(R.resource) });
            }
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
        R[name] = function (/* [param], callback */) {
            var that     = this,
                promise  = new(events.EventEmitter),
                args     = Array.prototype.slice.call(arguments),
                callback = args.pop(),
                param    = args.pop() || {},
                path     = [this.resource, name].join('/');

            var params = (typeof(param) === 'object' && !Array.isArray(param)) ? param : { key: param };

            if (options) {
                Object.keys(options).forEach(function (key) {
                    params[key] = options[key];
                });
            }

            // Make sure our _design document is synched,
            // before we attempt to call it.
            if (this._design._rev) {
                that.view(path, params, callback);
            } else {
                R.sync(function () {
                    that.view(path, params, callback);
                });
            }
        };
    }
};

exports.render = render;


