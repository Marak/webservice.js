var request = require('request');


function _request(options, callback) {
  var options = {};
  options.uri = 'http://localhost:8081/echo';
  options.method = 'GET'; 
  options.headers = {
   'Content-Type': 'application/json'
  };
  options.data = {};
  request(options, function (err, response, result) {
    if (err) { 
      return callback(err);
    }
    callback(null, result);
  });
}

_request({}, function(err, result){
  if (err) {
    console.log(err);
    return false;
  }
  console.log(result);
});