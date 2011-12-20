var ws = require('./webservice'), fs = require('fs'), journey = require('journey'), revalidator = require('revalidator');

var http = require('http');

//
//  Returns a Journey router
//

var createRouter = exports.createRouter = function createRouter(module, options) {

    var template = fs.readFileSync(__dirname + '/views/home.html');

    var routes = createMetaRoutes(module);

    // create a router object with an associated routing table
    var router = new (journey.Router)({ strict: false, api: "basic", strictUrls: false });

    if(options.bindroot !== false) {
        router.root.bind(function(res) {
            res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes.call(res, 'html', '', routes, template.toString()));
        });
    }

    // returns the docs of the API
    router.get('/docs').bind(function(res) {
        res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes.call(res, 'html', '', routes, template.toString()));
    });

    // returns the docs of the API
    router.get('/docs.json').bind(function(res) {
        res.send(200, {'Content-Type': 'text/html'}, ws.view.renderRoutes.call(res, 'html', '', routes, JSON.stringify(routes)));
    });

    // returns the version of the API
    router.get('/version').bind(function(res) {
        res.send(200, {'Content-Type': 'text/html'}, { version: journey.version.join('.') });
    });

    // extend the Journey router with our generated routes based on the module
    _extendRouter(router, module, options);

    return router;

}

function _extendRouter(map, module, options) {

    var filter = typeof module._filter == 'function' ? module._filter : null;

    // iterate through each top-level method in the module and create a route for it in journey
    for(var method in module) {

        if(typeof module[method] != 'function') {
            continue;
        }

        var journeyHandler = _createJourneyHandler(module, method, options);

        // hard-coded for one additional layer of restful methods
        for(var p in module[method]) {
            if(typeof module[method][p] == "function") {
                var a = new RegExp('\/' + method + '\/([\w|\-]+)');
                if(filter) {
                    map.route(a).filter(filter).bind(journeyHandler);
                } else {
                    map.route(a).bind(journeyHandler);

                }
            }
        }

        // we should only have one handler being bound, this is a regex bug
        var regexes = [];

        // If we have specified a pattern in the module, use that
        if(module[method].pattern) {
            regexes.push(module[method].pattern);
        }

        // If there are more regexes in .patterns, add them too
        if(module[method].patterns && module[method].patterns.length) {
            regexes = regexes.concat(module[method].patterns);
        }

        // fall back to default patterns if there are none specified
        if(!regexes.length) {
            regexes.push(new RegExp('\/(' + method + ')\/([^\/]*?)')); // Default regex e.g /(resource)/(id)/?param=123
            regexes.push(new RegExp('\/(' + method + ')')); // Regex with no id e.g. /(resource)/?param=123
        }

        // Now bind them to the handler
        for(var i = 0; i < regexes.length; i++) {
            if(filter) {
                map.route(regexes[i]).filter(filter).bind(journeyHandler);
            } else {
                map.route(regexes[i]).bind(journeyHandler);
            }
        }
    }
}

