var webservice = require('./lib/webservice'),
    demoModule = require('./demoModule'),
    fs         = require('fs'),
    sys        = require('sys'),
    assert     = require('assert');


webservice.createServer({
  'demoModule': demoModule,
  'fs': fs,
  'sys': sys,
  'assert': assert
}).listen(8080);


