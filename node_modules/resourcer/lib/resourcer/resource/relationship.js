var events = require('events');
var Resource = require('resourcer/resource').Resource;

// Remark: This is a copy paste job from view since one-to-many are just a special case of views
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

this.parent = function (type, options) {
    this.addListener('init', function (R) {
        R.property(type + '_id', 'number');
    });
};

this.child = function (type, options) {
    this.addListener('init', function (R) {
        if (R.connection.protocol === 'database') {
            // Remark: This should be running the query with include_docs=true
            // 1:40:54 AM Mikeal Rogers: if you emit the whole doc as the value it writes the whole document to the btree
            R.views[type] = render({
                map: function(doc) {
                    if (doc.resource === $child) {
                        emit([doc.$parent_id, 1, []], doc);
                    }
                }
            }, { child: "'" + capitalize(type) + "'",
                 parent_id: R.resource.toLowerCase() + '_id' });
                 
            // Here we create the named filter method on the Resource
            R[type] = function () {
                var that = this,
                    args = Array.prototype.slice.call(arguments),
                    params = {},
                    callback = (typeof(args[args.length - 1]) === 'function') && args.pop(),
                    promise = new(events.EventEmitter);

                if      (args.length === 1) { params = { key: args[0] } }
                else if (args.length > 1)   { params = { key: args } }

                // Make sure our _design document is up to date
                this.reload(function () {
                    that.view([that.resource, type].join('/'), params, callback);
                });
            }; 
        }
    });
};

//
// Utilities
//
function capitalize(str) {
    return str && str[0].toUpperCase() + str.slice(1);
}