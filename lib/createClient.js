// TODO


var ws = require('./webservice'),
    http = require('http'),
    eyes = require('eyes');

exports.createClient = function( module ){

  var routes = ws.createMetaRoutes(module);

  //eyes.inspect(routes);
  var code = '';

  for(var method in module){
    
    if(typeof module[method] != 'function'){
      continue;
    }
    code += method;
    code += module[method];
    
    
  }
  
  return code;
  
};