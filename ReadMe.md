# webservice.js - turn node.js modules into web-services
#### v0.2.0
webservice.js is a node.js module that allows developers to easily create RESTFul web-services based on the exports of node.js modules

## installation

### installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### installing webservice.js
<pre>
  npm install webservice
</pre>

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
        callback(null, 'pong');
      }, 3000);

    }

now that we have created this module, we will create a server.js file. in this file we will require webservice and our demoModule.js. for fun, we are also going to expose the native fs and sys modules.

### server.js

      var webservice = require('webservice'),
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


now, you can navigate to any of the following pages to get html documentation.

 - [http://localhost:8080/demo](http://localhost:8080/demo)
 - [http://localhost:8080/fs](http://localhost:8080/fs)
 - [http://localhost:8080/sys](http://localhost:8080/sys)

you can also append ".json" to the end of any of these resources to get the documentation in JSON. 

 - [http://localhost:8080/demo.json](http://localhost:8080/demo.json)
 - [http://localhost:8080/fs.json](http://localhost:8080/fs.json)
 - [http://localhost:8080/sys.json](http://localhost:8080/sys.json)

### to invoke methods, you can try the following requests:


     curl http://localhost:8080/demo/echo/hello
     "hello"

     curl http://localhost:8080/sys/puts/hello
     (outputs "hello" to the server's console)

     curl http://localhost:8080/fs/readFile/server.js/async
     (returns contents of the server.js file)


     curl http://localhost:8080/fs/writeFile/bar.txt/foo/binary/async
     (waits for bar.txt file to create with "foo" as content)

#### POST

[http://localhost:8080/fs/writeFile](http://localhost:8080/fs/writeFile)

     {['foo.txt', 'content of file']}

[http://localhost:8080/demo/echo](http://localhost:8080/demo/echo)


     {['hello']}

## async web-service calls

all web-service calls are assumed to be synchronous by default. this means, that if you call a method from the web-service, it will return instantly. if the method you called required a callback, this callback will never fire. if you want to specify a method to be asyncronous, simply add "/async" as the last argument in your route.


####async method example

     GET /demo/ping

this will cause the web-service to respond immediately

     GET /demo/ping/async

this will cause the web-service to wait respond until the callback is fired


## tests

tests are good. npm install vows, then run:

     vows tests/*

## todo

- add better POST support. 
- add better content type / mime type handling

## author

Marak Squires