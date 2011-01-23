
/*** simple internal view server ( for documentation ) ***/

var renderRoutes = exports.renderRoutes = function( format, name, items, template ) {
  if(format == 'json'){
    return JSON.stringify(items, true, 2);
  }
  if(format == 'html'){
    var html = '';
    html += '<h1>' + items.title + '</h1>'
    html += '<h3>' + items.name + '</h3>';
    html += 'Version <i>' + items.version + '</i>';
    html += '<h3>Available Methods</h3>';

    // iterate through each top-level method in the module and created a link
    for(var method in items){
      if(typeof items[method] == 'string'){
        continue;
      }
      // if the module is private, ignore it
      if(items[method].private === true){
        continue;
      }
    

     html += ('<div class="member grad">');
     html += ('<div class="header"><a href="'+ name + '/' + method +'">/' + method + '</a></div>');
     html += ('<div class="content">');
     html += ('<div class="member grad">');
     html += ('<div class="sub header">' + items[method].docs + '</div>');
    
     var sampleCurlArgs = '', sampleCurlJSON = {};
     
     // parse arguments
     if(items[method].schema){
       
       sampleCurlArgs = "?";
       html += ('<div class="content"><strong>arguments:</strong> <br/>');
       
       for(var arg in items[method].schema){

         // only generate sample curl syntax for required properties
         if(items[method].schema[arg].optional != true){
           sampleCurlArgs += (arg + "=val&");
           sampleCurlJSON[arg] = "val";
         }

         html += (arg + ' ' + JSON.stringify(items[method].schema[arg]) + '<br/>');
       }
       sampleCurlArgs = sampleCurlArgs.substr(0,sampleCurlArgs.length-1);
       html += ('</div>');
     }
     
     // render verbs
     if(items[method].restful === true){
       
       // GET 

       html += ('<div class="content">');
       html += ('<span class="verb">GET</span> <span class="url">/'+method+'<br>');
       html += ('<div class="curl">curl -X GET '  + items.endpoint +  '/' + method  + '</div>');
       html += ('<div class="descriptor">Gets all ' + method + 's<br/></div>');
       html += ('</span></div>');
       
       // GET/:ID
       html += ('<div class="content">');
       html += ('<span class="verb">GET</span> <span class="url">/'+method+'/:id<br>');
       html += ('<div class="curl">curl -X GET '  + items.endpoint +  '/' + method + '/123</div>');
       html += ('<div class="descriptor">Get ' + method + ' by id<br/></div>');
       html += ('</span></div>');

       // POST/:ID
       html += ('<div class="content">');
       html += ('<span class="verb">POST</span> <span class="url">/' + method + '<br>');
       html += ('<div class="curl">curl -X POST -d "' + sampleCurlArgs.substr(1, sampleCurlArgs.length) + '" ' + items.endpoint + '/' + method + '</div>');
       html += ('<div class="descriptor">Create a new ' + method + '<br/></div>');
       html += ('</span></div>');
       
       // PUT/:ID
       html += ('<div class="content">');
       html += ('<span class="verb">PUT</span> <span class="url">/'+method+'/:id<br>');
       html += ('<div class="curl">curl -X PUT -d "' + sampleCurlArgs.substr(1, sampleCurlArgs.length) + '" ' + items.endpoint + '/' + method + '</div>');
       html += ('<div class="descriptor">Update a ' + method + '<br/></div>');
       html += ('</span></div>');
       
       // DELETE/:ID
       
       html += ('<div class="content">');
       html += ('<span class="verb">DELETE</span> <span class="url">/' + method + '/:id<br>');
       html += ('<div class="curl">curl -X DELETE '  + items.endpoint +  '/' + method + '/123</div>');
       html += ('<div class="descriptor">Delete a ' + method + ' by id<br/></div>');
       html += ('</span></div>');
       
       
     }
     else{

       
       // GET
       html += ('<div class="content">');
       html += ('<span class="verb">GET</span> <span class="url">/'+method+'<br>');
       html += ('<div class="curl">curl -X GET '  + items.endpoint +  '/' + method + sampleCurlArgs + '</div>');
       //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
       html += ('</span></div>');
       
       // POST
       
       html += ('<div class="content">');
       html += ('<span class="verb">POST</span> <span class="url">/echo<br>');
       html += ('<div class="curl">curl -X POST -d "' + sampleCurlArgs.substr(1, sampleCurlArgs.length) + '" ' + items.endpoint + '/' + method + '</div>');
       html += ('You can also post JSON...<br/>');
       html += ('<div class="curl">curl -X POST -d "' + JSON.stringify(sampleCurlJSON) + '" ' + items.endpoint + '/' + method + '</div>');

       //html += ('<div class="descriptor">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br/></div>');
       html += ('</span></div>');
       
       
       
     }
     
     html += ('</div></div>');
     
     html += ('</div>');

     
    // + '/' + method + '</a> <i>' + (items[method].docs || '') + ' </i>' + '</li>');
     
    }
    html += '<h4>This page was auto-generated by <a href="http://github.com/marak/webservice.js" target="_blank">webservice.js</a></h4>'
    
    return template.replace('{{body}}', html); // fake mustache 
  }
  return 'error';
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