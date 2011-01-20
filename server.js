var webservice = require('./lib/webservice'),
    demoModule = require('./examples/demoModule'),
    fs         = require('fs'),
    sys        = require('sys'),
    assert     = require('assert');


webservice.createServer(demoModule).listen(8080);

console.log(' > json webservice started on port 8080');  
