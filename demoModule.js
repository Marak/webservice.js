// dummy module

exports.hello = function(){
  return 'hello';
};

exports.asyncHello = function(callback){
  callback();
}