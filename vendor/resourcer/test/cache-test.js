require.paths.unshift(require('path').join(__dirname, '..', 'lib'));

var path = require('path'),
    sys = require('sys'),
    events = require('events'),
    assert = require('assert'),
    vows = require('vows'),
    resourcer = require('resourcer');

var connection = new(resourcer.engines.memory.Connection)('cache-test').load([
    { resource: 'Article', title: 'The Great Gatsby', published: true,  author: 'fitzgerald'},    
    { resource: 'Article', title: 'Finding vim',      published: false, author: 'cloudhead' },    
    { resource: 'Article', title: 'Channeling force', published: true,  author: 'yoda' },    
    { resource: 'Body',    name: 'fitzgerald' }
]);

var Article = resourcer.defineResource('Article', function () {
    this.property('title');
    this.property('published', Boolean);
}).register().connect('memory://cache-test');

vows.describe('resourcer/resource/cache').addVows({
    "When creating an instance, and saving it": {
        topic: function () {
            this.article = new(Article)({ _id: 43, title: "The Last Article", published: true });
            this.article.save(this.callback);
        },
        "and then loading it back up with `get()`": {
            topic: function () {
                Article.get(43, this.callback);
            },
            "It should return the previous instance": function (res) {
                assert.strictEqual (res._properties, this.article._properties);
            }
        },
        "and then loading it back up with `find()`": {
            topic: function () {
                Article.find({ title: "The Last Article" }, this.callback);
            },
            "It should return the previous instance": function (res) {
                assert.strictEqual (res[0]._properties, this.article._properties);
            }
        }
    }
}).addVows({
    "When creating an instance, and saving it": {
        topic: function () {
            this.article = new(Article)({ _id: 43, title: "The Last Article", published: true });
            this.article.save(this.callback);
        },
        "and then clearing the cache and loading it back up with `get()`": {
            topic: function () {
                resourcer.caches.clear();
                Article.get(43, this.callback);
            },
            "It should return a new instance": function (res) {
                assert.notStrictEqual (res, this.article);
            }
        }
    }
}).export(module);
