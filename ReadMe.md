# webservice.js - turn node.js modules into web-services
#### v0.5.0
webservice.js is a somewhat opinionated node.js library that allows developers to easily create RESTFul web-services based on the exports of node.js modules. Having to deal with both implementing and consuming 100s of web-services over the past ten years, I've grown bitter of web-services with arbitrary restrictions, poor documentation, and piles of boiler-plate code. webservice.js tries to solve these problems by implementing RESTFul principals in a much more relaxed fashion.

webservice.js also plays very nice with node's httpServer and other middleware frameworks ( such as Connect ).


## WEBSERVICE FEATURES

- Instantly create a RESTful web-service from a node.js module
- Built-in JSON-schema validation for incoming data provided via Resourcer
- Data can be posted to any webservice.js end-point as JSON, query string, or form data.
- By default, HTTP Verbs and Content-Type are not strictly enforced
- Built-in JSONP support

## INTEGRATION FEATURES

- Regular node.js modules are automatically transformed into API methods for your web-service
- Can export as an httpServer request handler
- Can export as an httpServer instance
- Works as a middleware in Connect or stack
- Can expose .coffee files as web-services
- Auto-documentation of all your web-services

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

### As a standalone webservice server

    var webservice = require('../lib/webservice'),
        demoModule = require('./modules/demoModule'),
        colors     = require('colors');

    webservice.createServer(demoModule).listen(8080);

    console.log(' > stand-alone json webservice started on port 8080'.cyan);  


### As a handler for http.Server

    var http       = require('http'),
        ws         = require('../../lib/webservice'),
        demoModule = require('../sample_modules/demoModule'),
        colors     = require('colors'),
        handler    = ws.createHandler(demoModule);

    http.createServer(handler).listen(8080);

    console.log(' > json webservice started on port 8080'.cyan);  



### Using Connect

    var connect    = require('connect'),
        server     = connect.createServer(),
        webservice = require('../../lib/webservice'),
        demoModule = require('../sample_modules/demoModule'),
        colors     = require('colors');


    server.use(connect.logger());

    server.use(webservice.createHandler(demoModule));

    server.listen(3000);

    console.log('Connect server running on port 3000 with webservice.js'.cyan);

### Using stack

    var http   = require('http'),
        colors = require('colors');

    http.createServer(require('stack')(
      require('./webservice.stack')()
    )).listen(8080);

    console.log(' > Stack server with webservice.js middleware started on port 8080'.cyan);

### Using Coffeescript

Using Coffeescript with webservice.js is very simple. There are no changes that need to be made for Coffeescript to work, just follow the example @ [https://github.com/Marak/webservice.js/blob/master/examples/Coffeescript/server.coffee](https://github.com/Marak/webservice.js/blob/master/examples/Coffeescript/server.coffee)

### demoModule.js

    this.title = "Welcome to your webservice!";
    this.name = "demo api module";
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


## Usage

Once you have started up your web-service, visit http://localhost:8080/docs


<img src="https://github.com/Marak/webservice.js/raw/master/tests/wsscreenshot.png"/>

## tests

tests are good. npm install vows, then run:

     vows test/*


## author

Marak Squires 