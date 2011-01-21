/* webservice.js - Marak Squires 2010 */

var webservice = exports,
    eyes       = require('eyes'),
    journey    = require('journey'),
    http       = require('http');

// returns an instance of httpServer
exports.createServer = function( module ){
  
  var requestHandler = createHandler( module ),
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

// creates a handler middleware, function(req, resp, next)
var createHandler = exports.createHandler = function ( module, options ){
  var router = generateRouter( module, options || {});
  return function (request, response, next) {

      router.route(request, request.body, function (result) {

        var contentType;
        if (request.headers && typeof request.headers.accept === 'string' 
            && request.headers.accept.search('text/html') > -1) {
          contentType = "text/html";            
        }
        else {
          contentType = "application/json";            
        }

        if(result.status === 200){
          response.writeHead(result.status, {'Content-Type': contentType}, result.headers);
          response.end(result.body);
        }
        else{
          next(request, response, result);
        }
        
      });
      
  };
  
}


//
//  Returns a Journey router
//

function generateRouter( module, options ){
  
  // create a JSON structure representing each module and its associated method names
  // this is used later to help with documentation generation 
  var routes = {};

    for(var method in module){
      routes[method] = {};
      try{
        // in order to inspect the properties of each exported method, i'm creating a new instance of it...
        // if you can figure out a better way to do this, please let me know. i don't like this approach.
        /*
        var f = new module[method]();
        for(var p in f){
          routes[module][method][p] = f[p];
        }*/
        
        
      }
      catch(err){
        console.log(err);
      }
       
  }

  // create a router object with an associated routing table
  var router = new(journey.Router)(function (map) {

    if(options.bindroot !== false){
      map.root.bind(function(res){
        res.send(200, {'Content-Type': 'text/html'}, renderRoutes('html', '', routes));
      });
    }

    // returns the docs of the API
    map.get('/docs').bind(function (res) {
      res.send(200, {'Content-Type': 'text/html'}, renderRoutes('html', '', routes));
    });


    // returns the version of the API
    map.get('/version').bind(function (res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });
    
   

           var self = this;

           // iterate through each top-level method in the module and create a route for it in journey
           for(var method in module){
               var regex = new RegExp('\/' + method + '\/(.*?)'); 

               (function(module, method){
                 
               var handler = function (res, resource, id, params) {
                 
                 var args = [], options = {};
                 
                 
                 for(var p in resource){
                   if(resource[p].length){
                     options[p] = resource[p];
                   }
                 }
                
                 try{
                   var posted = JSON.parse(this.request.body);
                   for(var p in posted){
                     if(posted[p].length){
                       options[p] = posted[p];
                     }
                   }
                 }
                 catch(err){
                 }
                 
                 
                 args.push(options);
                 args.push(function(err, result){
                   if(err){
                     // TODO: create error handler view
                     res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(err));
                   }
                   else{
                     result = result || '';
                     res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(result.toString()));
                   }
                 });


                 module[method].request = this.request;
                 module[method].res = res;
                 // fire the method with new arguments
                 module[method].apply(this, args);
               };

               var regexfix = new RegExp('\/' + method); 
               map.route(regex).bind(handler);
               map.route(regexfix).bind(handler);

               })(module, method);
              


           }

      
  }, { strict: false });

  return router;
  
}

/*** simple internal view server ( for documentation ) ***/

function renderRoutes( format, name, items ) {

  if(format == 'json'){
    return JSON.stringify(items, true, 2);
  }
  
  if(format == 'html'){
    
    var html = '';
    
    html += '<h1>Welcome to your webservice.</h1>'
    
    html += '<h2>Available Methods</h2>';
    html += ('<ul>');
    
    // iterate through each top-level method in the module and created a link
    for(var method in items){
      
      // if the module is private, ignore it
      if(items[method].private === true){
        continue;
      }
      
     html += ('<li><a href="'+ name + '/' + method +'">' + '/' + method + '</a> <i>' + (items[method].docs || '') + ' </i></li>');
    }
    html += ('</ul>');
    
    html += '<h4>Powered by <a href="http://github.com/marak/webservice.js">webservice.js</a></h4>'
    
    return html;
  }
  
  return 'error';

}