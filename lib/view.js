
/*** simple internal view server ( for documentation ) ***/

var renderHtml = function( name, items, template, cb) {

  var fs    = require('fs'),
      jsdom = require('jsdom');

  var welder = {};

  jsdom.env(
    __dirname + '/views/info.html', 
    [__dirname + '/views/jquery.min.js', __dirname + '/views/weld.min.js'],
    function(errors, window) {
      
      var module_html = '';

      var info = [ { title: items.title,  name: items.name, version: items.version } ];
      window.weld(window.$('#info')[0], info);
      
      module_html += window.$('#info-weld').html();
    
      function welder(items) { 
        
        var html = '';
        
        // iterate through each top-level method in the module and created a link
        for(var method in items.methods) {
           var m = items.methods[method];
           if(typeof m == 'string'){
             continue;
           }
           
           if(m.module == undefined) {
           
             // if the module is private, ignore it
             if(m.private === true) {
               continue;
             }

             var path = "/" + method;
             if(typeof m.regex !== 'undefined') {
              path = m.regex;
             }

             var details = [ { path: path } ];
          

             window.weld(window.$('.details')[0], details, { map: function(parent, element, key, val) { 
                if(key == 'path') {
                  window.$(element).attr('href', val);
                }
               }
             });
           
             var description = [ { description: m.description } ];

             window.weld(window.$('.method')[0], description);
           
             var arguments = [];

             var sampleCurlArgs = '', sampleCurlJSON = {};

             // parse arguments
             if(m.schema) {
              sampleCurlArgs = "?";
              var s = m.schema;
              for(var arg in s) {

                // only generate sample curl syntax for required properties
                if(s[arg].optional != true) {
                  sampleCurlArgs += (arg + "=val&");
                  sampleCurlJSON[arg] = "val";
                }
                arguments.push( { name: arg + ' ' + JSON.stringify(s[arg]) });
              }
              sampleCurlArgs = sampleCurlArgs.substr(0,sampleCurlArgs.length-1);
             }

            if (arguments.length == 0) { 
              arguments.push({name: '{}'});
            }
            window.weld(window.$('.argument')[0], arguments);

            // GET     
            get = [ { url: '/' + method, params: 'curl -X GET ' + items.endpoint +  '/' + method + sampleCurlArgs} ]
            window.weld(window.$('.get')[0], get);

            // POST     
            post = [ { url: '/' + method, params: 'curl -X POST -d "' + sampleCurlArgs.substr(1, sampleCurlArgs.length) + '" ' + items.endpoint + '/' + method, 
                       json: 'curl -X POST -d "' + JSON.stringify(sampleCurlJSON) + '" ' + items.endpoint + '/' + method } ];                
            window.weld(window.$('.post')[0], post);

            html += window.$('#main-weld').html();
          }
          
          if (typeof m.methods === "object" || typeof m.methods === "function") {
            if(typeof m.methods === "function") {
              console.log('function!');
            }
            if (typeof(m.endpoint) == 'undefined') {
              m.endpoint = items.endpoint + '/' + m.module;
            }
            more_welded = welder(m);
            html += more_welded;
          }
       
        }
       
       return html;
      }
      
      module_html += welder(items);
      module_html += window.$('#footer-weld').html();
      
      cb(0, template.replace('{{body}}', module_html));  // fake mustache 
      

  });

}

var renderRoutes = exports.renderRoutes = function( format, name, items, template, cb ) {
  
  
  if(format == 'json'){
    return JSON.stringify(items, true, 2);
  }
  
  
  if(format == 'html'){
    renderHtml(name, items, template, cb);
  }

}

/*** simple html renderer for validator errors ***/
var renderValidatorErrors = exports.renderValidatorErrors = function(errors){
  
  var html = '<h1>error(s) have occurred with your request!</h1>';
  
  errors.forEach(function(v,i){
    
    html += "Argument Name:" + v.property + '<br/>';
    html += "Value:" + v.actual + '<br/>';
    html += "Expected:" + v.expected + '<br/>';
    html += "Message:" + v.message + '<br/><br/>';
  });
  
  
  return html;
}