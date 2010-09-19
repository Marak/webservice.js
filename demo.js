var webservice = require('./lib/webservice'),
    fs         = require('fs'),
    sys        = require('sys');


//webservice.start('the sys module webservice', sys);
webservice.start('the fs module webservice', fs);

