// demo module
exports.echo = function(options, callback){

  if(!options.msg){
    callback("missing arguments");
  }

  callback(null, options.msg);
  
};
exports.echo.docs = "this is the echo method, it echos back your msg";
exports.echo.options = {
  msg: { 
    type: 'string',
    optional: false 
  },
};

exports.ping = function(options, callback){

  callback(null, 'pong');
  setTimeout(function(){
  }, 2000);

}
exports.ping.docs = "this is the ping method, it pongs back."