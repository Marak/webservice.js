// demo module
this.title = "Welcome to your webservice!";
this.name = "demo api module";
this.version = "0.1.0";

exports.echo = function(options, callback){
  callback(null, options.msg);
};
exports.echo.docs = "this is the echo method, it echos back your msg";
exports.echo.options = {
  msg: { 
    type: 'string',
    optional: false 
  }
};

exports.ping = function(options, callback){

  setTimeout(function(){
    callback(null, 'pong');
  }, 2000);

}
exports.ping.docs = "this is the ping method, it pongs back after a 2 second delay";


exports.user = function(options, callback){
  
  
  switch(this.request.method){
    
    case 'GET':
      if(options.id){
        return callback(null, 'got resource for ' + options.id);
      }
      else{
        return callback(null, 'got all resource');
      }
    break;

    case 'POST':
      return callback(null, 'created the resource');
    break;

    case 'UPDATE':
      return callback(null, 'updated the resource');
    break;
    
    case 'DELETE':
      return callback(null, 'deleted the resource');
    break;
      
    
  }
  
};
exports.user.restful = true;
exports.user.options = {
	"name":{"type":"string"},
	"nickname":{"type":"string","optional":true},
	"url":{"type":"string","format":"url","optional":true},
	"email":{
		"type":"object",
		"properties":{
			"type":{"type":"string"},
			"value":{"type":"string","format":"email"}},
		"optional":true},
	"tel":{
		"type":"object",
		"properties":{
			"type":{"type":"string"},
			"value":{"type":"string","format":"phone"}},
		"optional":true}
	};
exports.user.docs = "user is a restful resource. its actions will depend on the type of http verb you specify.";
