var dureLayout = {};
dureUtil.appProfile = {};
dureApp.emailId = dureConfig.userAdminEmail;
dureApp.levelId = '';

dureConfig.setUserAppId();
dureConfig.setUserTargetId();
dureConfig.setUserIndicatorId();
dureConfig.setUserAppLevel();
dureConfig.setAdminEmail();

// Callback function to get the response of getApplicationProfile
function getMetaData(resp, storage_status) {
	console.log("============================== Meta data call back ================================");
	console.log(resp);
	
	if (storage_status != 'local') {
		dureUtil.storeAtLocal('app_meta_data_'+dureUtil.appId, resp);
	}
	
	var metaData;	
	var key = "APPPROFILE";
	if(resp != undefined){
		if(resp.applications.length > 0) {
			if(resp.applications[0].targetGroups.length > 0) {			
				dureConfig.setUserTargetId(resp.applications[0].targetGroups[0].targets[0].targetId);
				
				if(dureConfig.getUserTargetId()){
					
					dureUtil.targetId = dureConfig.getUserTargetId();
					dureUtil.targetMenuId = "T_" + dureConfig.getUserTargetId();
				}
				
				dureUtil.indicatorName = resp.applications[0].targetGroups[0].targets[0].indicators[2].indicatorName;	// TO DO.		
				
				if(!jQuery.isEmptyObject(resp.applications[0].applicationPersonalization)) {
		
					var layoutSettingsDB = resp.applications[0].applicationPersonalization;    
					
					if(dureApp.emailId != "" && dureApp.emailId != undefined && layoutSettingsDB != undefined) {
						//console.log(dureUtil.emailId);
						dureUtil.storeAtLocal(dureApp.emailId, layoutSettingsDB); 
					}				
					
					//dureUtil.storeAtLocal('public_profile', layoutSettingsDB);    
					//console.log(layoutSettingsDB);
					/*if(dureUtil.retrieveFromLocal(dureUtil.emailId) != undefined) {
						if (!localStorage.justOnce) {
							localStorage.setItem("justOnce", "true");
							location.reload(true);
						}
					}*/
				}
				
				//console.log(dureUtil.retrieveFromLocal('public_profile'));			
				//console.log(dureUtil.retrieveFromLocal(dureApp.emailId));
				dureUtil.applyLayoutSettings();
				//dureUtil.initialize();			
				//dureApp.setUserRoleId();
				
				dureApp.userPersionalizationSetting();
				
				if(dureConfig.getUserIndicatorId() == 0){
					var indicatorId;
							
					if(Offline.state == 'up') {
					
						indicatorId = resp.applications[0].targetGroups[0].targets[0].indicators[0].indicatorId;
					} else {
						
						var worldIndicatorDataArray = dureUtil.retrieveFromLocal('WorldIndicatorDataArray_'+dureUtil.appId);				
						indicatorId = worldIndicatorDataArray[0].indicatorMetaInfo[0].indicatorInfo.indicatorId;
					}
					dureConfig.setUserIndicatorId(indicatorId);
					dureUtil.indicatorId = indicatorId;	
					dureUtil.indicatorMenuId = "I_" + indicatorId;				
				} else {
					dureUtil.indicatorId = dureConfig.getUserIndicatorId();
				}
				
				dureUtil.appProfile = resp;
				dureUtil.storeAtLocal(key,resp); 
				dureApp.levelId = resp.applications[0].level;

				if (resp.applications[0].level == 2) {

					dureUtil.setDataLevel('country');
					dureUtil.setCountryId(resp.applications[0].countryid);
					//dureUtil.setCountryRegionId(resp.applications[0].countryid);
					dureUtil.setCountryRegionId(countryIdMapping[dureUtil.getCountryIsoFromID(resp.applications[0].countryid)].regionId); // TODO
					
				} else {
					dureUtil.setDataLevel('world');
				}
				
				setTimeout(function(){ 
					//sync personal layout settings / clear local storage
					dureUtil.syncPersonalLayoutSettings();
				
					//Set default value to layout menu
					dureUtil.setDefaultValueForLayoutSettingControl();	
					
					//Call Menus on sidebar component.
				//	dureUtil.callSidebarMenuComponent(dureUtil.indicatorName); 
					
					//Prepare Application objects i.e set all user app related data .
					dureUtil.prepareApplicationObjects(resp);
				
					//dureUtil.setAppInfOnWindow();			
					
					//Fetching data from the desired service for components.
					//dureUtil.getDataForComponents();
					
			
					
				}, 800);
			} else {
				
				dureApp.showDialog('Public Indicators are not available for the Application.','error');
				$('#login-modal').modal({backdrop: 'static'},'show');
				$('.login-error').html('Public Indicators are not available for the Application. Please Login.');
			}
		}else{		
			dureApp.showDialog('Application not available.','error');
		}		
	}else{		
		dureApp.showDialog('Service unavailable currently.','error');
	}
};

