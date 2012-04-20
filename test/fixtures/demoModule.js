
// demo module

exports.echo = function(options, callback) {
    callback(null, options.msg);
};
exports.echo.description = "this is the echo method, it echos back your msg";
exports.echo.schema = {
    msg: {
        type: 'string',
        optional: false,
        message: "msg variable is required"
    }
};

exports.ping = function(options, callback) {
    setTimeout(function() {
        callback(null, 'pong');
    }, 2000);
}
exports.ping.description = "this is the ping method, it pongs back after a 2 second delay";

/*
exports.customPattern = function(options, callback) {
    callback(null, options);
};

exports.customPattern.pattern = /(customPattern)\/(secondLevel)\/([^\/]*?)\/?/; // e.g. /customPattern/secondLevel/12345/

exports.customPattern.description = "this is the custom pattern method";
exports.customPattern.schema = {
    msg: {
        type: 'string',
        optional: false,
        message: "msg variable is required"
    }
};

*/




//
// Here are some RESTFul mapping
//

var turtle = {};

exports.turtle = turtle;

// GET /
turtle.list = function () {
  console.log('show all turtles.')
};

// POST /
turtle.create = function () {
  console.log('create a new turtle.')
};

// GET /:id
turtle.show = function () {
  console.log('get a turtle by :id')
};

// PUT /:id
turtle.update = function () {
  console.log('update a turtle by :id')
  
};

// DELETE /:id
turtle.destroy = function () {
  console.log('destroy a turtle by :id')
};
