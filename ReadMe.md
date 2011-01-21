# warning - library is under active dev. docs and blog are currently out of sync, will be updating soon.

# webservice.js - turn node.js modules into web-services
#### v0.4.3
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

## FEATURES

- Creates RESTful web-services from node.js modules
- Can export an httpServer instance
- Works as a middle-ware in Connect or stack

## Setting up a webservice

### As a standalone httpServer

    var webservice = require('webservice'),
        demoModule = require('./demoModule');

    webservice.createServer(demoModule).listen(8080);

### Using Connect

    var connect    = require('connect'),
        server     = connect.createServer(),
        webservice = require('../../lib/webservice'),
        demoModule = require('../demoModule');


    server.use(connect.logger());

    server.use(webservice.createHandler(demoModule));

    server.listen(3000);

### Using stack

    var http = require('http');

    http.createServer(require('stack')(
      require('./webservice.stack')()
    )).listen(8080);



### The demo module

#### demoModule.js

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

## Usage

after starting up server.js, we can navigate to any of the following pages to get html documentation.

 - [http://localhost:8080/demo](http://localhost:8080/demo)
 - [http://localhost:8080/fs](http://localhost:8080/fs)
 - [http://localhost:8080/sys](http://localhost:8080/sys)

we can also append ".json" to the end of any of these resources to get the documentation in JSON. 

 - [http://localhost:8080/demo.json](http://localhost:8080/demo.json)
 - [http://localhost:8080/fs.json](http://localhost:8080/fs.json)
 - [http://localhost:8080/sys.json](http://localhost:8080/sys.json)

### invoking webservice methods

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


## tests

tests are good. npm install vows, then run:

     vows tests/*

## todo

- add better POST support. 
- add better content type / mime type handling
- add better HTTP verb support

## author

Marak Squires