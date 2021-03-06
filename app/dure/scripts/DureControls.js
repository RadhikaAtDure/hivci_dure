var dureControl = {};

//Initialize function
dureControl.initialize = function(){
	
	dureControl.hideRegionDropDown();
	dureControl.prepareDropdown(); // Prepare country list dropdown.
	dureControl.addHeaderHtml();
	dureControl.countrySelect();

};

// On click of region drop-down , region-based countries will populate in the country dropdown.
$('.select-region').on('click',function() {   

	  console.log("After Click ---> Get countries for WHO regions .....");
	  
	  var regionCountries = [];
	  dureComUtil.regionCode = $(this).attr('region-code'); 
	  dureComUtil.regionTitle = $(this).text(); 

	  $('.region-title-box').html('<strong>' + dureComUtil.regionTitle + '</strong>');
	  $('.region-error-info-box').hide();
	  $('.region-title-box').show();
	  
	  if(dureComUtil.regionCode != ''){
		  
		  regionCountries = dureControl.getCountriesForRegion(dureComUtil.regionCode); 
		  dureControl.buildDropDown(regionCountries);
		  
	  }else{
		  
		  dureControl.prepareDropdown();
	  }
 });


// Returns Prepared Dropdown.
dureControl.prepareDropdown = function(){
	
	var dropDownList = "", countryList = [], userCountryIdList = [];
	dureComUtil.countryList = []
	
	if(dureUser.checkUserLoginStatus()){		
		var userinfo = dureUser.getUserInfo();
		userCountryIdList = userinfo.countryIdList		
	}
		
	$.each(dureComUtil.geoJson.features, function(index, val) {
		
		var countryDropdownURL = '', countryObj = {};	
		
		var countryId = parseInt(val.properties.country_id);
		
		if(userCountryIdList.length != 0){		
			
			if(userinfo.roles[0] == 7){
				
				if($.inArray(countryId,userCountryIdList) > -1){				
						
					countryObj['countryId'] = countryId;
					countryObj['name'] = val.properties.name;
					if(countryObj['countryId'] != undefined){
						
						dureComUtil.countryIDArray.push(countryObj['countryId']);	
					}				
						
					countryList.push(countryObj);				
				}				
				
			}else{
				
					countryObj['countryId'] = countryId;
					countryObj['name'] = val.properties.name;
					if(countryObj['countryId'] != undefined){
						
						dureComUtil.countryIDArray.push(countryObj['countryId']);	
					}				
						
					countryList.push(countryObj);
			}
			
		}else{
			
				countryObj['countryId'] = countryId;
				countryObj['name'] = val.properties.name;
				if(countryObj['countryId'] != undefined){
					dureComUtil.countryIDArray.push(countryObj['countryId']);	
				}
				countryList.push(countryObj);	
		}
			
	});
	
	dureComUtil.sortData(countryList);	
	dureComUtil.countryList = countryList;
	
	var last_uri_segment = location.pathname.split("/").pop();

	$.each(countryList,function(index,countryObj){

			countryDropdownURL = Base64.encode('countryid='+countryObj.countryId);			
			dropDownList += '<li><a href="'+last_uri_segment+'?'+ countryDropdownURL +'">'+countryObj.name+'</a></li>';
			dureComUtil.countryListStr += countryObj.name+', ';
		
	});
	
	$('#countrySelectorList').html(dropDownList);		
};

dureControl.selectCountryDropDownOptions = function(valueType){
	
	
	var options = "<option value='0'>All Countries</option>";

	if(valueType == 'NUMBER'){
		
		$.each(dureComUtil.countryList,function(index,countryObj){

			options += '<option value="'+countryObj.countryId+'" >'+countryObj.name+'</option>';
		});
	}else{
		
		$.each(dureComUtil.countryList,function(index,countryObj){

			options += '<option value="'+countryObj.name+'" >'+countryObj.name+'</option>';
		});
	}

	return options;
}

// Get countries by region in dropdown
// Parameter: Region Code (string)

dureControl.getCountriesForRegion = function(regionCode){
	
	console.log("<--- Region based countries --->");
	
	var geojson = dureComUtil.geoJson;
	
	dureControl.countriesFromRegion = [];
	if(geojson != undefined){
		
		$.each(geojson.features,function(index,countryObj){
			
			if(regionCode != '' && regionCode == countryObj.properties['world_region_code']){

				var country = {};
				country.id = countryObj.properties['country_id'];
				country.name = countryObj.properties.name;
				
				dureControl.countriesFromRegion.push(country);		
			}
		});
		 
		dureComUtil.sortData(dureControl.countriesFromRegion);

		return dureControl.countriesFromRegion;
		
	}else{
		
		console.log(" Geojson is undefined. ")
	}
};


dureControl.buildDropDown = function(regionCountries){	
	
	var dropDownHtml = "";
	
	if(regionCountries != undefined){
		
		// Build Dropdown.
		$.each(dureControl.countriesFromRegion,function(index,countryObj){
			
			var currentUrl = window.location.href;
			var lastSegment = currentUrl.split('/').pop();
			var filename = (lastSegment.indexOf('?')  > -1) ? lastSegment.substr(0,lastSegment.indexOf('?')) : lastSegment;
			var queryString = Base64.encode('countryid='+countryObj.id);
			
			dropDownHtml += '<li><a href="'+filename+'?'+ queryString +'">'+ countryObj.name +'</a></li>';
		});
		
		$('#countrySelectorList').html(dropDownHtml); 
	}
};

dureControl.addHeaderHtml = function(){
	
	var countryPty = dureComUtil.getCountryProperty();
	
	console.log(countryPty);
	
	var iso2 = countryPty.iso_a2;
	console.log(iso2);
	var countryName = countryPty.name;
//Appending country name//
	/*var title = $(document).prop('title');
	$(document).prop('title', title +' | '+ countryName);*/

	//the end Appending country name//
	var dashboardHeader = '';
	dashboardHeader += '<span class="f32"><span class="flag '+iso2.toLowerCase()+'"></span></span> '+countryName;
	
	//dynamic class for flag in print mode
	// $('.random span').addClass(iso2.toLowerCase())

	 $(".random").append(dashboardHeader);

/*	var title = $(document).prop('title');
	$(document).prop('title', title +' | '+ countryName + dashboardHeader);
*/
	console.log(dashboardHeader);
	$('#dashboard-header').html(dashboardHeader);
};

dureControl.hideRegionDropDown = function(){
	
	console.log("HIding dropdown for regional Admin...")
	var userInfo = dureUser.getUserInfo();
	if(userInfo != null){
		
		var userRoleId = userInfo.roles[0];	
		if(userRoleId == 7){
			
			$('.regionDropDown').hide();
			$('.region-title-box').hide();
		}		
	}
};

// Builds html option for selectdropdown.
dureControl.countrySelect = function(){
	
	var countryDropDownOpt  = dureControl.selectCountryDropDownOptions();	
	$(".countrySelect").append(countryDropDownOpt);
}