/* webservice.js - Marak Squires 2010 */

var webservice = exports,
    eyes       = require('eyes'),
    resourcer = require('resourcer'),
    validator = require('resourcer/validator'),
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
      
      switch(typeof module[method]){
      
        case 'function': 
          routes[method] = {};
          try{
            var f = module[method];
            for(var p in f){
              routes[method][p] = f[p];
            }
          }
          catch(err){
            console.log(err);
          }
        
        break;

        case 'string': 
          routes[method] = module[method];
        break;
        
        default:  
        break;
        
      }
      
       
  }
  
  
  if(!routes.name){
    routes.name = 'my api';
  }
  
  if(!routes.version){
    routes.version = '0.1.0';
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

     // iterate through each top-level method in the module and create a route for it in journey
     for(var method in module){
       
         if(typeof module[method] != 'function'){
           continue;
         }
        
         var regex = new RegExp('\/' + method + '\/(.*?)'); 

         (function(module, method){
       
         var handler = function (res, resource, id, params) {
       
           var args = [], options = {}, self = this;
       
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
           module[method].request = this.request;
           module[method].res = res;
       
           args.push(options);
       
           // callback that will be sent as argument to our module's method
           var callback = function(err, result, response){

             try{
         
               // mock out a response object
               if(typeof response == 'undefined'){
                 var response = {};
               }
               // give it some defaults
               response.statusCode = response.statusCode || 200;

               // do some magic to determine what the Content-Type should be.
               var contentType =  "application/json";
         
               if(typeof self.request.headers['content-type'] != 'undefined'){
                 contentType = self.request.headers['content-type'];
               }

               if(err){
                 // TODO: create error handler view
                 
                 var html = '';
                 // let's assume it's a validator error if its an array
                 if(err instanceof Array){
                   html = renderValidatorErrors(err);
                 }
                 else{
                   html = JSON.stringify(err);
                 }
                 
                 
                 res.send(response.statusCode, {'Content-Type': contentType}, html);
               }
               else{
                 result = result || '';
                 res.send(response.statusCode, {'Content-Type': contentType}, JSON.stringify(result.toString()));
               }
         
             }
             catch(err){
               console.log(err);
             }

           };

           // push callback into arguments array
           args.push(callback);

           // before we attempt to fire the API method, lets see if there is any validation available
           

           try{
             
             if(typeof module[method].options != 'undefined'){
               // check if all required options were passed before executing the gram
               var validate = validator.validate(args[0], { 
                 properties: module[method].options
               });
               
               if(!validate.valid){
                 return callback(validate.errors);
               }
             }
             
             // fire the method with new arguments
             module[method].apply(this, args);
           }
           catch(err){
             // we had a run-time error, pass the error forward on the callback chain
             callback(err);
           }
         };

         // we should only have one handler being bound, this is a regex bug
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
    html += '<h3>' + items.name + '</h3>';
    html += 'Version <i>' + items.version + '</i>';
    html += '<h3>Available Methods</h3>';
    html += ('<ul>');
    // iterate through each top-level method in the module and created a link
    for(var method in items){
      if(typeof items[method] == 'string'){
        continue;
      }
      // if the module is private, ignore it
      if(items[method].private === true){
        continue;
      }
     html += ('<li><a href="'+ name + '/' + method +'">' + '/' + method + '</a> <i>' + (items[method].docs || '') + ' </i></li>');
     if(items[method].options){
       html += ('<li><ul>');
       for(var arg in items[method].options){
         html += ('<li>' + arg + ' ' + JSON.stringify(items[method].options[arg]) + '</li>');
       }
       html += ('</ul></li>');
     }
    }
    html += ('</ul>');
    html += '<h4>Powered by <a href="http://github.com/marak/webservice.js" target="_blank">webservice.js</a></h4>'
    return html;
  }
  return 'error';
}

/*** simple html renderer for validator errors ***/
function renderValidatorErrors(errors){
  
  var html = '<h1>error(s) have occurred with your request!</h1>';
  
  errors.forEach(function(v,i){
    
    html += "Argument Name:" + v.property + '<br/>';
    html += "Value:" + v.actual + '<br/>';
    html += "Expected:" + v.expected + '<br/>';
    html += "Message:" + v.message + '<br/><br/>';
  });
  
  
  return html;
}