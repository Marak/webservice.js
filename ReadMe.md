# webservice.js - turn node.js modules into web-services
#### v0.2.0
webservice.js is a node.js module that allows developers to easily create web-services based on the exports of other node.js modules

## usage

webservice.js currently has one method, createServer. createServer takes an object of labels and node modules and starts up a new web-service. 

to start, let's create a basic node module


### demoModule.js

    exports.echo = function(msg){
      return msg;
    };

    exports.ping = function(callback){

      if(typeof callback !== 'function'){
        return 'pong, with no callback';
      }
 
      setTimeout(function(){
        callback('pong');
      }, 3000);

    }

now that we have created this module, we will create a server.js file. in this file we will require webservice and our demoModule.js. for fun, we are also going to expose the native fs and sys modules.

### server.js

      var webservice = require('./lib/webservice'),
          demoModule = require('./demoModule'),
          fs         = require('fs'),
          sys        = require('sys');


      webservice.createServer({
        'demo': demoModule,
        'fs': fs,
        'sys': sys
      }).listen(8080);


to start up the server, run: 

        node server.js


### there is now a web-service running with the following resources:

 - /demo
 - /fs
 - /sys

you can navigate to any of these pages and it will return documentation for that module.  


### to invoke methods, you can try the following requests:

#### GET

[http://localhost:8080/demo/echo/hello](http://localhost:8080/demo/echo/hello)

[http://localhost:8080/sys/puts/hello](http://localhost:8080/sys/puts/hello)

[http://localhost:8080/fs/readFile/server.js/async](http://localhost:8080/fs/readFile/server.js/async)

[http://localhost:8080/fs/writeFile/bar.txt/lol](http://localhost:8080/fs/writeFile/bar.txt/lol)

#### POST

[http://localhost:8080/fs/writeFile](http://localhost:8080/fs/writeFile)

     {['foo.txt', 'content of file']}

[http://localhost:8080/demo/echo](http://localhost:8080/demo/echo)


     {['hello']}

## async web-service calls

all web-service calls are assumed to be synchronous by default. this means, that if you call a method from the web-service, it will return instantly. if the method you called required a callback, this callback will never fire. the browser will return a blank screen. if you want to specify a method to be asyncronous, simply add "/async" as the last argument in your route.


####async method example

     GET /demo/ping

this will cause the web-service to respond immediately

     GET /demo/ping/async

this will cause the web-service to wait respond until the callback is fired


## tests

tests are good. npm install vows, then run:

     vows tests/*



## author

Marak Squires