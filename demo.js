var webservice = require('./lib/webservice'),
    fs         = require('fs'),
    sys        = require('sys');


//webservice.start('the sys module webservice', sys);

webservice.createServer({
  'fs': fs,
  'sys': sys
  }).listen(8080);

