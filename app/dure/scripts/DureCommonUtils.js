// Declaring all global-variables in one files so as to reduce dependency
var dureComUtil = {};
var durePolicy = {};
var durePolicyAdd = {};
var dureFile = {};
var dureDocuments = {};
var dureTsTrack = {};

//Initialize function
dureComUtil.initialize = function(){
	
	dureComUtil.geoJson = {};
	dureComUtil.countryPty = {};
	dureComUtil.countryID = '';
	dureComUtil.countryISOCode = '';
	dureComUtil.countryName = '';
	dureComUtil.countryISO2Code = '';
	dureComUtil.countryIDArray = [];
	dureComUtil.allCountryIdList = [];
	dureComUtil.countryListStr = '';
	dureComUtil.regionCode = '';
	dureComUtil.regionTitle = '';
	dureComUtil.impactCountryIDArray = ["12", "9", "79", "14", "15", "16", "37", "22", "24", "36", "19"];
	
	dureComUtil.setCountryId();	
	dureComUtil.getCountryListJson();		
};

dureComUtil.getCountryListJson = function() {
	
	var serviceUrl = dureUser.AppBaseURLContext+'dataapi/target/all/countryData?callback=dureComUtil.callback_GetCountryJson';
	console.log(serviceUrl);
	dureService.getCountryInfoList(serviceUrl);
};

dureComUtil.callback_GetCountryJson = function(resp){
	
	dureComUtil.geoJson = resp;
	
	dureComUtil.setCountryProperty(dureComUtil.geoJson);
	dureControl.initialize();
	
	if(dureTsTrack.hasOwnProperty('initialize')){
		
		dureTsTrack.initialize();
	}	
}

// Returns COUNTRY-ID AND IF no parameter then returns COUNTRY-ID =1 as default.
dureComUtil.getParameterByName = function(name) {
	
	var search = location.search.replace('?','');
	console.log(search);
	
	search = Base64.decode(search);
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	
	console.log(name);
	
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec('?'+search);
	
	console.log(results);
    return results === null ? 1 : parseInt(decodeURIComponent(results[1].replace(/\+/g, " ")));
    // return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

// Returns COUNTRY-NAME from ISOCODE
dureComUtil.getCountryNamefromIso = function (isocode) {

	var features = dureComUtil.geoJson.features;
	var countryName = '';
	for (var index in features) {

		if(features[index].properties['iso_a3'] == isocode){
			
			countryName = features[index].properties.name;
		}	
	}
	return countryName;
};

// Returns COUNTRY-ISO From COUNTRY-ID
dureComUtil.getCountryIsoFromID = function (id) {
	
	// console.log("Getting country ISO from ID... ");
	// console.log(countryIdMapping);
	
	var isocode;
	for (var iso in countryIdMapping) {
		
		if (countryIdMapping[iso].countryId == id) {
			isocode = iso;
			break;
		}		
	}
    return isocode;
};

// Returns COUNTRY-ID From COUNTRY-ISO
dureComUtil.getCountryIDFromISO = function (iso) {
	
	var id;
	$.each(countryIdMapping, function(ind, val) {
		
		if (ind == iso) {
			id = val.countryId;
			//break;
		}		
	});
    return id;
};

dureComUtil.collapsibleButtonForPanel = function(){
	
	/* Add collapse and remove events to boxes */
	$("[data-widget='collapse']").click(function() {
		event.stopPropagation();
		//Find the box parent        
		var box = $(this).parents(".box").first();
		console.log("box");
		//Find the body and the footer
		var bf = box.find(".box-body, .box-footer");
		if (!box.hasClass("collapsed-box")) {
			box.addClass("collapsed-box");
			//Convert minus into plus
			$(this).children(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
			bf.slideUp();
		} else {
			box.removeClass("collapsed-box");
			//Convert plus into minus
			$(this).children(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
			bf.slideDown();
		}
	});
};

// Sets current country Id from decoding the querystring from url.
dureComUtil.setCountryId = function(){
	
	if(dureUser.checkUserLoginStatus() == true){
		
		var userObj = dureUser.getUserInfo();
		dureComUtil.countryID = dureComUtil.getParameterByName('countryid');

		if($.inArray(dureComUtil.countryID,userObj.countryIdList) == -1){

			dureComUtil.countryID = userObj.countryIdList[0];
		}		
		
	}else{
		
		dureComUtil.countryID = dureComUtil.getParameterByName('countryid');
		
	}
		
	if (dureComUtil.countryID == "") {
		dureComUtil.countryID = 1;
	} else if (dureComUtil.countryID == "undefined") {
		dureComUtil.countryID = 0;
	}	
}

// Get current country Id.
dureComUtil.getCountryId = function(){

	return dureComUtil.countryID;
}

// Set the current selected property.
dureComUtil.setCountryProperty = function(geojson){
	
	if(geojson != undefined){
		
		var countryId = dureComUtil.getCountryId();
		console.log(countryId);		
		$.each(geojson.features,function(index,countryObj){
			
			if(countryObj.properties.country_id == countryId){
				
				dureComUtil.countryPty = countryObj.properties;
				
			}		
				
		});		
		
	}
	
};

// Get the current selected property.
dureComUtil.getCountryProperty = function(){
	
	return dureComUtil.countryPty
}


dureComUtil.numberWithSpace = function(x) {

	 if(x != undefined){
	 
	  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	 }
	 else{
	 
	  return x;
	 }  
};


dureComUtil.sortData = function(dataArray) {
	
	return dataArray.sort(function (a, b) {

	  if (a.name > b.name) {
	    return 1;
	  }
	  if (a.name < b.name) {
	    return -1;
	  }
	  // a must be equal to b
	  return 0;
	});
}

dureComUtil.getCurrentFileName = function(){
	
	var currentUrl = window.location.href;
	var lastSegment = currentUrl.split('/').pop();
	var filename = (lastSegment.indexOf('?')  > -1) ? lastSegment.substr(0,lastSegment.indexOf('?')) : lastSegment;	
	
	return filename;
};