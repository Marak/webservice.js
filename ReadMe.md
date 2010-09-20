# webservice.js - turn CommonJS modules into web-services
#### v0.1.0
webservice.js is a node.js module that allows developers to easily create web-services based on the exports of CommonJS modules

## usage

webservice.js current has one method, createServer. createServer takes an object of labels and CommonJS modules. let's create a basic CommonJS module for this example.


### demoModule.js

      // dummy module
      exports.hello = function(){
        return 'hello world';
      };

      exports.asyncHello = function(callback){
        setTimeout(function(){
          callback();
        }, 3000);
      }


now that we have created this module, we will create a server.js file. in this file we will require webservice and our demoModule.js. we are also going to expose the native fs and sys module in our web-service.

### server.js

      var webservice = require('./lib/webservice'),
          demoModule = require('./demoModule'),
          fs         = require('fs'),
          sys        = require('sys');


      webservice.createServer({
        'demoModule': demoModule,
        'fs': fs,
        'sys': sys
      }).listen(8080);


this will create a web-service that will serve the exports of demoModule, fs, and sys.

        node server.js


### there is now a web-service running @ http://localhost:8080/ with the following resources:

 - /demoModule
 - /fs
 - /sys

you can navigate to any of these pages and it will return documentation for that module.  

### to try and invoke methods, you can GET the following urls:

[http://localhost:8080/demoModule/hello](http://localhost:8080/demoModule/hello)

[http://localhost:8080/sys/puts?a=Hello%20World](http://localhost:8080/sys/puts?a=Hello%20World)

http://localhost:8080/demoModule/asyncHello?fn=function(){return%20'hello';}

[http://localhost:8080/fs/writeFile?filename=bar.txt&content=lol](http://localhost:8080/fs/writeFile?filename=bar.txt&content=lol)

http://localhost:8080/fs/writeFile?filename=foo.txt&content=lol&enc=binary&fn=function(err,rsp){console.log('lol%20file%20created');}


##todo

 - fix async callbacks so they actually return data to the browser
 - add POST support

### author

Marak Squires