var vows       = require('vows'),
    assert     = require('assert'),
    request    = require('request'),
    webservice = require('../lib/webservice'),
    demoModule = require('../demoModule'),
    fs         = require('fs'),
    sys        = require('sys'),
    eyes       = require('eyes');

var port = 8080,
    host  = 'http://localhost',
    testConfig = {
      'demo': demoModule
    };

var ws = webservice.createServer(testConfig);
ws.listen(port);

vows.describe('webservice/').addBatch({
  "When using webservice with test configuration": {
    "a request against /": {
      topic: function() {
        var options = {
          uri: host + ':' + port
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "and should return html view representing web-service": function(error, response, body){
        assert.equal (body[0], '<');
      }
    },
    "a request against /demo": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with an html view of the module exports": function (error, response, body) {
        assert.equal (body[0], '<');
      }
    },
    "a request against /demo.json": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo.json'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with a JSON view of the module exports": function (error, response, body) {
        var result = JSON.parse(body); 
        assert.isObject(result);
        assert.isUndefined(result.error);
      }
    },
    "a GET request against /demo/echo": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo/echo/',
          method: 'GET'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      }
    },
    "a GET request against /demo/echo/ohai": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo/echo/ohai/',
          method: 'GET'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with ohai": function (error, response, body) {
        var result = JSON.parse(body); 
        assert.equal(result, 'ohai');
      }
    },
    "a POST request to /demo/echo": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo/echo/',
          method: 'POST',
          body: JSON.stringify(["ohai", "helo"])
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with ohai": function (error, response, body) {
        assert.equal(body, '"ohai"');
      }
    },
    "a GET request against /demo/ping (no callback)": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo/ping/',
          method: 'GET'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with pong instantly (no callback)": function (error, response, body) {
        var result = JSON.parse(body); 
        assert.equal(result, 'pong, with no callback');
      }
    },
    "a GET request against /demo/ping/async/": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo/ping/async/',
          method: 'GET'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with pong": function (error, response, body) {
        var result = JSON.parse(body); 
        assert.equal(result, 'pong');
      }
    },
    "a POST request against /demo/ping/ (no callback)": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo/ping/',
          method: 'POST'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with pong instantly (no callback)": function (error, response, body) {
        var result = JSON.parse(body); 
        assert.equal(result, 'pong, with no callback');
      }
    },
    "a POST request against /demo/ping/async": {
      topic: function() {
        var options = {
          uri: host + ':' + port + '/demo/ping/async',
          method: 'POST'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "should respond with pong": function (error, response, body) {
        var result = JSON.parse(body); 
        assert.equal(result, 'pong');
      }
    }
    
  }
}).addBatch({
    "when the tests are over": {
      topic: function () {
        return 'you have to kill tests manually, sorry';
      },
      "the web-service server should be killed": function (topic) {
        assert.isTrue(true);
        // TODO : fix api so we can do this
        ws.close();
      }  
    }
}).export(module);