
// demo module
exports.echo = function(msg){

  // this.verbs defaults to: ['GET','POST','PUT','DELETE']
  // optionally we can restrict verbs
  this.verbs = ['GET', 'POST'];
  
  // this.docs is used to store a quick description of the method 
  // it's optional
  this.docs = "this is the friggin echo method";
  
  this.callback(null, msg);
};


exports.private_echo = function(msg){

  // this.private defaults to: false
  // optionally we can restrict methods to be "private"
  // right now, a "private" method still exists to the public, but is hidden from documentation
  this.private = true;

  // this.docs is used to store a quick description of the method 
  // it's optional
  this.docs = "this is kinda private, not really.";
  
  this.callback(null, msg);
  
};

exports.ping = function(){

  this.docs = "this is the ping method. it pongs back at you!";
  this.callback(null, 'pong');
  setTimeout(function(){
  }, 2000);

}