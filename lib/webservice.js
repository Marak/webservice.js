/* webservice.js - Marak Squires 2010 */

var webservice = exports,
    eyes       = require('eyes'),
    journey    = require('journey'),
    http       = require('http');

exports.createServer = function( modules ){


  // create a JSON structure representing each module and its associated method names
  var routes = {};
  for(var module in modules){
    routes[module] = {};
    for(var method in modules[module]){
       routes[module][method] = {};
    }
  }
    
  // create a router object with an associated routing table
  var router = new(journey.Router)(function (map) {

    // establish a default route at the root level that will return self-documentation
    map.root.bind(function (res) {
      res.send(200, {'Content-Type': 'text/html'}, renderRoutes('foo', routes));
    }); 

    // returns the version of the API
    map.get('/version').bind(function (res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });
    
    
    // iterate through each module
    for(var module in modules){
      // create a documentation page for each module
      // modules documentation can be viewed by visiting /moduleName
      (function(module){
        map.path('/' + module, function () {

          this.get().bind(function (res) {
            var output = '';
            output += renderRoutes(module, routes[module]);
            res.send(200, {'Content-Type': 'text/html'}, output);
          });

          var self = this;
          // iterate through each top-level method in the module and created a route for it in journey
          for(var m in modules[module]){
            var mm = modules[module];
            (function(m, mm){

              var regex = new RegExp('\/' + m + '\/(.*?)');
              self.get(regex).bind(function (res, resource, method, id, params) {

                var args = [];
                resource = resource.split('/');
                resource.forEach(function(item){
                  args.push(item);
                });
                
                eyes.inspect(args);

                // invoke the api method
                res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(mm[m].apply(this, args)));

                /*
                // lets check if the last argument is a function (as a string)
                // if it is, lets coherse it into a function and assume its a callback!
                var async = false;

                try{
                  var e = 'var fn = ' + args[args.length-1] + ';';
                  eval(e); // this could be done better
                  if(typeof fn == 'function'){
                    args[args.length-1] = res;
                    args.push(fn);
                    async = true;
                  }
                }
                catch(err){
                }

                if(async){

                  // push the response object into the expected arguments
                  // this is done so we can close the response down the chain

                  // invoke the api method
                  mm[m].apply(this, args);

                }
                else{

                  // invoke the api method
                  res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(mm[m].apply(this, args)));

                }
                */

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