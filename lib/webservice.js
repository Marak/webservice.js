/* webservicer.js - Marak Squires 2010 */

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

    // 
    // Version Binding
    //
    map.get('/version').bind(function (res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });

    
    // iterate through each module
    for(var module in modules){

      // createa a home page / documentation page for each module
      // establish a default route at the root level that will create links
      (function(module){
        map.get('/' + module).bind(function (res) { 
          var html = '';
          html += '<h1><a href = "/">/home</a></h1>';
          html += renderDocs(module, modules[module]);
          res.send(200, {'Content-Type': 'text/html'}, html);
        }); 
      })(module);
      
      
      
      //eyes.inspect(modules[module]);
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
          
            eyes.inspect(mm[m]);
            var result = mm[m].apply(this, args);

            if(result==undefined){
              result = 'no value returned, but method was executed. this method might require a callback';
            }
          
            res.send(200, {'Content-Type': 'application/json'}, {
              "message" : JSON.stringify(result)
            });

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
  });
  
  return server;
  console.log('json-rpc webservice started on port 8080');
  
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