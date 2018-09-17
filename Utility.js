var Utility = {
  // initialise zero array of given dimensions e.g. zeroes(5,10)
  zeros: function(shape) {
    if (shape.length == 0) {
      return 0;
    } else {
      var a = new Array(shape[0])
      for (var i = 0; i < shape[0]; i++) {
        a[i] = Utility.zeros(shape.slice(1))
      }
      return a;
    }
  }
  
  
}