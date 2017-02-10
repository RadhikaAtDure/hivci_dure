var dureConfig = {};
// dureConfig.AppBaseURL = 'http://view-hub.org'
//dureConfig.AppBaseURLContext = ' http://view-hub.org/service/';
dureConfig.AppBaseURL = 'http://hivci.org/';
dureConfig.AppBaseURLContext = 'http://hivci.org/service/';
//dureConfig.AppBaseURL = 'http://localhost:8080/iVizard/'
//dureConfig.AppBaseURLContext = 'http://localhost:8080/iVizard/'
// dureConfig.AppBaseURLContext = ' http://192.168.0.121:8089/ihealth/';

// In future may require it. Currently hard coded
//dureConfig.userAppId = 1;

/****************************************** SET/GET APP ID, TARGET ID, INDICATOR ID *********************************************/

dureConfig.getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Set User's App id
/* dureConfig.setUserAppId = function() {
	
	var app_id = document.getElementById('applicationId');
	
	var searchString = window.location.search.substring(1);
	
	if (app_id != null) {
		dureConfig.userAppId = app_id.value;
	} else if (dureConfig.getParameterByName('appid') != '') {
		
		dureConfig.userAppId = dureConfig.getParameterByName('appid');
		
	} else {
		dureConfig.userAppId = 14;
	}
	
	return true;
} */

//Set User's App id
dureConfig.setUserAppId = function() {
      
	var app_id = document.getElementById('applicationId');
  
	var searchString = window.location.search.substring(1);
		 
	if (app_id != null) {
		dureConfig.userAppId = app_id.value;
	} else if (dureConfig.getParameterByName('appid') != '') {
		 
		dureConfig.userAppId = dureConfig.getParameterByName('appid');             
	} else if(searchString != undefined) {
	 
		var  decodedVal = Base64.decodecommon(searchString);
	
		if(decodedVal != undefined)
		{
			var splitarray =  decodedVal.split("=");
			var appid = splitarray[1];
			console.log("---APP ID ----");
			console.log(appid);
		  
			if(appid != undefined)
			{
				dureConfig.userAppId= appid;
			} else {
				dureConfig.userAppId = 62;
			}
		} else {
			dureConfig.userAppId = 62;
		}
	} else {
		dureConfig.userAppId = 62;
	}
      
	return true;
}

// Gets User's App id 
dureConfig.getUserAppId = function() {

	return dureConfig.userAppId;;
}

/***************************************************************************/

// Set User's Target id
dureConfig.setUserTargetId = function(target_id) {
	
	var targetId = document.getElementById('targetId');
	
	if (targetId != null) {
		dureConfig.userTargetId = targetId.value;
	} else {
		dureConfig.userTargetId = target_id;
	}
	
	return true;
}

// Gets User's Target id 
dureConfig.getUserTargetId = function() {
	
	return dureConfig.userTargetId;
}

/***************************************************************************/

// Set User's Indicator id
dureConfig.setUserIndicatorId = function() {
	
	var indicator_id = document.getElementById('indicatorID');
	
	if (indicator_id != null) {
		dureConfig.userIndicatorId = indicator_id.value;
	} else {
		dureConfig.userIndicatorId = 170;
	}
	return true;
}

// Gets User's Level id 
dureConfig.getUserIndicatorId = function() {
	
	return dureConfig.userIndicatorId;
}

/***************************************************************************/

// Set App's Level 
dureConfig.setUserAppLevel = function() {
	
	var appLevel = document.getElementById('appLevel');
	
	if (appLevel != null) {
		dureConfig.userAppLevel = appLevel.value;
	} else {
		dureConfig.userAppLevel = 'world';
	}

	return true;
}

// Gets App's Level 
dureConfig.getUserAppLevel = function() {
	
	return dureConfig.userAppLevel;
}

/***************************************************************************/
// Set User email 
dureConfig.setAdminEmail = function() {
	
	var email = document.getElementById('email');
	var userData = JSON.parse(localStorage.getItem("userJson"));
	
	if (email != null) {
		dureConfig.userAdminEmail = email.value;
	} else if (userData != null) {
		dureConfig.userAdminEmail = userData.username;
	} else {
		dureConfig.userAdminEmail = '';
	}

	return true;
}

// Gets User email 
dureConfig.getAdminEmail = function() {
	
	return dureConfig.userAdminEmail;
}

/***************************************************************************/