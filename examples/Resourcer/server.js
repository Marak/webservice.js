// NOT REALLY IMPLEMENTED YET

var webservice = require('../../lib/webservice'),
    demoModule = require('../demoModule'),
    fs         = require('fs'),
    sys        = require('sys'),
    eyes       = require('eyes'),
    Users      = require('./models/User').Users;


Users.on('init', function(err, User){

  Users.resource.all(function(err, results){
    console.log(err, results);
  });
  webservice.createServer(Users.resource).listen(8080);
  
});

Users.init({ env: 'development' });
console.log(' > json webservice started on port 8080');  
