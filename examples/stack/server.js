var http   = require('http'),
    colors = require('colors');

http.createServer(require('stack')(
  require('./webservice.stack')()
)).listen(8080);

console.log(' > Stack server with webservice.js middleware started on port 8080'.cyan);