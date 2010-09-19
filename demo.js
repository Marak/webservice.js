var webservice = require('./lib/webservice'),
    fs         = require('fs'),
    sys        = require('sys'),
    demoModule = require('./demoModule');


webservice.createServer({
  'demoModule': demoModule,
  'fs': fs,
  'sys': sys
}).listen(8080);


