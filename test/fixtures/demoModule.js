
// demo module
this.title = "Welcome to your webservice!";
this.name = "demo api module";
this.version = "0.1.0";
this.endpoint = "http://localhost:8080";

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

exports.filteredecho = function(options, callback) {
    callback(null, 'The filter did not work');
}

exports._filter = function(request, body, callback) {

    // Do some filtering on the request and body
    if(request.url.pathname == '/filteredecho') {
        callback(new journey.NotAuthorized('Not Authorized'));
        return;
    }

    // Otherwise return Ok.
    callback(null);
}
