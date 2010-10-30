var webservice = require('./lib/webservice'),
    demoModule = require('./demoModule'),
    fs         = require('fs'),
    sys        = require('sys'),
    assert     = require('assert');


webservice.createServer({
  'demo': demoModule,
  'fs': fs,
  'sys': sys
}).listen(8080);

console.log(' > json webservice started on port 8080');  
