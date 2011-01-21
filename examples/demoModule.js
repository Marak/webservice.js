// sugar syntax for vargs
var Args = require("vargs").Constructor;

// demo module
exports.echo = function(options, callback){
  var args = new(Args)(arguments);

  if(!args.length){
    args.callback("missing arguments");
  }

  args.callback(null, options.msg);
  
};

exports.ping = function(callback){

  var args = new(Args)(arguments);
  
  args.callback(null, 'pong');
  setTimeout(function(){
  }, 2000);

}