// NOT IMPLEMENTED YET

var webservice = require('../../lib/webservice'),
    demoModule = require('../sample_modules/demoModule'),
    Users      = require('./models/User').Users,
    colors     = require('colors');


Users.on('init', function(err, User){

  Users.resource.all(function(err, results){
    //console.log(err, results);
  });
  webservice.createServer(Users.resource).listen(8080);
  
});

Users.init({ env: 'development' });
console.log(' > Resource based webservice started on port 8080'.cyan);  
console.log('This feature isn\'t really implemented yet, so don\'t expect it to work!'.red);