/* webservice.js - Marak Squires 2010 */

var webservice            = exports;

webservice.createClient       = require('./createClient').createClient;
webservice.createServer       = require('./createServer').createServer;
webservice.createHandler      = require('./createHandler').createHandler;
webservice.createRouter       = require('./createRouter').createRouter;
webservice.createEndpoint     = require('./createRouter').createEndpoint;
webservice.view               = require('./view');
