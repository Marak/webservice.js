var connect    = require('connect'),
    server     = connect.createServer(),
    webservice = require('../../lib/webservice'),
    demoModule = require('../demoModule');


server.use(connect.logger());

server.use(webservice.createHandler(demoModule));

server.listen(3000);