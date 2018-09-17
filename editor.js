app.controller('EditorCtrl', ['$scope', '$interval', '$firebaseArray', '$firebaseObject', 'FirebaseUrl', 
function EditorCtrl($scope, $interval, $firebaseArray, $firebaseObject, FirebaseUrl) {
  // ** constant data, move to separate file probably
  var styles = {
    'playing_note': {'background-color': "#ff8888"},
    'playing_empty': {'background-color': "#880000"},
    'other_note': {'background-color': "#8888ff"},
    'other_empty': {'background-color': "#001a66"},
    'loading' : {'background-color': "#111111"}
  }
  var old_width;
  var old_date = new Date();


  // ** public functions, called from the angular HTML template (index.html) 
  
  // get the css style of the cell at (x,y)
  // (depends on whether there's a note there etc)
  $scope.getCellStyle = function(x, y) {
    var style;

    if ($scope.loading) {
      style = styles.loading;
    }
    else if ($scope.data[y][x]) {
      if (beatIndex == x) {
        style = styles.playing_note;
      } else {
        style = styles.other_note;
      }
    } else {
      if (beatIndex == x) {
        style = styles.playing_empty;
      } else {
        style = styles.other_empty;
      }
    }
    return style
  }
  
  // update dimensions of grid
  $scope.updateDims = function updateDims() {
    var old_data = [];
    //var old_width = $scope.width;
    if (typeof $scope.width === "undefined" || $scope.width == null){
      if (typeof old_width !== "undefined") {
        //alert(old_width);
        $scope.width = old_width;
      } else {
        $scope.width = 1;
      }
      //old_width = $scope.width;
      sendGrid();
      return;
    }
    for (var y = 0; y < $scope.height; y++) {
       old_data[y] = [];
       for (var x = 0; x < $scope.width; x++) {
          if ($scope.data[y] != undefined){
             old_data[y][x] = $scope.data[y][x];
          }
       }
    }
    console.log('updating grid');
    $scope.data = Utility.zeros([$scope.height,$scope.width]);
     for (var y = 0; y < $scope.height; y++) {
       for (var x = 0; x < $scope.width; x++) {
          if (old_data[y][x] != undefined){
             $scope.data[y][x] = old_data[y][x];
          } else {
             $scope.data[y][x] = 0;
          }
       }
     }
    old_width = $scope.width;
    console.log('Sending grid'); 
    sendGrid();
  }
  
  // called when cell is clicked
  $scope.onclick = function(x, y) {
     click = true;
     cell_value = 1 - $scope.data[y][x];
     $scope.data[y][x] = cell_value;
     sendCell(x, y);
  }  
  
  $scope.offclick = function() {
     click = false;
     cell_value = 0;
  }
  
  
  $scope.toggle = function (x, y) {
    if (click){
      $scope.data[y][x] = cell_value;
      console.log("toggle "+x+" "+y);
      sendCell(x,y);
    } /*else {
      $scope.data[y][x] = 1 - $scope.data[y][x];
      console.log("click");
    }*/
  }
  
  // called when bpm is set
  $scope.setBPM = function() {
    beatLength = 60.0/$scope.bpm;
    
    if (ticker != null) {
      $interval.cancel(ticker)
    }
    ticker = $interval(tick, beatLength*1000);
  }
  // called when bpm is set
  $scope.setVolume = function() {
    Howler.volume($scope.volume);
  }
  
  $scope.randomGrid = function() {
    for (var y = 0; y < $scope.height; y++) {
      for (var x = 0; x < $scope.width; x++) {
        if (Math.random() > 0.8) {
          $scope.data[y][x] = 1;
        } else {
          $scope.data[y][x] = 0;
        }
      }
    }
    sendGrid();
  }

  $scope.clearGrid = function() {
    for (var y = 0; y < $scope.height; y++) {
      for (var x = 0; x < $scope.width; x++) {
        $scope.data[y][x] = 0;
      }
    }
    sendGrid();
  }
  
 $scope.saveSample = function(){
    var sampleName = prompt("Save sample as", "SampleName");
    //console.log(sampleName);
    var name_present = -1;
    if (sampleName === null){
      return;
    } else {
      for (i = 0; i < $scope.numSamples; i++){
        //console.log('comparing ' +$scope.sampleNames[i] +' ' +sampleName);
        if ($scope.samples[i].name === sampleName){
          
          name_present = i;
          console.log('same')
          alert(sampleName +" is already in use.\nTry again");
          break;
        }
      }
      if (name_present != -1){
        return;
        //sampleRef.child('Names').child($scope.numSamples).set(sampleName);
        //$scope.sampleNames[$scope.numSamples] = sampleName;
        //$scope.numSamples++;
      }
    }
    saveConfig(sampleName);
 }

  function saveConfig(sname) {
    sampleRef = firebase.database().ref('tunes/'+$scope.accessCode+'/sample');
    
    var sdata = [];
    for (var x = 0; x < $scope.width; x++) {
      sdata[x] = [];
      for (var y = 0; y < $scope.height; y++) {
        sdata[x][y] = $scope.data[y][x];
      }
    }
    console.log("save data: "+sdata);
    sample = sampleRef.child($scope.numSamples).set({
      width : $scope.width,
      height : $scope.height,
      name : sname,
      data : sdata
    });
    
  }
  
  
  $scope.loadSample = function(){
    var samplename = prompt("Load sample", "SampleName");
    if (samplename === null){
      return;
    }
    var sample_present = false;
    var index = -1;
    for (i = 0; i < $scope.numSamples; i ++){
      console.log('sampledata = '+$scope.samples[i].data);
      if (samplename === $scope.samples[i].name){
        sample_present = true;
        index = i;
      }
    }
    if (!sample_present){
      alert("Sample doesn't exist, try again");
      return;
    }

    loadConfig(index);
  }
  
  
  function loadConfig(index){
    var width = $scope.samples[index].width;
    var height = $scope.samples[index].height;
    
    $scope.width = width;
    $scope.height = height;
    
    console.log('width = ' +$scope.width);
    console.log('height = ' +$scope.height);
    console.log("data = "+$scope.samples[index].data);
    
    for (var x = 0; x < $scope.width; x++) {
      for (var y = 0; y < $scope.height; y++) {
        var val = parseInt($scope.samples[index].data[x][y]);
        console.log("val = "+$scope.samples[index].data[x][y]);
        $scope.data[y][x] = val;
      }
    }
    refreshGrid();
    sendGrid();
  }
  
  // called when the instrument is changed
  $scope.updateSounds = function() {
    for (var i = 0; i < $scope.height; i++) {
      samples[i] = new Howl({src:'samples/'+$scope.scale+'-'+$scope.instrument+'-'+($scope.height-i - 1)+'.mp3'});
      sendGrid();
    }

  }
  
  // ** private functions
  
  // called once when the editor becomes visible
  var loadGrid = function(snapshot) {
    console.log('loadGrid');
    var grid = snapshot.val();
    $scope.loading = false;
    
    if (grid === null) {
      // nothing on the server, upload a clean grid
      $scope.width = 8;
      $scope.height = 8;
      $scope.scale = 'harmonic'
      $scope.data = Utility.zeros([$scope.height, $scope.width]);
      sendGrid();
    } else {
      
      $scope.height = grid['height'];
      $scope.width = grid['width'];
      $scope.scale = grid['scale'];
    
      $scope.data = Utility.zeros([$scope.height, $scope.width]);

      for (var x = 0; x < $scope.width; x++) {
        for (var y = 0; y < $scope.height; y++) {
          $scope.data[y][x] = parseInt(grid['data'][x+","+y]);
          if ($scope.data[y][x] != 0 && $scope.data[y][x] != 1) {
            //shouldn't happen
            console.log('unexpected grid value: '+$scope.data[y][x]);
            $scope.data[y][x] = 0;
          }
        }
      }
    }
  }
  
  // send single cell
  function sendCell(x,y) {
    if ($scope.loading) {
      // can't make changes before data is loaded
      return;
    }
    gridRef.child('data').child(x+","+y).set($scope.data[y][x]);
  }
  
  // send grid (height, width, all cells) to firebase server
  function sendGrid() {
    // set all cells
    for (var x = 0; x < $scope.width; x++) {
      for (var y = 0; y < $scope.height; y++) {
        sendCell(x,y);
      }
    }
    gridRef.child('width').set($scope.width)
    gridRef.child('height').set($scope.height)
    gridRef.child('scale').set($scope.scale)

    //addDate();
  }

  //add current date + time to history
  setInterval( function checkHistory() {
    var temp = 0;
    gridRef.child('history').on('child_added', function(snapshot) {
      var data = snapshot.val();
      var time = data['Date'];
      if (time > temp) temp = time;
    });
    gridRef.child('history').on('child_added', function(snapshot) {
      var data = snapshot.val();
      var time = data['Date'];
      if (time == temp) {
        //console.log("--" + data['Height'] + "---");
        if (data['Height'] != $scope.height || data['Width'] != $scope.width ||
          data['Scale'] != $scope.scale) {
          console.log("Height, width, or scale different");
          console.log(data['Scale'] + "--" + $scope.scale);
          addDate();
        } else {
          var count = 0;
          for (var x = 0; x < $scope.width; x++) {
            for (var y = 0; y < $scope.height; y++) {
              if ($scope.data[y][x] == parseInt(data['Data'][x + "," + y])) count++;
              if ($scope.data[y][x] != 0 && $scope.data[y][x] != 1) {
                //shouldn't happen
                console.log('unexpected grid value: ' + $scope.data[y][x]);
                $scope.data[y][x] = 0;
              }
            }
          }
          if (count < $scope.width * $scope.height) {
            addDate();
            console.log("cell different");
          } else {
            console.log("all same");
          }
        }
      }
      //if (data['Height'] == $scope.height) console.log(data['Height'] + "--" + $scope.height);
    });


  }, 120 * 1000);

  function addDate() {
    var date = getDate();
    var now = new Date();
    var time = now.getTime();

    gridRef.child('history').child(date).set(date);
    gridRef.child('history').child(date).child('Date').set(time);
    gridRef.child('history').child(date).child('Height').set($scope.height);
    gridRef.child('history').child(date).child('Scale').set($scope.scale);
    gridRef.child('history').child(date).child('Width').set($scope.width);
    for (var x = 0; x < $scope.width; x++) {
      for (var y = 0; y < $scope.height; y++) {
        gridRef.child('history').child(date).child('Data').child(x+","+y).set($scope.data[y][x]);
      }
    }


  /*if () {
   var date = getDate();
   gridRef.child('history').child(date).set(date);
   for (var x = 0; x < $scope.width; x++) {
   for (var y = 0; y < $scope.height; y++) {
   gridRef.child('history').child(date).child(x+","+y).set($scope.data[y][x]);
   }
   }*/
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


// change local value of cell when firebase changes
  var updateCell = function(snapshot) {
    var cell = snapshot.val();
    var key =  snapshot.key;
    var res = key.split(",");
    $scope.data[res[1]][res[0]] = cell;
    console.log('cell updated');
    //addDate();
  }

  var updateGridWidth = function(snapshot) {
     var width = snapshot.val();
     $scope.width = width;
     console.log('width = ' +width);
     refreshGrid();
  }
  
  var updateScale = function(snapshot){
    console.log('scale update recieved');
    var scale = snapshot.val();
    $scope.scale = scale;
    // alert("scale changed.  Scale is:"+$scope.scale);
    $scope.updateSounds();
  }

  function refreshGrid(){
    var data = [];
    console.log('refresh width = ' +$scope.width);
    
    for (var y = 0; y < $scope.height; y++) {
      data[y] = []; 
      for (var x = 0; x < $scope.width; x++) {
        var val = $scope.data[y][x];
        if (isNaN(val)){
          data[y][x] = 0;
        } else {
          data[y][x] = val;   
        }
      }
    }
    $scope.data = Utility.zeros([$scope.height,$scope.width]);
    for (var y = 0; y < $scope.height; y++) {
      for (var x = 0; x < $scope.width; x++) {
        $scope.data[y][x] = data[y][x]; 
      } 
    }
  }

  // called when the editor becomes visible
  function start() {
    visible = true;
    $scope.playing = true;
    $scope.loading = true;
  }
  $scope.$on('startEditor', start);
  
  //called when an access code is provided
  function setAccessCode() {
    // set firebase reference
    console.log('refresh_editor')
    gridRef = firebase.database().ref('tunes/'+$scope.accessCode+'/grid');
    setSampleList();
    gridRef.once('value', loadGrid);
    
    // recieve grid updates from firebase
    gridRef.child('data').on('child_changed', updateCell);
    gridRef.child('width').on('value', updateGridWidth);
    gridRef.child('scale').on('value', updateScale);

    checkDate();
  }

  function checkDate() {
    gridRef.child('history').on('value', function (snapshot) {
      if (snapshot.val() === null) addDate();
    });
  }

  $scope.$on('setAccessCode', setAccessCode);
  
  function setSampleList() {
    sampleRef = firebase.database().ref('tunes/'+$scope.accessCode+'/sample');
    
    sampleRef.once('value', loadSampleMetadata);
    
    
//    sampleRef.child('Number').on('value', updateSampleNumber);
//    sampleRef.child('Names').on('child_changed', updateSampleNames);
//    sampleRef.on('value', loadSampleMetadata);
      sampleRef.on('child_added', addSampleData);
  }
  
  var loadSampleMetadata = function(snapshot) {
    var sdata = snapshot.val();
    console.log('loading data');
    if (snapshot.numChildren == 0) {
      console.log('reseting metadata');
      $scope.numSamples = 0;
    } else {
      console.log("num children = " +snapshot.numChildren());
      $scope.numSamples = snapshot.numChildren();
    }
    
    var index = 0;
    snapshot.forEach(function(child){
      var c = child.val();
      var sample = {
        name : c.name,
        width : c.width,
        height : c.height,
        data: c.data,
      };
      
      $scope.samples[index] = sample;
      index ++;
    });
  }

  var addSampleData = function(snapshot) {
    console.log('adding sample');
    //console.log('prev num = ' +$scope.numSamples);
    sdata = snapshot.val();
    //console.log(sdata.numChildren());
    var sample ={
      name : sdata.name,
      width : sdata.width,
      height : sdata.height,
      data : sdata.data,
    };
    console.log('name = ' +sdata.name);
    $scope.samples[$scope.numSamples] = sample;
    console.log('Data: '+$scope.samples[$scope.numSamples].data);
    $scope.numSamples ++;
    //console.log('curr num = ' +$scope.numSamples);
  }
  // called when the editor becomes invisible
  function leave() {
    visible = false;
    $scope.playing = false;
  }
  $scope.$on('leaveEditor', leave);

  // called every x milliseconds, updates beatIndex and triggers sample(s)
  function tick() {
    if (visible && $scope.playing && !$scope.loading) {
      beatIndex = (beatIndex+1)%$scope.width;
      
      // play sound(s)
      for (var y = 0; y < $scope.height; y++) {
        if ($scope.data[y][beatIndex] > 0) {
          samples[y].play();
        }
      }
    }
  }
  
  // ** initialisation (only runs once ever)
  $scope.width = 8;
  $scope.height = 8;
  
  var ticker = null; // stores reference to angular $interval call
  
  $scope.bpm = 240;
  $scope.setBPM();

  $scope.volume = 0.4;
  $scope.setVolume();
  
  $scope.data = Utility.zeros([$scope.height,$scope.width]);
  
  //Sample values
  $scope.numSamples = 0;
  $scope.samples = [];
  
  var beatIndex = 0;
  $scope.playing = false;
  var visible = false;
  
  var click = false;
  var cell_value = 0;
  
  var samples = new Array($scope.height);
  for (var i = 0; i < $scope.height; i++) {
    samples[i] = new Howl({src:'samples/harmonic-pluck-'+($scope.height-i - 1)+'.mp3'});
  }

}]);
