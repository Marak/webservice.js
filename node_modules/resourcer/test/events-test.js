var path = require('path'),
    sys = require('sys'),
    assert = require('assert'),
    events = require('events'),
    http = require('http'),
    fs = require('fs');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var vows = require('vows');

var resourcer = require('resourcer');

vows.describe('resourcer/events').addVows({
    "an Article": {
        topic: function () {
            return resourcer.defineResource("article", function () {
                this.property('title');
            });
        },
        "with a 'success' watcher on `save`": {
            topic: function (A) {
                var that = this;
                this.func = function (obj) {
                    that.obj = obj;
                };
                A.addListener('saveEnd', this.func);
                return A;
            },
            "should add the bound method to factory's `listeners` array": function (A) {
                 assert.isArray (A.listeners('saveEnd'));
                 assert.equal   (A.emitter.listeners('saveEnd')[0], this.func);
            },
            "when calling save() on an instance of Article": {
                topic: function (A) {
                    new(A)({ _id: 64, title: 'an Article' }).save(this.callback);
                },
                "should trigger the bound function": function (e, res) {
                    assert.isObject (this.obj);
                }
            
            }
            
        }
    }
}).export(module);
