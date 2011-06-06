var path = require('path'),
    sys = require('sys'),
    assert = require('assert'),
    events = require('events'),
    http = require('http'),
    fs = require('fs');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var cradle = require('cradle');

var vows = require('vows');

var resourcer = require('resourcer');

var numberOfArticles = 5;

resourcer.env = 'test';

vows.describe('resourcer/resource/view').addVows({
    "A database containing articles and other resources": {
        topic: function () {
            resourcer.use('database');
            var promise = new(events.EventEmitter);
            var db = new(cradle.Connection)().database('test');
            db.destroy(function () {
                db.create(function () {
                    db.insert([
                        { resource: 'Article', title: 'The Great Gatsby', published: true,  author: 'fitzgerald', tags: ['classic'] },    
                        { resource: 'Article', title: 'Finding vim',      published: false, author: 'cloudhead', tags: ['hacking', 'vi'] },    
                        { resource: 'Article', title: 'On Writing',       published: true,  author: 'cloudhead', tags: ['writing'] },    
                        { resource: 'Article', title: 'vi Zen',           published: false, author: 'cloudhead', tags: ['vi', 'zen'] },    
                        { resource: 'Article', title: 'Channeling force', published: true,  author: 'yoda',      tags: ['force', 'zen'] },    
                        { resource: 'Body',    name: 'fitzgerald' }
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
    "A Resource definition with filters": {
        topic: function () {
            return resourcer.defineResource('Article', function () {
                this.use('database');
                this.property('author');
                this.property('title');
                this.property('published', Boolean);

                this.filter('all', {});
                this.filter('published', { published: true });
                this.filter('by', function (author) { return { author: author } });
            }).register();
        }, 
        "should respond to the filters": function (R) {
            assert.isFunction (R.published);
            assert.isFunction (R.all);
            assert.isFunction (R.by);
        },
        "can be used to query the database:": {
            "<published>": {
                topic: function (Article) {
                    this.Article = Article;
                    Article.published(this.callback);
                },
                "should return an array of all published Articles": function (e, res) {
                    var that = this;
                    assert.isArray (res);
                    assert.length  (res, 3);
                    res.forEach(function (d) {
                        assert.isObject   (d);
                        assert.instanceOf (d, that.Article);
                        assert.equal      (d.constructor, that.Article);
                        assert.equal      (d.resource, 'Article');
                        assert.ok         (d.published);
                    });
                }
            },
            "<all>": {
                topic: function (Article) {
                    Article.all(this.callback);
                },
                "should return an array of all Article records": function (e, res) {
                    assert.isArray (res);
                    assert.length  (res, 5);
                }
            },
            "<by> 'cloudhead'": {
                topic: function (Article) {
                    Article.by('cloudhead', this.callback);
                },
                "should return an array of Article records by 'cloudhead'": function (e, res) {
                    assert.isArray (res);
                    assert.length  (res, 3);
                    res.forEach(function (d) {
                        assert.isObject   (d);
                        assert.equal      (d.resource, 'Article');
                        assert.equal      (d.author,   'cloudhead');
                    });
                }
            },
            "<by> 'yoda'": {
                topic: function (Article) {
                    Article.by('yoda', this.callback);
                },
                "should return an array of Article records by 'yoda'": function (e, res) {
                    assert.isArray (res);
                    assert.length  (res, 1);
                    assert.equal   (res[0].author, 'yoda');
                }
            }
        }
    }
}).export(module);


