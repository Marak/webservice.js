var webservice = require('./lib/webservice'),
    fs         = require('fs'),
    sys        = require('sys');


//webservice.start('the sys module webservice', sys);

webservice.createServer('the fs module webservice', fs).listen(8080);