function _createJourneyHandler(module, method, options) {

    var handler = function(res, resource, id, params) {
        // For call /echo/12345/?msg=hello with 1x capture groups set up Regex: /echo\/([^/]*?)/
        // The params we get in will go:
        // 0 - response mock
        // 1 - resource e.g. echo (first capture group)
        // 2 - id (second capture group)
        // If there are more capture groups, they will be inserted before the params
        // 3 - paramaters Object {msg: 'hello'}

        var args = Array.prototype.slice.call(arguments);

        var params = args[args.length - 1]; // params will always be the last argument

        var method_options = params || {}, self = this;

        var captures = args.slice(1, -1); // get 1 through last but one

        // Expose the path parts so the handler can use them
        method_options._captures = captures;

        // Alias the first part of the path to resource
        if(captures.length > 0) {
            method_options._resource = captures[0]; // underscore so we don't conflict (hopefully)
        }

        // And do the same with id
        if(captures.length > 1) {
            if(captures[1] !== '') {
                method_options._id = captures[1]; // underscore so we don't conflict (hopefully)
            }
        }

        // If we have e.g. /echo/?msg=3 then there will be 2x captures. Kill off the empty value
        if(captures.length && captures[captures.length - 1] === '') {
            captures.pop();
        }

        // Pull in parameters from a JSON POST body
        try {
            var posted = JSON.parse(this.request.body);
            for(var p in posted) {
                if(posted[p].length) {
                    method_options[p] = posted[p];
                }
            }
        } catch(err) {
        }

        // bind all createHandler options to each argument
        for(var p in options) {
            method_options[p] = options[p];
        }

        module[method].request = this.request;
        module[method].res = res;

        self.request.params = [];
        self.request.params.push(method_options);

        var callback = _createModuleCallback(self, res);

        // push callback into arguments array
        self.request.params.push(callback);

        // before we attempt to fire the API method, lets see if there is any validation available

        try {

            // if there is no validation, fire the method regardless of arguments
            if(typeof module[method].schema == 'undefined') {
                // fire the method with new arguments
                module[method].apply(this, self.request.params);
                return;
            }

            // if the method is "restful" we will only perform validation on POST and PUT requests
            if((module[method].restful == true && self.request.method == "GET") || self.request.method == "DELETE") {
                // fire the method with new arguments
                module[method].apply(this, self.request.params);
                return;
            }

            // check if all required options were passed before executing the method
            var validate = revalidator.validate(self.request.params[0], {
                properties: module[method].schema
            });
            if(!validate.valid) {
                return callback(validate.errors);
            } else {
                module[method].apply(this, self.request.params);
            }

        } catch(err) {

            // we had a run-time error, pass the error forward on the callback chain
            callback(err);
        }
    };

    return handler;
}

function _createModuleCallback(requestHandler, res) {
    // callback that will be sent as argument to our module's method
    return function(err, result, response) {
        try {

            // mock out a response object
            if(typeof response == 'undefined') {
                var response = {};
            }

            result = result || {};

            // give it some defaults
            response.statusCode = response.statusCode || 200;

            // do some magic to determine what the Content-Type should be.

            var contentType = response.contentType || "application/json";

            if(typeof requestHandler.request.headers['content-type'] != 'undefined') {
                contentType = requestHandler.request.headers['content-type'];
            }

            if(err) {
                response.statusCode = 500;
                var html = '';
                // let's assume it's a validator error if its an array
                if(err instanceof Array) {
                    html = ws.view.renderValidatorErrors(err);
                    contentType = 'text/html';
                } else {
                    html = err;
                    html = JSON.stringify(err);
                    contentType = "application/json";
                }

                res.send(response.statusCode, {'Content-Type': contentType}, html);
            } else {
                result = result || '';
                if(typeof result != 'string' && !Buffer.isBuffer(result)) {
                    result = JSON.stringify(result);
                }

                // If "callback" is one of the incoming http params, then we are performing a JSONP request
                // wrap it up in a JSONP env
                if(requestHandler.request.params[0].callback) {
                    result = JSONPWRAP(requestHandler.request.params[0].callback, result);
                }
                res.send(response.statusCode, {'Content-Type': contentType}, result);
            }

        } catch(err) {
            console.log(err);
        }

    };

}

// create a JSON structure representing a module and its associated method names
// this is used to help with documentation generation
var createMetaRoutes = exports.createMetaRoutes = function(module, routes) {
    routes = routes || {};
    for(var method in module) {
        switch(typeof module[method]) {
            case 'function':
                routes.methods = routes.methods || {};
                try {
                    var f = module[method];
                    if(Object.keys(f).length) {
                        routes.methods[method] = {};
                    }
                    for(var p in f) {
                        routes.methods[method][p] = f[p];
                    }
                } catch(err) {
                    console.log(err);
                }
                break;
            case 'object':
                // Determine if we have a null object or not
                if(Object.keys(module[method]).length) {
                    routes.methods = routes.methods || {};
                    routes.methods[method] = createMetaRoutes(module[method], routes.methods[method]);
                }
                break;
            default:
                routes[method] = module[method];
                break;
        }
    }
    return routes;

}

var JSONPWRAP = exports.JSONPWRAP = function(namespace, data) {
    return 'function ' + namespace + '() {\
    return "' + data + '"\
  }';
};