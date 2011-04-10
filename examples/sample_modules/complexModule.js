// demo module
this.title = "Welcome to your webservice!";
this.name = "complex demo api module";
this.version = "0.1.0";
this.endpoint = "http://localhost:8080";

exports.echo = function(options, callback){
  callback(null, options.msg);
};
exports.echo.description = "this is the echo method, it echos back your msg";
exports.echo.schema = {
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
exports.ping.description = "this is the ping method, it pongs back after a 2 second delay";


exports.customEcho = function(options, callback){
  callback(null, options.msg);
};

// Important: we are over-riding the regex here
exports.customEcho.description = "this is the echo method, it echos back your msg";
exports.customEcho.schema = {
  msg: { 
    type: 'string',
    optional: false 
  }
};

exports.complexMethod = {
  description: "this is a complex method",
  level1: {
    foo: "bar",
    la: 4,
    description: "this is the level 1 method",
    level2: {
      hello2: function (options, callback){
        callback(null, 'hello2');
      },
      level3: {
        description: "this is the level 3 method",
        hello3: function (options, callback){
          callback(null, 'hello3');
        },
      },
    },
  }
};