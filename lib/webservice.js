/* webservice.js - Marak Squires 2010 */

var webservice = exports,
    eyes       = require('eyes'),
    journey    = require('journey'),
    http       = require('http');

// returns an instance of httpServer
exports.createServer = function( modules ){

  // create a JSON structure representing each module and its associated method names
  // this is used later to help with documentation generation 
  var routes = {};
  for(var module in modules){
    routes[module] = {};
    for(var method in modules[module]){
       routes[module][method] = {};
    }
  }
    
  // create a router object with an associated routing table
  var router = new(journey.Router)(function (map) {

    // establish a default route at the root level that will return self-documentation all avaialble modules
    map.root.bind(function (res) {
      res.send(200, {'Content-Type': 'text/html'}, renderRoutes('foo', routes));
    }); 

    // returns the version of the API
    map.get('/version').bind(function (res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });
    
    // iterate through each module
    for(var module in modules){
      
      (function(module){
        var regex = new RegExp('\/' + module + '(\/)?');
        map.path(regex, function () {
          
          // create a documentation page for each module
          this.get().bind(function (res) {
            var output = '';
            output += renderRoutes(module, routes[module]);
            res.send(200, {'Content-Type': 'text/html'}, output);
          });

          var self = this;
          
          // iterate through each top-level method in the module and create a route for it in journey
          for(var m in modules[module]){
            var mm = modules[module];
            (function(m, mm){

              var regex = new RegExp('\/' + m + '(.*?)');
              self.get(regex).bind(function (res, resource, method, id, params) {

                var args = [];
                
                // split all additional parameters into an array
                method = method.split('/');

                // push all parameters into an args array
                method.forEach(function(item){
                  if(item.length){
                    args.push(item);
                  }
                });

                // check if the last argument is the word "async"
                // if this convention is met, we are going to assume the api method we are going to invoke is async
                // if the api method we are trying to invoke is async, push the result to our router's respond handler
                // the assumption is that callbacks will be in the format of: callback(err, result)
          
                if(args[args.length-1] == 'async') {
                  args = args.slice(0, args.length-1);
                  args.push(function(err, result){

                    if(err){
                      // TODO: create error handler view
                      res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(err));
                    }
                    else{
                      res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(result.toString()));
                    }
                    
                  });
                  
                  // fire the method with new arguments
                  mm[m].apply(this, args);
                }
                else{
                  res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(mm[m].apply(this, args)));
                }

              });
            })(m, mm);
          }

        }); 
      })(module);
      
    }

  }, { strict: false });
  
  
  var server = http.createServer(function (request, response) {
    var body = "";
    request.addListener('data', function (chunk) { 
      body += chunk 
    });

    request.addListener('end', function () {

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
  });
  console.log(' > json webservice started on port 8080');  
  return server;
  
};


/*** simple internal view server ( for documentation) ***/

function renderRoutes( contentType, routes ) {
  
  return JSON.stringify(routes, true, 2);
  
  var html = '';
  
  html += '<h2><a href="/'+name+'">/' + name + '</a></h2>';

  html += ('<ul>');

  // iterate through each top-level method in the module and created a link
  for(var method in module){
   html += ('<li><a href="'+name+'/'+ method +'">' + '/' + method + '</a></li>');
  }

  html += ('</ul>');

  
  
  return html;

}