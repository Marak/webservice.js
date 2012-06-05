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

var hello = function (options, callback){
  callback(null, 'hello');
}

hello.description = "this is the hello method, calls back with a hello"

exports.complexModule = {
  description: "this is a complex module",
  module: 'complexModule',
  compy: hello
}


exports.nestedComplexModule = {
  description: "this is a highly nested complex module",
  module: 'nestedComplexModule',
  level1: {
    foo: "bar",
    la: 4,
    description: "this is the level 1 module",
    module: 'level1',
    level2: {
      description: "this is the level 2 module",
      module: 'level2',
      hello2: hello,
      level3: {
        module: 'level3',
        description: "this is the level 3 module",
        hello3: hello
      },
    },
  }
};