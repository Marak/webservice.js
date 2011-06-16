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

vows.describe('resourcer/resource/relationship').addBatch({
    "One-To-Many:": {
        "A database containing authors and articles": {
            topic: function () {
                resourcer.use('database');
                var db = new(cradle.Connection)().database('test'), callback = this.callback;
                db.destroy(function () {
                    db.create(function () {
                        db.save([
                            { resource: 'Article', title: 'The Great Gatsby', author: 'fitzgerald', tags: ['classic'] },    
                            { resource: 'Article', title: 'Finding vim',      author: 'cloudhead', tags: ['hacking', 'vi'] },    
                            { resource: 'Article', title: 'On Writing',       author: 'cloudhead', tags: ['writing'] },    
                            { resource: 'Article', title: 'vi Zen',           author: 'cloudhead', tags: ['vi', 'zen'] },    
                            { resource: 'Article', title: 'Channeling force', author: 'yoda',      tags: ['force', 'zen'] },    
                            { resource: 'Body',    name: 'fitzgerald' }
                        ], callback);
                    });
                })
            },
            "and a Resource definition for Author and Article": {
                topic: function () {
                    this.Article = resourcer.define('article', function () {});
                    this.Author  = resourcer.define('author',  function () { this.child('article') });       
                    this.Article.parent('author');
                    return null;
                },
                "Author should have a <articles> method": function () {
                    assert.isFunction (this.Author.articles);
                },
                "Author should have a <parents> property which is empty": function () {
                    assert.isArray (this.Author.parents);
                    assert.isEmpty (this.Author.parents);
                },
                "Author should have a <children> property": function (Author, Article) {
                    assert.isArray (this.Author.children);
                    assert.include (this.Author.children, this.Article);
                },
                "Article should have a <parents> property which includes Author": function (Author, Article) {
                    assert.isArray  (this.Article.parents);
                    assert.include  (this.Article.parents, this.Author);
                },
                "Article should have a <children> property which is empty": function (Author, Article) {
                    assert.isArray (this.Article.children);
                    assert.isEmpty (this.Article.children);
                },
                "Article should have a <byAuthor> filter": function (Author, Article) {
                    assert.isFunction (this.Article.byAuthor);
                    assert.isObject   (this.Article.views.byAuthor);
                },
                "when instantiated": {
                    topic: function () {
                        this.author = new(this.Author);
                        this.article = new(this.Article);
                        return null;
                    },
                    "author should have a <articles> method": function () {
                        assert.isFunction (this.author.articles);
                    },
                    "author should have a <article_ids> property": function (_, Author, Article) {
                        assert.isArray (this.author.article_ids);
                    },
                    "article should have a <author_id> property": function (Author, Article) {
                        assert.include  (this.article, 'author_id');
                        assert.isNull   (this.article.author_id);
                    },
                    "article should have a <author> method": function (Author, Article) {
                        assert.isFunction (this.article.author);
                    }
                }
            }
        }
    }
}).export(module);