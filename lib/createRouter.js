var ws = require('./webservice'), 
    fs = require('fs'),
    journey = require('journey'),
    resourcer  = require('resourcer'),
    validator  = require('resourcer/validator');


//
//  Returns a Journey router
//

var createRouter = exports.createRouter = function createRouter( module, options ){
  

  var template = fs.readFileSync(__dirname + '/views/home.html'),
  routes = _createMetaRoutes( module );
  
  // create a router object with an associated routing table
  var router = new(journey.Router)(function (map) {

    if(options.bindroot !== false){
      map.root.bind(function(res){
        res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes('html', '', routes, template.toString()));
      });
    }

    // returns the docs of the API
    map.get('/docs').bind(function (res) {
      res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes('html', '', routes, template.toString()));
    });

    // returns the version of the API
    map.get('/version').bind(function (res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });

    // extend the Journey router with our generated routes based on the module
    _extendRouter(map, module);

  }, { strict: false });

  return router;
  
}

function _extendRouter( map, module ){
  
   // iterate through each top-level method in the module and create a route for it in journey
   for(var method in module){
     
     if(typeof module[method] != 'function'){
       continue;
     }
  
     var regex = new RegExp('\/' + method + '\/(.*?)'),
         regexfix = new RegExp('\/' + method),
         journeyHandler = _createJourneyHandler(module, method);

     // we should only have one handler being bound, this is a regex bug
     map.route(regex).bind(journeyHandler);
     map.route(regexfix).bind(journeyHandler);
    
  }
}

function _createJourneyHandler(module, method){
  
  var handler = function (res, resource, id, params) {

    var args = [], options = {}, self = this;

    if(typeof resource != 'object'){
      options.id = resource;
    }

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

    var callback = _createModuleCallback(self, res);

    // push callback into arguments array
    args.push(callback);

    // before we attempt to fire the API method, lets see if there is any validation available

    try{
      
      // if there is no validation, fire the method regardless of arguments
      if(typeof module[method].options == 'undefined'){
        // fire the method with new arguments
        module[method].apply(this, args);
        return;
      }
      
      // if the method is "restful" we will only perform validation on POST and PUT requests
      if(self.request.method == "GET" || self.request.method == "DELETE"){
        // fire the method with new arguments
        module[method].apply(this, args);
        return;
      }
      // check if all required options were passed before executing the method
      var validate = validator.validate(args[0], { 
        properties: module[method].options
      });
      
      if(!validate.valid){
        return callback(validate.errors);
      }else{
        module[method].apply(this, args);
      }
      
      
    }
    catch(err){
      
      // we had a run-time error, pass the error forward on the callback chain
      callback(err);
    }
  };
  
  return handler;
}

function _createModuleCallback( requestHandler , res ){
  // callback that will be sent as argument to our module's method
  return function(err, result, response){
    try{

      // mock out a response object
      if(typeof response == 'undefined'){
        var response = {};
      }
      // give it some defaults
      response.statusCode = response.statusCode || 200;

      // do some magic to determine what the Content-Type should be.
      var contentType =  "application/json";

      if(typeof requestHandler.request.headers['content-type'] != 'undefined'){
        contentType = requestHandler.request.headers['content-type'];
      }
      
      if(err){
        // TODO: create error handler view
        
        var html = '';
        // let's assume it's a validator error if its an array
        if(err instanceof Array){
          html = ws.view.renderValidatorErrors(err);
        }
        else{
          html = JSON.stringify(err);
        }
        
        
        res.send(response.statusCode, {'Content-Type': contentType}, html);
      }
      else{
        result = result || '';
        if(typeof result != 'string'){
          result = JSON.stringify(result);
        }
        res.send(response.statusCode, {'Content-Type': contentType}, result);
      }

    }
    catch(err){
      console.log(err);
    }

  };
  
}


// create a JSON structure representing a module and its associated method names
// this is used to help with documentation generation
function _createMetaRoutes( module ){
  
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

  if(!routes.endpoint){
    routes.endpoint = 'http://localhost:8080';
  }
  
  return routes;
  
}