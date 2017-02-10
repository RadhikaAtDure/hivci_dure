$(".garpr-checked").on('click', function() {
	localStorage.setItem("urlRedirectGarpar",true);
	dureUser.intialize();
	
	if(dureUser.checkUserLoginStatus()) {
		var currentPageUrl = window.location.href;
		var pos = currentPageUrl.split('/');
		var redirectURL = '';
		pos.filter(function(e, i) { if(i < pos.length - 2){ return redirectURL +=e + '/' }});
		location.href = redirectURL + 'app/garpr.html';
	} else {
		$('#login-modal').modal({backdrop: 'static'},'show');
	}
});


