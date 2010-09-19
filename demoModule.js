// dummy module
exports.hello = function(){
  return 'hello world';
};

exports.asyncHello = function(callback){
  setTimeout(function(){
    callback();
  }, 3000);
}