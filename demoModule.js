// demo module
exports.hello = function(){
  console.log('hello world');
  return 'hello world';
};

exports.asyncHello = function(res, callback){
  setTimeout(function(){
    console.log('hello world');
    if(typeof callback == 'function'){
      // callback is going to return a value. if we wanted to continue the chain here, we could pass res
      var result = callback();
      res.send(200, {'Content-Type': 'application/json'}, JSON.stringify(result));
    }
  }, 3000);
}