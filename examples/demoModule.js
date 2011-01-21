// demo module
exports.echo = function(options, callback){

  if(!options.msg){
    callback("missing arguments");
  }

  callback(null, options.msg);
  
};

exports.ping = function(options, callback){

  callback(null, 'pong');
  setTimeout(function(){
  }, 2000);

}