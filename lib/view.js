/*** simple internal view server ( for documentation ) ***/

var traverse = require('traverse');

var renderRouter = exports.renderRouter = function(format, name, router, template, omitPreamble) {
    
    var endpoint = createEndpoint(router);

//    console.log(router.routes)

    /* 	edit (by rootnot)
     1. Now this function is called with response context (this refers to response object).
     2. Added inspection form with iframe containing output from called methods
     */
    if(format == 'json') {
        return JSON.stringify(items, true, 2);
    }
    if(format == 'html') {
        var html = '';

        html += '<h1>' + endpoint.title + '</h1>'
        html += '<h3>' + endpoint.name + '</h3>';
        html += 'Version <i>' + endpoint.version + '</i>';
        html += '<h3>Available Methods</h3>';

        var verbs = ['get', 'post', 'put', 'delete'],
        depth = 1;
        

        //
        // The visitor is applied once to every node.
        // Each node represents a route in the routing table
        //
        function visitor (node) {
          
          if (typeof node === 'function') {

            var link = this.path.join('/'),
                slug,
                desc,
                schema,
                metadata = node.data || {},
                label;

            slug = (node.slug || 'N/A').toString();
            
            //
            // If this is a HTTP verb
            //
            if (verbs.indexOf(this.key) !== -1) {
              link  = slug;
              label = this.key.toUpperCase() + ' ' + slug;
            }

            link = link.replace(/\:id/g, '123');

            desc = metadata.description || 'no description available';

            //label = label.replace('([\\w\\-\\.]+)', ':id')

            
            
            //
            // If the depth of this level is higher then the previous depth,
            // then we need to start a new level
            // 
            
            
            if (this.level > depth) {
              console.log('nest this item', this.level , slug, depth);
              html += ('</div></div></div>');
              //depth++;
            }
            
            
            
            html += ('<div class="member grad">');
              html += ('<div class="header">');
                html += ('<a href="' + link + '" target="_blank">' + label + '</a> <a href="#" class="toggle">Show</a>');
              html += ('</div>');
              html += ('<div class="allcontent">');
              html += ('<div class="content">');


            depth = this.level;
            
            
            // html += ('<div class="member grad"></div>');
            
            // html += ('<div class="sub header">' + desc + '</div>');
            
            
            /*
            
            //
            // Auto-generate the cURL examples
            //
            
            var sampleCurlArgs = '';
            var sampleCurlJSON = {};
            
            // parse arguments
            if(node.data && node.data.schema) {
                sampleCurlArgs = "?";
                html += ('<div class="content"><strong>arguments:</strong> <br/>');
                var s = node.data.schema;
                for(var arg in s) {
                    // only generate sample curl syntax for required properties
                    if(s[arg].optional != true) {
                        sampleCurlArgs += (arg + "=val&");
                        sampleCurlJSON[arg] = "val";
                    }

                    html += (arg + ' ' + JSON.stringify(s[arg]) + '<br/>');
                }
                sampleCurlArgs = sampleCurlArgs.substr(0, sampleCurlArgs.length - 1);
                html += ('</div>');
            }
            
            
            var exampleSlug = slug.replace(/\:id/g, '123');
            
            // GET
            html += ('<div class="content">');
            html += ('<span class="verb">GET</span> <span class="url">' + node.slug + '<br>');
            html += ('<span class="curl">curl -X GET ' + endpoint.uri + exampleSlug + sampleCurlArgs + '</span><br/>');
            //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
            html += ('</span></div>');

            // POST
            html += ('<div class="content">');
            html += ('<span class="verb">POST</span> <span class="url">/' + method + '<br>');
            html += ('<span class="curl">curl -X POST -d ""</span><br/>');
            html += ('You can also post JSON...<br/>');
            html += ('<span class="curl">curl -X POST -d ""</span><br/>');

*/
            //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
            
            /*
            //
            // Auto-generate the submission form
            //
            html += ('<div class="form">') + '\n';
            html += ('<form method="get" action="' + endpoint.uri + '/' + method + '" target="' + method + '-output">') + '\n';
            for(var arg in s) {
                html += ('<div class="field">') + '\n';
                html += ('<label>' + arg + ': </label>') + '\n';
                html += ('<input type="text" id="' + method + '-' + arg + '" name="' + arg + '">') + '\n';
                html += ('</div>') + '\n';
            }
            
            html += ('<div class="button"><input type="submit"/></div>') + '\n';
            html += ('</form>') + '\n';
            html += ('<iframe class="response" name="' + method + '-output"> </iframe>') + '\n';
            html += ('</div>');
            html += ('<br/><span class="content">JSONP support is currently enabled. To use JSONP, append "&callback=mymethod" to any GET request</span>') + '\n';
            html += ('<br/><br/>') + '\n';
            html += ('</div>') + '\n';
            */
            
          }

        }

        //
        // Traverse the routing object depth-first. 
        // For every node, apply the visitor
        //
        traverse(endpoint.routes).forEach(visitor);

        return template.replace('{{body}}', html); // fake mustache

        if(!omitPreamble) {
        }
        var baseUrl = endpoint.uri || '';
        // iterate through each top-level method in the module and created a link
        for(var method in items.methods) {
            var m = items.methods[method];
            if(typeof m == 'string') {
                continue;
            }
            // if the module is private, ignore it
            if(m.private === true) {
                continue;
            }

            var path = baseUrl + "/" + method;

            //var path = this.url +  method;
            if(typeof m.regex !== 'undefined') {
                path = m.regex;
            }
            html += ('<div class="member grad">');
            html += ('<div class="header"><a href="' + path + '" target="_blank">' + path + '</a> <a href="#" class="toggle">Show</a></div>');

            html += ('<div class="allcontent">');
            html += ('<div class="content">');
            html += ('<div class="member grad">');
            html += ('<div class="sub header">' + m.description + '</div>');

            var sampleCurlArgs = '', sampleCurlJSON = {};

            // parse arguments
            if(m.schema) {

                sampleCurlArgs = "?";
                html += ('<div class="content"><strong>arguments:</strong> <br/>');
                var s = m.schema;
                for(var arg in s) {

                    // only generate sample curl syntax for required properties
                    if(s[arg].optional != true) {
                        sampleCurlArgs += (arg + "=val&");
                        sampleCurlJSON[arg] = "val";
                    }

                    html += (arg + ' ' + JSON.stringify(s[arg]) + '<br/>');
                }
                sampleCurlArgs = sampleCurlArgs.substr(0, sampleCurlArgs.length - 1);
                html += ('</div>');
            }

            // GET
            html += ('<div class="content">');
            html += ('<span class="verb">GET</span> <span class="url">/' + method + '<br>');
            html += ('<span class="curl">curl -X GET ' + endpoint.uri + '/' + method + sampleCurlArgs + '</span><br/>');
            //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
            html += ('</span></div>');

            // POST
            html += ('<div class="content">');
            html += ('<span class="verb">POST</span> <span class="url">/' + method + '<br>');
            html += ('<span class="curl">curl -X POST -d "' + sampleCurlArgs.substr(1, sampleCurlArgs.length) + '" ' + endpoint.uri + '/' + method + '</span><br/>');
            html += ('You can also post JSON...<br/>');
            html += ('<span class="curl">curl -X POST -d "' + JSON.stringify(sampleCurlJSON) + '" ' + endpoint.uri + '/' + method + '</span><br/>');

            //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
            html += ('</span></div>');
            html += ('</div></div>');

            // form
            html += ('<div class="form">') + '\n';
            html += ('<form method="get" action="' + endpoint.uri + '/' + method + '" target="' + method + '-output">') + '\n';
            for(var arg in s) {
                html += ('<div class="field">') + '\n';
                html += ('<label>' + arg + ': </label>') + '\n';
                html += ('<input type="text" id="' + method + '-' + arg + '" name="' + arg + '">') + '\n';
                html += ('</div>') + '\n';
            }
            html += ('<div class="button"><input type="submit"/></div>') + '\n';
            html += ('</form>') + '\n';
            html += ('<iframe class="response" name="' + method + '-output"> </iframe>') + '\n';
            html += ('</div>');

            html += ('<br/><span class="content">JSONP support is currently enabled. To use JSONP, append "&callback=mymethod" to any GET request</span>') + '\n';
            html += ('<br/><br/>') + '\n';

            html += ('</div>') + '\n';

            if(typeof m.methods === "object" || typeof m.methods === "function") {
                html += renderRouter(format, 'a', m.methods, '{{body}}', true);
                if(Object.keys(m.methods).length) {
                }
            }

            html += ('</div>') + '\n';

            // + '/' + method + '</a> <i>' + (items[method].description || '') + ' </i>' + '</li>');
        }

        if(!omitPreamble) {
            html += '<h4>This page was auto-generated by <a href="http://github.com/marak/webservice.js" target="_blank">webservice.js</a></h4>'
        }
        return template.replace('{{body}}', html); // fake mustache
    }
    return 'error';
}

/*** simple html renderer for validator errors ***/
var renderValidatorErrors = exports.renderValidatorErrors = function(errors) {

    var html = '<h1>error(s) have occurred with your request!</h1>';

    errors.forEach(function(v, i) {

        html += "Argument Name:" + v.property + '<br/>';
        html += "Value:" + v.actual + '<br/>';
        html += "Expected:" + v.expected + '<br/>';
        //html += "Message:" + v.message + '<br/><br/>';
    });

    return html;
}


// create a JSON structure representing a module and its associated method names
// this is used to help with documentation generation
var createEndpoint = exports.createEndpoint = function(router) {
  
    var endpoint = {};
    
    endpoint.routes = router.routes;
    endpoint.title = "my webservice endpoint";
    endpoint.name = "demo api module";
    endpoint.version = "0.1.0";
    endpoint.uri = "http://localhost:8080";
    
    return endpoint;
}
