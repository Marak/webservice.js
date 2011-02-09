/* webservice.js - Marak Squires 2010 */

var webservice            = exports;

webservice.createClient       = require('./createClient').createClient;
webservice.createServer       = require('./createServer').createServer;
webservice.createHandler      = require('./createHandler').createHandler;
webservice.createRouter       = require('./createRouter').createRouter;
webservice.createMetaRoutes   = require('./createRouter').createMetaRoutes;

webservice.view           = require('./view');
