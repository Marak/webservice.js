/* webservicer.js - Marak Squires 2010 */

var webservice = exports,
eyes = require('eyes'),
journey = require('journey'),
http = require('http');

exports.start = function( module ){
  eyes.inspect(module);
  
  // Create a Router object with an associated routing table
  var router = new(journey.Router)(function (map) {

    // establish a default route at the root level that will create links
    map.root.bind(function (res) { 
      
      
      
      res.send(200, {'Content-Type': 'text/html'}, renderDocs(module));
    }); 

    // 
    // Version Binding
    //
    map.get('/version').bind(function (res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });

    // iterate through each top-level method in the module and created a route for it in journey
    for(var method in module){

      map.get('/' + method).bind(function (res, resource, method, id, params) {

        eyes.inspect(res);
          eyes.inspect(resource);
            eyes.inspect(method);
              eyes.inspect(id);
                eyes.inspect(params);
        res.send(200, {'Content-Type': 'application/json'}, {
          "message" : "invalid api resource, valid resources are : " + JSON.stringify({})
        });

      });


    }
    


  }, { strict: false });
  
  
  http.createServer(function (request, response) {
    var body = "";
    request.addListener('data', function (chunk) { 
      body += chunk 
    });

    request.addListener('end', function () {
      //
      // Dispatch the request to the router
      //
      router.route(request, body, function (result) {

        var contentType;
        if (request.headers && typeof request.headers.accept === 'string' 
            && request.headers.accept.search('text/html') > -1) {
          contentType = "text/html";            
        }
        else {
          contentType = "application/json";            
        }

        response.writeHead(result.status, {'Content-Type': contentType}, result.headers);
        response.end(result.body);
      });
    });
  }).listen(8080);
  
  
  
};


function renderDocs( module ) {
  
  var html;
  
  html += ('<ul>');
  
  // iterate through each top-level method in the module and created a link
  for(var method in module){
    html += ('<li><a href="/'+ method +'">' + '/' + method + '</a></li>');
  }

  html += ('</ul>');
  
  return html;

}