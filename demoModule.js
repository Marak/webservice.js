// demo module
exports.echo = function(msg){
  return msg;
};

exports.ping = function(callback){

  if(typeof callback !== 'function'){
    return 'pong, with no callback';
  }
 
  setTimeout(function(){
    callback('pong');
  }, 2000);

}