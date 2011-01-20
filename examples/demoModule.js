
// demo module
exports.echo = function(msg){

  // this.verbs defaults to: ['GET','POST','PUT','DELETE']
  // optionally we can restrict verbs
  this.verbs = ['GET', 'POST'];
  
  // this.private defaults to: false
  // optionally we can restrict methods to be "private"
  this.private = false;

  // this.docs is used to store a quick description of the method 
  // it's optional
  this.docs = "this is the friggin echo method";
  
  return msg;
};


exports.private_echo = function(msg){

  // this.verbs defaults to: ['GET','POST','PUT','DELETE']
  // optionally we can restrict verbs
  this.verbs = ['GET', 'POST'];
  
  // this.private defaults to: false
  // optionally we can restrict methods to be "private"
  this.private = true;

  // this.docs is used to store a quick description of the method 
  // it's optional
  this.docs = "this is the friggin echo method";
  
  return msg;
};

exports.ping = function(callback){

  this.docs = "this is the ping method. it pongs back at you!";

  if(typeof callback !== 'function'){
    return 'pong, with no callback';
  }
 
  setTimeout(function(){
    callback(null, 'pong');
  }, 2000);

}