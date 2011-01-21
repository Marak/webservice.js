// demo module

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
exports.ping.docs = "this is the ping method, it pongs back.";


exports.signup = function(options, callback){
  
};

exports.signup.options = {
  firstname: { 
    type: 'string',
    optional: false 
  },
  lastname: { 
    type: 'string',
    optional: false 
  },
  email: { 
    type: 'string',
    optional: false 
  }
  
  
};