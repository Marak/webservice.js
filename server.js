var webservice = require('./lib/webservice'),
    demoModule = require('./demoModule'),
    fs         = require('fs'),
    sys        = require('sys');


webservice.createServer({
  'demoModule': demoModule,
  'fs': fs,
  'sys': sys
}).listen(8080);


