var path = require('path'),
    sys = require('sys'),
    assert = require('assert'),
    events = require('events'),
    http = require('http'),
    fs = require('fs');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var vows = require('vows');
var eyes = require('eyes');
var cradle = require('cradle');

var resourcer = require('resourcer');

vows.describe('resourcer/engines/database').addVows({
    "A database containing default resources": {
        topic: function () {
            var promise = new(events.EventEmitter);
            var db = new(cradle.Connection)().database('test');
            db.destroy(function () {
                db.create(function () {
                    db.insert([
                        { _id: 'bob', age: 35, hair: 'black'},
                        { _id: 'tim', age: 16, hair: 'brown'},
                        { _id: 'mat', age: 29, hair: 'black'}
                    ], function () {
                        promise.emit('success');
                    });
                });
            })
            return promise;
        },
        "is created": function () {}
    }
}).addVows({
    "A default Resource factory" : {
        topic: function() {
            resourcer.env = 'test';
            return resourcer.defineResource(function () {
                this.use('database');
            });
        },
        "a create() request": {
            topic: function (r) {
                r.create({ _id: 'charlie', age: 30, hair: 'red'}, this.callback);
            },
            "should respond with a `201`": function (e, res) {
                assert.equal (res.status, 201);
            },
            "followed by a get() request": {
                topic: function (_, r) {
                    r.get('charlie', this.callback);
                },
                "should respond with an object that has a revision": function (e, obj) {
                  assert.equal(obj._id, 'charlie');
                  assert.notEqual(obj._rev, undefined);
                }
            }
        },
        "a get() request": {
            "when successful": {
                topic: function (r) {
                    return r.get('bob', this.callback);
                },
                "should respond with a Resource instance": function (e, obj) {
                    assert.isObject   (obj);
                    assert.instanceOf (obj, resourcer.resources.Resource);
                    assert.equal      (obj.constructor, resourcer.resources.Resource);
                },
                "should respond with the right object": function (e, obj) {
                    assert.equal (obj._id, 'bob');
                    assert.isNotNull (obj._rev);
                }
            },
            "when unsuccessful": {
                topic: function (r) {
                    r.get("david", this.callback);
                },
                "should respond with an error": function (e, obj) {
                    // Remark: Getting e.status === undefined instead of 404
                    assert.equal       (e.status, 404);
                    assert.isUndefined (obj);
                }
            }
        },
        "an update() request": {
            "from a get() request": {
                "when successful": {
                    topic: function (r) {
                        that = this;
                        r.get('bob', function (e, obj) {
                            obj.update({ age: 45 }, that.callback);
                        });
                    },
                    "should respond with 201": function (e, res) {
                        assert.equal(res.status, 201);
                    }
                }
            },
            "when successful": {
                topic: function (r) {
                    return r.update('bob', { age: 45 }, this.callback);
                },
                "should respond with 201": function (res) {
                    assert.equal(res.status, 201);
                }
            }
        },
    }
}).export(module);
