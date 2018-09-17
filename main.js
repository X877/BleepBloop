// Initialize Firebase
var config = {
  apiKey: "AIzaSyBV2c3UHU625V57ouPC7nVRbejRtQ2DNHQ",
  authDomain: "bleepbloop-4ce1c.firebaseapp.com",
  databaseURL: "https://bleepbloop-4ce1c.firebaseio.com",
  storageBucket: "bleepbloop-4ce1c.appspot.com",
};
firebase.initializeApp(config);

// Initialise angular animation
angular.module('animateApp', ['ngAnimate'])
.controller('mainController', function($scope) {
  
//Set the default states for startmenu
  $scope.currentView = "startMenu";
});

function generateAccessCode(){
  var code = "";
  var alphabet = "abcdefghijklmnopqrstuvwxyz";

  for(var i=0; i < 6; i++){
    code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return code;
}

// Define the module
var app = angular.module('bleepbloopApp', [
   'firebase',
   'ngAnimate'
]);

app.constant('FirebaseUrl', 'https://bleepbloop-4ce1c.firebaseio.com/');

app.controller('MainCtrl', ['$scope', '$rootScope', '$timeout',
function($scope, $rootScope, $timeout) {  
  $scope.username = String.fromCharCode(0x2F10 + Math.random() * (0x2FC0 - 0x2F10));

  // ** public functions: these get called from the HTML when corresponding buttons are clicked
  $scope.newTune = function() {
    $scope.currentView = "create";
  }

  $scope.createTune = function() {
    $scope.accessCode = generateAccessCode();
    
    $scope.joinTune();
  }
  $scope.joinTune = function() {
    // TODO: check if access code is valid
    $scope.currentView = "tuneEditor";
    location.hash = '#'+$scope.accessCode;
    
    $rootScope.$broadcast('setAccessCode');
    $rootScope.$broadcast('startEditor');
  }
  
  $scope.back = function() {
    $scope.currentView = "startMenu";
    $rootScope.$broadcast('leaveEditor');
  }
  
  init = function() {
    $scope.accessCode = location.hash.slice(1);
  // TODO: check validity of access code
  if ($scope.accessCode) {
    // jump straight into tune
    $scope.joinTune();
  } else {
    $scope.currentView = "startMenu";
  }}
  
  $timeout(init);

}]);