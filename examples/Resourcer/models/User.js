/*
 * user.js: User object that defines our user resource through resourcer.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */
 
var sys = require('sys'),
    events = require('events');



var resourcer = require('resourcer');

var User = function () {
  // User constructor
  events.EventEmitter.call(this);
};

// Inherit from events.EventEmitter
sys.inherits(User, events.EventEmitter);

// Remark: This should probably be configurable somewhere
resourcer.env = User.env = 'development';

User.prototype.init = function (options) {
  var ipAddress ="127.0.0.1", 
      port = 5984,
      auth = {},
      self = this;
  
  var self = this;
  this.resource = resourcer.defineResource('User', function () {
    this.use('memory');
    this.connect(ipAddress, port, auth);
    
    // Create default properties
    this.property('username', 'string');
    this.property('password-hash', 'string');
    this.property('password-salt', 'string');
    this.property('password', 'string');
    this.property('email', 'string');
    this.property('address', 'string');
    this.property('city', 'string');
    this.property('state', 'string');
    this.property('zipcode', 'string');

    // Create default views
    this.filter('all', { include_docs: true }, {
      map: function (doc) {
        if (doc.resource === 'User') { emit(doc._id, doc); } 
      }
    });

    // Re-emit the 'init' event for consumers of the wrapped User resource
    this.addListener('init', function (resource) {
      self.emit('init', null, resource);
    });
  }); 
  
  return this;
};

// 
// Wrap the default Resource access methods in the User prototype
//
['create', 'save', 'update', 'destroy', 'get'].forEach(function (method) {
  User.prototype[method] = function () {
    this.resource[method].apply(this.resource, arguments);
  };
});

exports.Users = new User();