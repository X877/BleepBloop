// Manages the chat window:
app.controller('ChatCtrl', ['$scope', '$firebaseArray', '$firebaseObject', 'FirebaseUrl', 
function ChatCtrl($scope, $firebaseArray, $firebaseObject, FirebaseUrl){
  var refresh = function () {
    console.log('refresh');
    $scope.messagesRef = firebase.database().ref('tunes/'+$scope.accessCode+'/messages');
    $scope.messages = $firebaseArray($scope.messagesRef);
  }
  
  $scope.$on('startEditor', refresh);
  
  $scope.submitMessage = function() {
    $scope.messages.$add({
        'author' : $scope.username,
        'content' : $scope.inputMessage,
        'date' : getDate()
    });
    $scope.inputMessage = '';
  }

  function getDate() {
    var date = new Date();
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    var date = date.getDate() + " " + (month[date.getMonth()]) + " " +
      date.getFullYear() + ", " + ("0" + date.getHours()).slice(-2) + ":" +
      ("0" + date.getMinutes()).slice(-2) + ":" + ("0" +  date.getSeconds()).slice(-2);
    return date;
  }
}]);
