http       = require('http')
ws         = require('../../lib/webservice')
demoModule = require('../sample_modules/demoModule.coffee')
colors     = require('colors')
handler    = ws.createHandler(demoModule)

http.createServer(handler).listen(8080)

console.log(' > json webservice started on port 8080'.cyan)
