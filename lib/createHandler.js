var ws = require('./webservice');

// creates a handler middleware, function(req, resp, next)
var createHandler = exports.createHandler = function ( module, options ){
  var router = ws.createRouter( module, options || {});
  return function (request, response, next) {
    
    router.handle(request, request.body, function (result) {
      var contentType = "text/html";

      if (result.status === 404 && next ) {
        if(next.length>1){
          return next(request, response, result);
        }
        else{
          return next();
        }
      }

      response.writeHead(result.status, {'Content-Type': contentType}, result.headers);
      response.end(result.body);

    });
  };
}