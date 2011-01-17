var http = require('http');

http.createServer(require('stack')(
  require('./webservice.stack')()
)).listen(8080);
  

console.log(' > json webservice started on port 8080');