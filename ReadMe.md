# webservice.js - turn CommonJS modules into web-services
#### v0.1.1
webservice.js is a node.js module that allows developers to easily create web-services based on the exports of CommonJS modules

## usage

webservice.js currently has one method, createServer. createServer takes an object of labels and CommonJS modules. let's create a basic CommonJS module for this example.


### demoModule.js

    // demo module
    exports.hello = function(){
      console.log('hello world');
      return 'hello world';
    };

    exports.asyncHello = function(res, callback){
      setTimeout(function(){
        console.log('hello world');
        if(typeof callback == 'function'){
          // callback is going to return a value. if we wanted to continue the chain here, we could pass res
          var result = callback();
          res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(result));
        }
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

[http://localhost:8080/sys/puts/Hello%20World](http://localhost:8080/sys/puts?a=Hello%20World)

http://localhost:8080/demoModule/asyncHello/

[http://localhost:8080/fs/writeFile/bar.txt/lol](http://localhost:8080/fs/writeFile/bar.txt/lol)

http://localhost:8080/fs/writeFile/foo.txt/lol/binary


##todo

 - remove ability to perform anonymous callbacks (security issue)
 - add POST support

### author

Marak Squires