// dummy module
exports.hello = function(){
  console.log('hello world');
  return 'hello world';
};

exports.asyncHello = function(callback){
  setTimeout(function(){
    console.log('hello world');
    if(typeof callback == 'function'){
      callback();
    }
  }, 3000);
}