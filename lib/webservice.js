/* webservice.js - Marak Squires 2010 */

var webservice = exports,
eyes = require('eyes'),
journey = require('journey'),
http = require('http');

exports.createServer = function( modules ){
  
  // Create a Router object with an associated routing table
  var router = new(journey.Router)(function (map) {

    // establish a default route at the root level that will create links
    map.root.bind(function (res) { 
      var html = '';
      for(var module in modules){
        html += renderDocs(module, modules[module]);
      }
      res.send(200, {'Content-Type': 'text/html'}, html);
    }); 

    map.get('/version').bind(function (res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });
    
    // iterate through each module
    for(var module in modules){

      // create a a home page / documentation page for each module
      (function(module){
        map.get('/' + module).bind(function (res) { 
          var html = '';
          html += '<h1><a href = "/">/home</a></h1>';
          html += renderDocs(module, modules[module]);
          res.send(200, {'Content-Type': 'text/html'}, html);
        }); 
      })(module);
      
      // iterate through each top-level method in the module and created a route for it in journey
      for(var m in modules[module]){
        var mm = modules[module];
        (function(m, mm){
          //console.log('/' + module + '/' + m);
          map.get('/' + module + '/' + m).bind(function (res, resource, method, id, params) {

            var args = [];
            for(var p in resource){
              args.push(resource[p]);
            }
          
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
            

          });
        })(m, mm);
      }
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


function renderDocs( name, module ) {
  
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