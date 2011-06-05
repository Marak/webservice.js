var vows       = require('vows'),
    assert     = require('assert'),
    request    = require('request'),
    webservice = require('../lib/webservice'),
    demoModule = require('../examples/demoModule'),
    fs         = require('fs'),
    sys        = require('sys'),
    eyes       = require('eyes');


vows.describe('webservice/').addBatch({
  "When using webservice with test configuration": {
    "webservice.createClient(demoModule)": {
      topic: function() {
        return webservice.createClient(demoModule);
      },
      "return with a string representation of a node.js client api wrapper": function (clientCode) {
        assert.equal(false, 'TODO: Implement');
      }    
    }
  }
}).export(module);