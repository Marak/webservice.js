var webservice = require('../lib/webservice'),
    demoModule = require('../test/fixtures/demoModule'),
    colors     = require('colors');

webservice.createServer(demoModule).listen(8080);

console.log(' > stand-alone json webservice started on port 8080'.cyan);  
