# demo module
this.title    = "Welcome to your webservice!"
this.name     = "demo api module"
this.version  = "0.1.0"
this.endpoint = "http://localhost:8080"

exports.echo = (options, callback) ->
  callback(null, options.msg)

exports.echo.description = "this is the echo method, it echos back your msg"

exports.echo.schema =
  msg:
    type: 'string',
    optional: false 

exports.ping = (options, callback) -> 
  setTimeout( () ->
    callback(null, 'pong')
  , 2000)
  
exports.ping.description = "this is the ping method, it pongs back after a 2 second delay"

