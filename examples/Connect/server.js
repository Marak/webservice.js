var connect    = require('connect'),
    server     = connect.createServer(),
    webservice = require('../../lib/webservice'),
    demoModule = require('../demoModule'),
    fs         = require('fs'),
    sys        = require('sys');


server.use(connect.logger());

server.use(webservice.createHandler({
  'demo': demoModule,
  'fs': fs,
  'sys': sys
}));

server.listen(3000);