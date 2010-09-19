# webservice.js - turn CommonJS modules into web-services

webservice.js is a node.js module that allows developers to easily create web-services based on the exports of CommonJS modules.

## usage


### server.js

      var webservice = require('./lib/webservice'),
          fs         = require('fs'),
          sys        = require('sys'),
          demoModule = require('./demoModule');


      webservice.createServer({
        'demoModule': demoModule,
        'fs': fs,
        'sys': sys
      }).listen(8080);

### now try hitting up these urls

http://localhost:8080/demoModule/hello

http://localhost:8080/demoModule/asyncHello?fn=function(){return%20'hello';}

http://localhost:8080/fs/writeFile?filename=bar.txt&content=lol

http://localhost:8080/fs/writeFile?filename=foo.txt&content=lol&enc=binary&fn=function(err,rsp){console.log('lol%20file%20created');}
