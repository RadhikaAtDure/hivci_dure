// For TS Tracking tool we are refering this json database.
var dureFirejs = {};
var dureTsTrackData = {};
dureFirejs.initialize = function(){
	
	dureFirejs.tsTrackDataRef = new Firebase("https://dureapp.firebaseio.com/");
	
	dureFirejs.getTsTrackTopics();
	dureFirejs.getTsTrackData();
	
};

console.log("Firebase Object Loading");

// To fetch topics of tracking tool.
dureFirejs.getTsTrackTopics = function(){
	
	var responseTopicArr = [];

	dureFirejs.tsTrackDataRef.child("topic").on("value", function(snapshot) {
	  
	  responseTopicArr = snapshot.val(); 
	  dureTsTrack.buildTopicDropDown(responseTopicArr);
	  
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
	
	
};

// To fetch data for tracking tool.
dureFirejs.getTsTrackData = function(){
	
	var responseData = dureFirejs.tsTrackDataRef.child("data2").on("value", function(snapshot) {
	  
	  dureTsTrackData = snapshot.val();
	  
	  dureTsTrack.setData(snapshot.val());
	  dureTsTrack.formatData();
	  
	  console.log(dureTsTrackData);
	}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
	});
};




