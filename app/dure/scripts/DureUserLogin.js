var dureUser = {};

dureUser.intialize = function(){
	
	dureUser.id = '';
	dureUser.roleId = '';
	dureUser.info = {};	
	dureUser.submitLoginInfo();
	// dureUser.AppBaseURLContext = 'http://ivizard.org/liteservice/';
	dureUser.AppBaseURLContext = dureConfig.AppBaseURLContext;
}

dureUser.checkUserLoginStatus = function(){
	
	var userinfo = localStorage.getItem("userJson");
	
	if(userinfo != null){
		
		return true;
		
	}else{
		
		return false;
	}
};

dureUser.getUserInfo = function(){
	
	var userinfo = localStorage.getItem("userJson");
	return JSON.parse(userinfo);
}

dureUser.setUserId = function(userId){	
	
	dureUser.id = 	userId;
}
	
dureUser.getUserId = function(){
	
	return dureUser.id;
}

dureUser.submitLoginInfo = function(){
	
	var userinfo = localStorage.getItem("userJson");
	if(userinfo == null) {
		
		$('#login').on('click', function(){
			$('#login-modal').modal({backdrop: 'static'},'show');
		});
	}
	
	$("#user-login").submit(function(event) {
		return false;	
	}).validate({

		// Specify the validation rules
		rules: {
			username: "required",
			password: {
				required: true,
				minlength: 3
			}			
		},
		
		// Specify the validation error messages
		messages: {
			username: "Please enter your user name",
			password: {
				required: "Please provide a password",
				minlength: "Your password must be at least 5 characters long"
			}							   
		},
		error: function(label) {
			$(this).addClass("error");
		},
		submitHandler: function(form) {
				
			$(this).find(':submit').attr('disabled','disabled');
			sendCORSRequest();
		}
	});

	$( "input" ).focusin(function() {
		$('#login-error').remove();
	});
	
}

function sendCORSRequest() {
	
	var req;
	var data = new FormData();
	var username = $("#username").val();
	var password = $("#password").val();
	data.append('username', username);
	data.append('password', password);
	var encodedData = username+':'+password;
	var authorizationToken = 'Basic '+window.btoa(encodedData);
	//var baseURLContext = dureConfig.AppBaseURLContext;
	var baseURLContext = dureUser.AppBaseURLContext;
	console.log(encodedData);
	if(XMLHttpRequest) {
		req = new XMLHttpRequest();																				
		req.open("POST", baseURLContext+"dataapi/authenticateiVizardUser", true);
		
		//req.setRequestHeader("Authorization",authorizationToken);
		req.onreadystatechange = function() {
			if (req.readyState === 4) {
				if (req.status >= 200 && req.status < 400) {
					getLoginInfo(req.response);
				} else {
					console.log("Status", req.status +" "+req.statusText);
					var errorelement = $( "<label style='font-size: 20px; text-align: center;'>" )
										.attr( "id","login-error" )
										.addClass( "error" )
										.html( "Login not allowed to this application!" );
					$( errorelement ).insertBefore( "#usernameWrapper" );
				}
				if(req.status == 401){
					console.log("Invalid credentials");
					authorizationError();
				}
			}
		};
		req.send(data);
	
	} else if(XDomainRequest) {
		req = new XDomainRequest();
		req.open("POST", baseURLContext+"dataapi/authenticateUser");
		req.setRequestHeader("Authorization",status);
		req.onreadystatechange = function() {
			if (req.readyState === 4) {
				if (req.status >= 200 && req.status < 400) {
					getLoginInfo(req.response);
				} else {
					console.log("Status", req.status + req.statusText);
				}
				if(req.status == 401){
					console.log("Invalid credentials");
					authorizationError();
				}
			}
		};
		req.send(data);
	} else {
		errback(new Error('Error in creating CORS request'));
	}
} 
	
function authorizationError() {
	var errorelement = $( "<label style='font-size: 20px; text-align: center;'>" )
					.attr( "id","login-error" )
							.addClass( "error" )
							.html( "Invalid Credentials" );
	$( errorelement ).insertBefore( "#usernameWrapper" );
}
	
function getLoginInfo(response) {
	
	$.each(JSON.parse(response), function(index, element) {
		if(index == "verified" && element == true){
			//Set authorization token in api calls
			console.log(response);
			var username = $("#username").val();
			var password = $("#password").val();
			var encodedData = username+':'+password;
			var token = 'Basic '+window.btoa(encodedData);
			localStorage.setItem("authorizationToken",token);
			localStorage.setItem("userJson",response);
			localStorage.removeItem('justOnce');
			
			if(localStorage.getItem("urlRedirectGarpar")) {	 		  	
   			    localStorage.removeItem("urlRedirectGarpar");
				var currentPageUrl = window.location.href;
				var pos = currentPageUrl.split('/');
				var redirectURL = '';
				pos.filter(function(e, i) { if(i < pos.length - 2){ return redirectURL +=e + '/' }});
				location.href = redirectURL + 'app/garpr.html';
				
			} else {
				location.href = location.origin+location.pathname;
			}
			

			
			// location.reload(true);
			//window.location.href = "home.html";
		} else if(index == "verified" && element == false){
			console.log("Invalid credentials");
			var errorelement = $( "<label style='font-size: 20px; text-align: center;'>" )
				.attr( "id","login-error" )
				.addClass( "error" )
				.html( "Invalid Credentials" );
			$( errorelement ).insertBefore( "#usernameWrapper" );
		}
	});
}

dureUser.checkWhetherUserLoggedIn = function(){
	
	var userinfo = JSON.parse(localStorage.getItem("userJson"));
	console.log("Checking user login .....");
	if(userinfo != null) {
		var login = $("#login");
		login.find( "i" ).removeClass("fa-user");
		login.find( "i" ).addClass("fa-sign-out");
		// console.log(userinfo);
		login.prepend("<span style='padding-right:5px;font-weight:bold;'>"+userinfo.username+"</span>");
	}else{
		var login = $("#login");
		login.find( "i" ).removeClass("fa-sign-out");
		login.find( "i" ).addClass("fa-user");
		login.find( "span" ).html("");
	}
};
	
// Code for login process -- start
dureUser.checkWhetherUserLoggedIn();	


$('#login').click(function() {
 
 var userinfo = localStorage.getItem("userJson");
 console.log(userinfo);
 if(userinfo != null){
	  var authToken = localStorage.getItem("authorizationToken");
	  //Code to logout user using cors logout api.
	  var userData = JSON.parse(localStorage.getItem("userJson"));
	  
	  $.jStorage.deleteKey(userData.username); // Remove Local storage of user layout setting
	  
	  localStorage.removeItem("userJson");
	  localStorage.removeItem("authorizationToken");
	  
	  //setting default guest user role id.
	  dureUser.setRoleId(1);
	  //dureApp.logoutUser(authToken);
	  
	  var currentPageUrl = window.location.href;
	  
	  // var pos = currentPageUrl.lastIndexOf('/');
	  // var urlContext = currentPageUrl.substring(0,pos)+'/'
	  // var returnUrl = urlContext+'policy.html';  
	  
	  window.location = currentPageUrl;
	   location.reload(true);
	  //window.location.href = "home.html";
 }else{
	 
	 dureUser.checkWhetherUserLoggedIn();
	 
 }
});
// Code for login process -- end


dureUser.setRoleId = function(roleId){
	
	dureUser.roleId = roleId;
	return true;
};

// Gets Role ID
dureUser.getRoleId = function(){

	return dureUser.roleId;
};