head.ready(function() {
	
	// Get application details for given appId,langId,indicatorId and targetId
	dureUtil.getApplicationProfile = function (){

		console.log("=================== Fetch Application Profile =====================");	
		var userData = JSON.parse(localStorage.getItem("userJson"));

		if(userData){
			dureUtil.emailId = userData.username;
		}
		
		// Check online n offline and call service accordingly
		
		if(dureUtil.checkIfKeyExsist('app_meta_data_'+dureUtil.appId)) {
			
			console.log("========== Using Local Meta Application Data ==========");
			resp = dureUtil.retrieveFromLocal('app_meta_data_'+dureUtil.appId);
			//getMetaData(resp, 'local');
			setTimeout(function(){ getMetaData(resp, 'local')}, 800);
			
		} else {
			
			if(Offline.state == 'up') {
				// Online
				console.log("========== Calling Service Application Profile ==========");
				
				var userData = JSON.parse(localStorage.getItem("userJson"));
			
				if(userData){
					//dureUtil.emailId = userData.username;
					dureApp.emailId = dureUtil.emailId = userData.username;
				}
			
				var username = 'admin';
				var password = 'IHEALTH@9028';
				var queryString;
				//var queryString = 'targetid=0&appid='+dureUtil.appId+'&email='+dureUtil.emailId+'&langid='+dureUtil.langId+'&indicatorid='+dureUtil.indicatorId+'&roleid='+dureUtil.roleId+'&callback=getMetaData';	
				
				if(dureUtil.emailId){
					// queryString = 'targetid=0&appid='+dureConfig.getUserAppId()+'&email='+dureConfig.getAdminEmail()+'&langid=1&indicatorid=0&roleid=1&callback=getMetaData';	
					queryString = 'targetid=0&appid='+dureConfig.getUserAppId()+'&email=admin@duretechnologies.com'+'&langid=1&indicatorid=0&roleid=1&callback=getMetaData';	
				} else {
					queryString = 'targetid=0&appid='+dureConfig.getUserAppId()+'&langid=1&indicatorid=0&roleid=1&callback=getMetaData';	
				}
				
				var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/target/all/metadata/?'+queryString;
				console.log(serviceUrl);
				$.ajax({
					type:'GET',
					url:serviceUrl,
					dataType: 'jsonp',
					contentType: 'application/json',
					crossDomain : true,
					xhrFields: {
						withCredentials: true
					},
					username : username,
					password : password,
					timeout: 60000, // sets timeout to 60 seconds
					error: function (request, textStatus, errorThrown) {
						//console.log(request.responseText);
						//console.log(textStatus);
						//console.log(errorThrown);
					}
				});	
			} else {
				// Offline
				dureApp.showDialog('No offline data available.','error');
			}
		}
	};

	dureApp.userPersionalizationSetting = function() {

		var layoutSettingsObject = {};

		var personalizationSettingObj = {};
			personalizationSettingObj.userEmail = "public_profile";
			
			if(!dureApp.emailId && !dureUtil.checkIfKeyExsist('public_profile')) {
				//console.log('localstorage');
				layoutSettingsObject.layout = 'tab'; 
				layoutSettingsObject.theme = 'blue'; 
				layoutSettingsObject.component = 'all';
				layoutSettingsObject.frequency = '7';
				
				dureUtil.storeAtLocal('public_profile', layoutSettingsObject);
			}
			
	   // On click Apply
		$('#applyUserPersonalization').on('click', function() {
			
			personalizationSettingObj.appId = dureUtil.appId;			
			
			if(dureApp.emailId) {
				//dureUtil.clearStorageValues('public_profile');
				personalizationSettingObj.userEmail = dureApp.emailId;
				//personalizationSettingObj.frequencyVal = $('#frequencyOptionContainer input:checked').val();
			} else {
				personalizationSettingObj.userEmail = "public_profile";
				//personalizationSettingObj.frequencyVal = $('#frequencyOptionContainer input:checked').val();
			}
			
			personalizationSettingObj.frequencyVal = $('#frequencyOptionContainer input:checked').val();
			
			var layoutSetting = {
				value: $('#layoutOptionContainer input:checked').val(),
				id: 1
			};
			
			var themeSetting = {
				value: $('#themeOptionContainer input:checked').val(), 
				id: 2
			};

			var componentSetting = {
				value: '',
				id: 3,
				valueContainer: [],
				getValues: function() {
						var that = this;
						$('#compontentOptionContainer  input:checked').each(function(key, value){
						
							if($(this).val() == 'all') {
								that.valueContainer = [];
								that.valueContainer.push($(this).val())
								return false;           
							} else {
								that.valueContainer.push($(this).val())
							}  
						});
						//console.log(that.valueContainer);
						return that.valueContainer;
				}
			};
			
			layoutSettingsObject.layout = layoutSetting.value; 
			layoutSettingsObject.theme = themeSetting.value; 
			layoutSettingsObject.component = componentSetting.getValues();
			layoutSettingsObject.frequency = personalizationSettingObj.frequencyVal;

			//console.log(layoutSettingsObject);
			//console.log(personalizationSettingObj);
			
			dureUtil.storeAtLocal(personalizationSettingObj.userEmail, layoutSettingsObject);
				
			if(dureApp.emailId) {
				
				dureApp.updateUserPersonalizationSetting(personalizationSettingObj, layoutSetting, themeSetting);			
			}

			if(!dureApp.emailId) {
				//window.location.href = "home.html";
				$('#body-content').load('home.html');
			}
			//window.location.href = "home.html";
		});		
	}

	// Update template theme
	dureApp.setTheme = function(theme) {
		var themeObj = {color:'blue', prefix:'skin'};
		if(theme) {
			themeObj.color = theme;
			$("body").removeClass("skin-blue skin-black skin-themeblue skin-red skin-green");
			$("body").addClass(themeObj.prefix + '-' + themeObj.color);
			//$("body").addClass(themeObj.prefix + '-black');
		}
	}
	
	dureUtil.applyLayoutSettings = function() {
		
		var defaultLayoutSetting;

		if(dureApp.emailId && dureUtil.checkIfKeyExsist(dureApp.emailId)) {

			defaultLayoutSetting = dureUtil.retrieveFromLocal(dureApp.emailId);
			
		} else {

			defaultLayoutSetting = dureUtil.retrieveFromLocal('public_profile');
		}

		if(defaultLayoutSetting.layout == "vertical") {

			$('#body-content').load('home.html', function() {
				dureUtil.callSidebarMenuComponent(dureUtil.indicatorName); 	
				dureUtil.initialize();
						$.getScript("http://maps.googleapis.com/maps/api/js?sensor=true&language=en&v=3.14&callback=dureUtil.getDataForComponents")
						.done(function (script, textStatus) {           
							// Google Layer
							//alert("Google map script loaded successfully");
							//iHealthMap.ggl = new L.Google();
							
							console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!! get script google api done !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
						})
						.fail(function (jqxhr, settings, ex) {
							//alert("Could not load Google Map script: " + jqxhr);
							//iHealthMap.ggl = null;
							
							dureUtil.getDataForComponents();
						});
			});
			
		}

		if(defaultLayoutSetting.layout == "horizontal") {
			
			$('head').append('<link rel="stylesheet" href="css/slick-view.css" type="text/css" />');
			$('#body-content').load('home.html', function(){
				$('.carousel').slick();
				dureUtil.callSidebarMenuComponent(dureUtil.indicatorName); 
				dureUtil.initialize();
				$.getScript("http://maps.googleapis.com/maps/api/js?sensor=true&language=en&v=3.14&callback=dureUtil.getDataForComponents")
						.done(function (script, textStatus) {           
							// Google Layer
							//alert("Google map script loaded successfully");
							//iHealthMap.ggl = new L.Google();
							
							console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!! get script google api done !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
						})
						.fail(function (jqxhr, settings, ex) {
							//alert("Could not load Google Map script: " + jqxhr);
							//iHealthMap.ggl = null;
							
							dureUtil.getDataForComponents();
				});

			});
			
		}

		if(defaultLayoutSetting.layout == "tab") {
			$('head').append('<link rel="stylesheet" href="tab/css/theme-blue2.css" type="text/css" />');
			$('head').append('<link rel="stylesheet" href="tab/css/customstyles.css" type="text/css" />');
			$('head').append('<link rel="stylesheet" href="./application/style.css" type="text/css" />');
			$('head').append('<link rel="stylesheet" href="tab/assets/joyride/joyride-2.1.css" type="text/css" />');
			
			//window.location.href = "tab.html";
			setTimeout(function(){ 
				$('#body-content').load('tab.html', function() {
					$(document).ready(function(){
						
						dureUtil.callSidebarMenuComponent(dureUtil.indicatorName); 
						dureUtil.setAppInfOnWindow();				
   						dureUtil.initialize();
   						$.getScript("http://maps.googleapis.com/maps/api/js?sensor=true&language=en&v=3.14&callback=dureUtil.getDataForComponents")
						.done(function (script, textStatus) {           
							// Google Layer
							//alert("Google map script loaded successfully");
							//iHealthMap.ggl = new L.Google();
							
							console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!! get script google api done !!!!!!!!!!!!!!!!!!!!!!!!!!!!');
						})
						.fail(function (jqxhr, settings, ex) {
							//alert("Could not load Google Map script: " + jqxhr);
							//iHealthMap.ggl = null;
							
							dureUtil.getDataForComponents();
						});
   						
					});
				});
			}, 300);
		}

		dureApp.setTheme(defaultLayoutSetting.theme);          // Change the color of theme seleted by the user

		if(defaultLayoutSetting.layout == "tab") {
			//dureApp.setTheme('blue');
			dureApp.setTheme = function(theme) {
				var themeObj = {color:'red', prefix:'skin'};
				if(theme) {
					themeObj.color = theme;
					$("body").removeClass("skin-blue skin-black skin-themeblue skin-red skin-green");
					$("body").addClass(themeObj.prefix + '-' + themeObj.color);
					//$("body").addClass(themeObj.prefix + '-black');
				}
			}
		}
	}

	dureApp.setUserRoleId = function() {
		var userinfo = localStorage.getItem("userJson");
		if(userinfo != null) {
			//set roleid 
			$.each(JSON.parse(userinfo), function(index, element) {
				if(index == "roleid") {
					dureUtil.setRoleId(element);
				}
			});
		} 
	};
	
	// START : LoadLayout Function
	function loadLayout() {
		/* For demo purposes */
		var demo = $("<div data-original-title='Settings' data-toggle='modal' data-target='.userFilterLayout' />").css({
			position: "fixed",
			top: "45px",
			right: "0",
			background: "rgba(0, 0, 0, 0.7)",
			"border-radius": "5px 0px 0px 5px",
			//padding: "6px 15px",
			"font-size": "16px",
			//"z-index": "999999",
			cursor: "pointer",
			color: "#ddd"
		})//.html("<i class='fa fa-gear'></i>").addClass("no-print");

		var demo_settings = $("<div />").css({
			"padding": "10px",
			position: "fixed",
			top: "34px",
			right: "-200px",
			background: "#fff",
			border: "3px solid rgba(0, 0, 0, 0.7)",
			"width": "200px",
			"z-index": "999999"
		}).addClass("no-print");
		demo_settings.append(
			"<h4 style='margin: 0 0 5px 0; border-bottom: 1px dashed #ddd; padding-bottom: 3px;'>Layout Options</h4>" + "<div class='form-group no-margin'>" + "<div class='.checkbox'>" + "<label>" + "<input type='checkbox' name='fixlayoutBtn'/> " + "Fixed layout" + "</label>" + "</div>" + "</div>"
		);
		demo_settings.append(
			"<h4 style='margin: 0 0 5px 0; border-bottom: 1px dashed #ddd; padding-bottom: 3px;'>Skins</h4>" + "<div class='form-group no-margin'>" + "<div class='.radio'>" + "<label>" + "<input name='skins' type='radio' data-skin = 'skin-black' onchange='change_skin(\"skin-black\")' /> " + "Black" + "</label>" + "</div>" + "</div>"

			+ "<div class='form-group no-margin'>" + "<div class='.radio'>" + "<label>" + "<input name='skins' type='radio' data-skin = 'skin-blue' onchange='change_skin(\"skin-blue\");' checked='checked'/> " + "Blue" + "</label>" + "</div>" + "</div>" 
			
			+ "<div class='form-group no-margin'>" + "<div class='.radio'>" + "<label>" + "<input name='skins' type='radio' data-skin = 'skin-green' onchange='change_skin(\"skin-green\");'/> " + "Green" + "</label>" + "</div>" + "</div>" 

			// + "<div class='form-group no-margin'>" + "<div class='.radio'>" + "<label>" + "<input name='skins' type='radio' data-skin = 'skin-themeblue' onchange='change_skin(\"skin-blue\");' /> " + "Aqua blue" + "</label>" + "</div>" + "</div>"

			+ "<div class='form-group no-margin'>" + "<div class='.radio'>" + "<label>" + "<input name='skins' type='radio' data-skin = 'skin-red'  /> " + "Red" + "</label>" + "</div>" + "</div>"
		);

		demo.click(function() {
			if (!$(this).hasClass("open")) {
				//$(this).css("right", "200px");
				//demo_settings.css("right", "0");
				$(this).addClass("open");
			} else {
				//$(this).css("right", "0");
				//demo_settings.css("right", "-200px");
				$(this).removeClass("open")
			}
		});

		$("body").append(demo);
		//$("body").append(demo_settings);
	}// END : LoadLayout Function

	function change_layout() {
		$("body").toggleClass("fixed");
		fix_sidebar();
	}

	function change_skin(cls) {
		
		$("body").removeClass("skin-blue skin-black skin-themeblue skin-red skin-green");
		$("body").addClass(cls);
	}

	$(document).ready(function() {

		$('input[type="checkbox"][name="fixlayoutBtn"]').on('ifChanged', function(event) {
			//alert(0);
			$("body").toggleClass("fixed");
			fix_sidebar();

		});

		$('input[type="radio"][name="skins"]').on('ifChanged', function(event) {

			$("body").removeClass("skin-blue skin-black skin-themeblue skin-red skin-green");
			$("body").addClass($(this)[0].attributes[2].value);
		  
			//console.log($(this)[0].attributes[2].value);  

		});
	});
	
	$(document).ajaxStart(function(){
		//$("#ihmap").addClass('block-component');
		 $('#mapcontainer').block({ 
          message: '<h5>Loading...</h5>', 
          css: { 
           border: 'none', 
           padding: '15px', 
           backgroundColor: '#000', 
           '-webkit-border-radius': '10px', 
           '-moz-border-radius': '10px', 
           opacity: .5, 
           color: '#fff' 
         }
});
		}).ajaxStop(function(){

			$('#mapcontainer').unblock();
			
		});


	/*** First Load ***/
	
	loadLayout();
	dureUtil.getApplicationProfile();
	dureApp.setUserRoleId();
	console.log("RoleId: "+dureUtil.roleId);
	/* dureUtil.initialize();
	dureApp.setUserRoleId();
	console.log("RoleId: "+dureUtil.roleId);
	dureApp.userPersionalizationSetting();
	dureUtil.applyLayoutSettings();	 */

	/*** First Load ***/
	
	// To make the header of embeded popup box collapsible.
	$(document).on('click','.collapsibleHeader',function(){
		console.log("Inside the embed header.");
		//Find the box parent
		var box = $(this).parents(".box").first();
		//Find the body and the footer
		var bf = box.find(".box-body, .box-footer");
		if (!box.hasClass("collapsed-box")) {
			box.addClass("collapsed-box");
			//Convert minus into plus
			$(this).find(".fa-minus").removeClass("fa-minus").addClass("fa-plus");
			bf.slideUp();
		} else {
			box.removeClass("collapsed-box");
			//Convert plus into minus
			$(this).find(".fa-plus").removeClass("fa-plus").addClass("fa-minus");
			bf.slideDown();
		}
	});
	
	/* NEW SIDE BAR MENU CLICK EVENT STARTS HERE */
	$(document).on('click','.sidebar-menu a',function() {

		var $this = $(this),
		$bc = $('<li class="item"></li>');        

		if($this.hasClass('indicator')){

			dureApp.titleObj = $(this);
			
			/*if(event == undefined){
				event = window.event;
			}
			event.stopPropagation();*/
			
			iHealthMap.unsetFilter();
			var check,targetId,target_id,targetRes,indicatorRes,indicatorId;
			indicatorId = $(this).attr('id');
			/*----------------- Commented for VIEW HUB ----------------*/
			//targetId = $(this).parents('.treeview').first().siblings('li').find('.target').attr('id');
			targetId = $(this).parents('.treeview').first().find('.target').attr('id');
			console.log(targetId);
			$('#sliderPause').trigger('click');
			targetRes = targetId.split("_");
			indicatorRes = indicatorId.split("_");
			dureUtil.setIndicatorMenuId(indicatorId)
			target_flag = dureUtil.setTargetId(parseInt(targetRes[1]));
			indicator_flag = dureUtil.setIndicatorId(parseInt(indicatorRes[1]));
			console.log(indicator_flag);
			dureUtil.setIndicatorYearLimits(dureUtil.appProfile.indicatorMinMaxYear);
			$.noty.closeAll();
			if(indicator_flag){
				//console.log("Data Level == ");
				console.log(dureUtil.getDataLevel());
				// Fix Me :(
				dureUtil.setDataLevel('world');
				dMap.setLevel('world');
				
				if(dureUtil.getDataLevel() == 'world'){
					dMap.setLevel('world');
					iHealthMap.map.setView(new L.LatLng(iHealthMap._lat,iHealthMap._long), 2);
					dureUtil.getWorldIndicatorData();
					
				}else{
					dMap.setLevel('country');
					dureUtil.getIndicatorData(); 
				}
			}
			
			$this.parents('li').each(function(n, li) {
				var $a = $(li).children('a').clone();
				
				if(n == 0){
					$bc.prepend(' <a href="#"><i class="fa fa-angle-double-right"></i><b>'+$a.eq(0).text()+'</b></a> ');
				}else{
					$bc.prepend(' <a href="#"><i class="fa fa-angle-double-right"></i>' + $a.eq(0).text() + '</a> ');         
				}
				
			});
			$('.breadcrumb').html($bc.prepend('<a href="#"><i class="fa fa-th"></i> Home</a>'));
			
		}else{
		
			$this.parents('li').each(function(n, li) {
				var $a = $(li).children('a').clone();
				//$bc.prepend(' <a href="#"><i class="fa fa-angle-double-right"></i></a> ', $a.eq(0).text());
					
				if(n == 0){
					$bc.prepend(' <a href="#"><i class="fa fa-angle-double-right"></i><b>' + $a.eq(0).text() + '</b></a> ');
				}else{
					$bc.prepend(' <a href="#"><i class="fa fa-angle-double-right"></i>' + $a.eq(0).text() + '</a> ');         
				}
				
			});
			$('.breadcrumb').html($bc.prepend('<a href="#"><i class="fa fa-th"></i> Home</a>'));

		}	
		//return false;	
	});
	/* NEW SIDE BAR MENU CLICK EVENT ENDS HERE */
});
// END OF HEAD

