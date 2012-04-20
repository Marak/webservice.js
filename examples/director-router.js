var http = require('http'),
    webservice = require('../lib/webservice'),
    director = require('director');

var router = new director.http.Router();

var server = http.createServer(function (req, res) {
  router.dispatch(req, res, function (err) {
    if (err) {
      res.writeHead(404);
      res.end();
    }
  });
});

var fs = require('fs')
var template = fs.readFileSync(__dirname + '/../lib/views/home.html').toString();


router.get(function(){
  this.res.end(webservice.view.renderRouter('html', 'foo', router, template));
});

//
// Use regex based routing
//
router.get(/foo/, { "description": "foo"}, function () {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end('hello world\n');
});

//
// Or use slugs
//
router.post("/user/:id", function () {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end("should create a new user");
});

router.get("/user/:id", function () {
  this.res.writeHead(200, { 'Content-Type': 'text/plain' })
  this.res.end("should get user by id");
});


var schema = {
  "name": "echo demo",
  "description": "a simple echo example with schema",
  "properties" : {
    "msg": {
      type: 'string',
      optional: false,
      message: "msg is required to echo something back!"
    }
  }
};

router.post('/echo', { 
  schema: schema 
}, function(){
  this.res.writeHead(200, { 'Content-Type': 'application/json' })
  this.res.end(JSON.stringify(this.req.body));
})


server.listen(8080);
console.log('vanilla http server with director running on 8080');
