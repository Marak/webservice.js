// sugar syntax for vargs
var Args = require("vargs").Constructor;

// demo module
exports.echo = function(/* msg, callback */){
  
  var args = new(Args)(arguments);

  if(!args.length){
    args.callback("missing arguments");
  }

  args.callback(null, args.first);
  
};

exports.ping = function(/* callback */){

  var args = new(Args)(arguments);
  
  args.callback(null, 'pong');
  setTimeout(function(){
  }, 2000);

}