// Get REGION-DATA for the selected target so data can be used to displayed wherever required.
dureApp.getRegionDataForTarget = function(target_id) {
    console.log(target_id);
    console.log(dureUtil.checkKeyForTarget(target_id));

    dureUtil.checkUserAuthentication();
    return true;
};

// Displays dialog box to show message 
dureApp.showDialog = function(message,type){
	
	if(type == 'info'){		
		jNotify(message,{TimeShown:5000});
	}else if(type == 'error'){
		jError(message,{TimeShown:5000});
	}else if(type == 'success'){
		jSuccess(message,{TimeShown:5000});
	}
};

//   ********************************* Personalization Settings  ************************************* //

dureApp.updateUserPersonalizationSetting = function(personalizationSettingObj, layoutSetting, themeSetting) {
	
	//alert('updateUserPersonalizationSetting');
	//console.log(personalizationSettingObj);
	// components currently is all // TODO
var requestObj = {};
    requestObj.username = 'TIRSP';
    requestObj.password = 'Tirsp111';
    requestObj.callbkStr = '&callback=ux.personalizationUpdate';
    requestObj.serviceUrl = dureUtil.AppBaseURLContext +'personalization/update/?' 
                         // +  'email=' + personalizationSettingObj.userEmail
                         +  'email=admin@duretechnologies.com'
                         +  '&appid=' + dureUtil.appId
                         +  '&theme=' + themeSetting.value
                         +  '&layout=' + layoutSetting.value
                         +  '&component=all'
                         +  '&frequency=' + personalizationSettingObj.frequencyVal                        
                         +   requestObj.callbkStr;
						 
$.ajax({
        type:'Get',
        url:requestObj.serviceUrl,
        contentType: 'application/json',
        dataType: 'jsonp',
        crossDomain : true,
        xhrFields: {
            withCredentials: true
        },
        username : requestObj.username,
        password :requestObj.password,
        success: function(success){
           // console.log(success);
        },
        error: function (request, textStatus, errorThrown) {
           // console.log(errorThrown);
        }
    }); 

}

var ux = {};

// callback for Personalization Settings
ux.personalizationUpdate = function(response) {

    if(response.status == 'success'){
		
		//window.location.href = '';
		location.reload(true);
		//alert(response.status);
		//dureLayout.applyLayoutSettings();
		//dureUtil.applyLayoutSettings();
    }
}

// callback for Personalization Settings
function personalizationUpdate(response) {
    console.log(response);
}

//   ********************************* Personalization Settings End ************************************* //