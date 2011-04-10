require.paths.unshift(require('path').join(__dirname, '../vendor/resourcer/lib/'));

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
  routes = createMetaRoutes(module);
  
  // create a router object with an associated routing table
  var router = new(journey.Router)({ strict: false, api: "basic" });

  if(options.bindroot !== false){
    router.root.bind(function(res){
      res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes('html', '', routes, template.toString()));
    });
  }

  // returns the docs of the API
  router.get('/docs').bind(function (res) {
    res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes('html', '', routes, template.toString()));
  });

  // returns the docs of the API
  router.get('/docs.json').bind(function (res) {
    res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes('html', '', routes, JSON.stringify(routes)));
  });

  // returns the version of the API
  router.get('/version').bind(function (res) {
      res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
  });

  // extend the Journey router with our generated routes based on the module
  _extendRouter(router, module, options);

  //require('eyes').inspect(router);
  return router;
  
}

function _extendRouter( map, module, options ){
  
   // iterate through each top-level method in the module and create a route for it in journey
   for(var method in module){
     
     if(typeof module[method] != 'function'){
       continue;
     }
  
     var regex = new RegExp('\/' + method + '\/(.*?)'),
         regexfix = new RegExp('\/' + method),
         journeyHandler = _createJourneyHandler(module, method, options);


         // hard-coded for one additional layer of restful methods
         for(var p in module[method]){
           if(typeof module[method][p] == "function"){
             var a = new RegExp('\/' + method + '\/([\w|\-]+)');
             map.route(a).bind(journeyHandler);
           }
         }

     // we should only have one handler being bound, this is a regex bug
     map.route(regex).bind(journeyHandler);
     map.route(regexfix).bind(journeyHandler);

  }
}

function _createJourneyHandler(module, method, options){
  
  var handler = function (res, resource, id, params) {

    var method_options = {}, self = this;

    self.request.params = [];

    if(typeof resource != 'object'){
      method_options.id = resource;
    }

    for(var p in resource){
      if(resource[p].length){
        method_options[p] = resource[p];
      }
    }

    try{
      var posted = JSON.parse(this.request.body);
      for(var p in posted){
        if(posted[p].length){
          method_options[p] = posted[p];
        }
      }
    }
    catch(err){
    }
    
    // bind all createHandler options to each argument 
    for(var p in options){
      method_options[p] = options[p];
    }
    
    module[method].request = this.request;
    module[method].res = res;
    self.request.params.push(method_options);

    var callback = _createModuleCallback(self, res);

    // push callback into arguments array
    self.request.params.push(callback);

    // before we attempt to fire the API method, lets see if there is any validation available

    try{
      
      // if there is no validation, fire the method regardless of arguments
      if(typeof module[method].schema == 'undefined'){
        // fire the method with new arguments
        module[method].apply(this, self.request.params);
        return;
      }
      
      // if the method is "restful" we will only perform validation on POST and PUT requests
      if((module[method].restful == true && self.request.method == "GET") || self.request.method == "DELETE"){
        // fire the method with new arguments
        module[method].apply(this, self.request.params);
        return;
      }
      
      // check if all required options were passed before executing the method
      var validate = validator.validate(self.request.params[0], {
        properties: module[method].schema
      });
      if(!validate.valid){
        return callback(validate.errors);
      }else{
        module[method].apply(this, self.request.params);
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

        // If "callback" is one of the incoming http params, then we are performing a JSONP request
        // wrap it up in a JSONP env
        if (requestHandler.request.params[0].callback) {
          result = JSONPWRAP(requestHandler.request.params[0].callback, result);
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
var createMetaRoutes = exports.createMetaRoutes = function (module, routes){
  routes = routes || {};
  for(var method in module){
    switch(typeof module[method]){
      case 'function': 
        routes.methods = routes.methods || {};
        try{
          var f = module[method];
          if (Object.keys(f).length) {
            routes.methods[method] = {};
          }
          for(var p in f){
            routes.methods[method][p] = f[p];
          }
        }
        catch(err){
          console.log(err);
        }
      break;
      case 'object':
        // Determine if we have a null object or not
        if (Object.keys(module[method]).length) {
          routes.methods = routes.methods || {};
          routes.methods[method] = createMetaRoutes(module[method],  routes.methods[method]);
        }
      break;
      default:
        routes[method] = module[method];
      break;
    }
  }
  /*
  if(!routes.title){
    routes.title = 'Welcome to your webservice!';
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
  */
  
  return routes;
  
}

var JSONPWRAP = exports.JSONPWRAP = function(namespace, data) {
  return 'function ' + namespace + '() {\
    return "' + data + '"\
  }';
};