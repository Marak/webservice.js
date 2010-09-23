var vows       = require('vows'),
    assert     = require('assert'),
    request    = require('request'),
    webservice = require('../lib/webservice'),
    demoModule = require('../demoModule'),
    fs         = require('fs'),
    sys        = require('sys');

var port = 8080;

var ws = webservice.createServer({
            'demoModule': demoModule,
            'fs': fs,
            'sys': sys,
            'assert': assert
          }).listen(8080);


vows.describe('webservice/').addBatch({
  "When using webservice.CreateServer with demoModule, fs, and sys": {
    "a request against /": {
      topic: function() {
        var options = {
          uri: 'http://localhost:8080/'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      },
      "and should return JSON representing web-service": function(error, response, body){
        var result = JSON.parse(body); 
        assert.isObject(result);
      }
    },
    "a request against /demoModule": {
      topic: function() {
        var options = {
          uri: 'http://localhost:8080/demoModule'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      }
    },
    "a request against /sys": {
      topic: function() {
        var options = {
          uri: 'http://localhost:8080/sys'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      }
    },
    "a request against /fs": {
      topic: function() {
        var options = {
          uri: 'http://localhost:8080/fs'
        };
        
        request(options, this.callback)
      },
      "should respond with 200": function (error, response, body) {
        assert.equal(response.statusCode, 200);
      }
    }
    
  }
}).export(module);