var http       = require('http'),
    ws         = require('../../lib/webservice'),
    demoModule = require('../demoModule'),
    fs         = require('fs'),
    sys        = require('sys'),
    handler    = ws.createHandler({
      'demo': demoModule,
      'fs': fs,
      'sys': sys
    });

http.createServer(handler).listen(8080);

console.log(' > json webservice started on port 8080');  
