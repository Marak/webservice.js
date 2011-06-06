var path = require('path'),
    sys = require('sys'),
    assert = require('assert'),
    events = require('events'),
    http = require('http'),
    fs = require('fs');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var cradle = require('cradle'),
    vows = require('vows'),
    resourcer = require('resourcer');

resourcer.env = 'test';

vows.describe('resourcer/resource/relationship').addBatch({
    "A database containing articles and other resources": {
        topic: function () {
            resourcer.use('database');
            var promise = new(events.EventEmitter);
            var db = new(cradle.Connection)().database('test');
            db.destroy(function () {
                db.create(function () {
                    db.insert([
                        { resource: 'Contact', _id: 'indexzero',  name: 'indexzero', address: '123 Nowhere St.', },    
                        { resource: 'Contact', _id: 'cloudhead',  name: 'cloudhead', address: '123 Rue Nowhere', },    
                        { resource: 'Contact', _id: 'marak',      name: 'marak',     address: '123 Nowhere St.', },    
                        { resource: 'Phone', _id: '0000000000', contact_id: 'indexzero', type: 'home',  },    
                        { resource: 'Phone', _id: '1111111111', contact_id: 'indexzero', type: 'work',  },
                        { resource: 'Phone', _id: '2222222222', contact_id: 'indexzero', type: 'mobile',  },    
                        { resource: 'Phone', _id: '3333333333', contact_id: 'cloudhead', type: 'home',  },    
                        { resource: 'Phone', _id: '4444444444', contact_id: 'cloudhead', type: 'work',  },
                        { resource: 'Phone', _id: '5555555555', contact_id: 'cloudhead', type: 'mobile',  },    
                        { resource: 'Phone', _id: '6666666666', contact_id: 'marak',    type: 'home',  },    
                        { resource: 'Phone', _id: '7777777777', contact_id: 'marak',    type: 'work',  },
                        { resource: 'Phone', _id: '9999999999', contact_id: 'marak',    type: 'mobile',  },    
                    ], function () {
                        promise.emit('success');
                    });
                });
            })
            return promise;
        },
        "is created": function () {}
    } 
}).addBatch({
    "A Resource definition with relationships": {
        topic: function () {
            resourcer.defineResource('Phone', function () {
                this.use('database');
                
                this.property('type', 'string');
                this.parent('contact');
            });
            
            return resourcer.defineResource('Contact', function () {
                this.use('database');
                
                this.property('name', 'string');
                this.property('address', 'string');
                this.child('phone');
            }).register();
        },
        "should respond to the child filters": function (R) {
            assert.isFunction (R.phone);
        },
        "can be used to query the database:": {
            "<phone>": {
                topic: function (Contact) {
                    this.Contact = Contact;
                    Contact.phone(this.callback);
                },
                "should return an array of all published Articles": function (e, res) {
                    var that = this;
                    assert.isArray (res);
                    assert.length  (res, 9);
                    res.forEach(function (d) {
                        assert.isObject   (d);
                        assert.equal      (d.resource, 'Phone');
                    });
                }
            },
        }
    }
}).export(module);