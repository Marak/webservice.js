var connect    = require('connect'),
    server     = connect.createServer(),
    webservice = require('../../lib/webservice'),
    demoModule = require('../sample_modules/demoModule'),
    colors     = require('colors');


server.use(connect.logger());

server.use(webservice.createHandler(demoModule));

server.listen(3000);

console.log('Connect server running on port 3000 with webservice.js'.cyan);