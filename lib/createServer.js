var ws = require('./webservice'),
    http = require('http');

// returns an instance of httpServer
exports.createServer = function( module ){
  
  var requestHandler = ws.createHandler( module ),
      server         = http.createServer(function(request, response){
        request.body = "";
        request.addListener('data', function (chunk) { 
          request.body += chunk 
        });
        request.addListener('end', function () {
          
          requestHandler(request, response, function(request, response , result){
            if(result.status === 404){
              response.writeHead(result.status, {'Content-Type': result['Content-Type']}, result.headers);
              response.end('404. The method you requested does not exist.');
            }
          });
        });
      });
  return server;
};