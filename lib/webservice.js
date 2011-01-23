/* webservice.js - Marak Squires 2010 */

var webservice            = exports;

webservice.createServer   = require('./createServer').createServer;
webservice.createHandler  = require('./createHandler').createHandler;
webservice.createRouter   = require('./createRouter').createRouter;
webservice.view           = require('./view');
