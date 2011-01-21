# warning - library is under active dev. docs and blog are currently out of sync, will be updating soon.

# webservice.js - turn node.js modules into web-services
#### v0.4.5
webservice.js is a somewhat opinionated node.js library that allows developers to easily create RESTFul web-services based on the exports of node.js modules. Having to deal with both implementing and consuming 100s of web-services over the past ten years, I've grown bitter of web-services with arbitrary restrictions, poor documentation, and piles of boiler-plate code. webservice.js tries to solve these problems by implementing RESTFul principals in a much more relaxed fashion. 

webservice.js also plays very nice with node's httpServer and other middleware frameworks ( such as Connect ).


## WEBSERVICE FEATURES

- Instantly create a RESTful web-service from a node.js module
- Built-in JSON-schema validation for incoming data provided via Resourcer
- Data can be posted to any webservice.js end-point as JSON, query string, or form data.
- By default, HTTP Verbs and Content-Type are not strictly enforced

## INTEGRATION FEATURES

- Regular node.js modules are automatically transformed into API methods for your web-service
- Can export as an httpServer request handler
- Can export an a httpServer instance
- Works as a middle-ware in Connect or stack

Regular JavaScript methods are automatically transformed into API methods for your web-service. Data can be posted to any webservice.js end-point as JSON, query string, or form data. By default, HTTP Verbs, Content-Type, and  are not strictly enforced. Content-type

## installation

### installing npm (node package manager)
<pre>
  curl http://npmjs.org/install.sh | sh
</pre>

### installing webservice.js
<pre>
  npm install webservice
</pre>

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

## Usage

## tests

tests are good. npm install vows, then run:

     vows tests/*


## author

Marak Squires