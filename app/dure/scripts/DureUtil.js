var dureUtil = {};
var dureMasterRegionList = {};
// To initialize the values
// Ivizard Global (By default world level)

dureUtil.initialize = function() {
	dureUtil.appId = dureConfig.getUserAppId();
	dureUtil.targetId = dureConfig.getUserTargetId();
	dureUtil.targetMenuId = "T_" + dureConfig.getUserTargetId();
	dureUtil.langId = 1;
	dureUtil.roleId = 1;
	dureUtil.emailId = dureConfig.getAdminEmail();
	dureUtil.regionId = 0;
	dureUtil.indicatorId = dureConfig.getUserIndicatorId();
	dureUtil.indicatorName;
	dureUtil.indicatorNameInfoExt;
	dureUtil.indicatorMenuId = "I_" + dureConfig.getUserIndicatorId();
	dureUtil.dataLevel = dureConfig.getUserAppLevel();
	dureUtil.defaultLocationId;
	dureUtil.defaultLocationISO;
	dureUtil.defaultLocationName;
	dureUtil.countryRegionid;
	dureUtil.countryId;
	dureUtil.provinceId;
	dureUtil.districtId;
	//dureUtil.appProfile = {};
	dureUtil.targetData = {};
	dureUtil.targetMinYear = '';
	dureUtil.targetMaxYear = '';
	dureUtil.indicatorMaxYear = '';
	dureUtil.indicatorMinYear = '';
	dureUtil.rangeOfYears = '';
	dureUtil.circleMarkerRadiusMax = 10;
	dureUtil.worldJsonData = '';
	dureUtil.respJsonData = {};
	dureUtil.countryList = [];
	dureUtil.indicatorMetaInfo = null;
	dureUtil.AppBaseURL = dureConfig.AppBaseURL;
	dureUtil.AppBaseURLContext = dureConfig.AppBaseURLContext;
	dureUtil.geoJson = {};
	dureUtil.geoJsonFileUrl = '';
	 // for disputed areas
 dureUtil.maskGeoJson = null;
 dureUtil.maskGeoLayer = null;
	// Seperate Countries according to their scale value
	dureUtil.scaleRangeCat = { regionList: {}, apply: true};                           //TODO 18/03/2015
	// Activate indicator level for world level data . 1 = Active (Indicator Data) 0 = Inactive (Target Data)
	dureUtil.isActiveIndicatorLevel = 1;
	dureUtil.worldIndicatorDataLocalArray = [];
	dureUtil.countryDrillDownDataLocalArray = [];
	dureUtil.provinceDrillDownDataLocalArray = [];
	dureUtil.districtDrillDownDataLocalArray = [];
	//dureUtil.getApplicationProfile();
	dureUtil.temp_accessFilePaths = null;
}

/*
	Author: Shone Johnson
	Date: 10-12-14
	Description: Fetches list of countries in a particular regions. Example:- Gavi region , Non-Gavi region ,Euro-region and their countries.
*/
dureUtil.callRegionListService = function(){

	console.log("===============Region List Service.==============");

	if(dureUtil.checkIfKeyExsist('RegionList')) {

		console.log("========== Using Local Region List ==========");
		resp = dureUtil.retrieveFromLocal('RegionList');
		callback_GetRegionList(resp, 'local')
	} else {

		console.log("========== Calling Service Region List ==========");

		var serviceUrl = (dureUtil.AppBaseURLContext || dureConfig.AppBaseURLContext) + 'api/gavinongavi/?callback=callback_GetRegionList';
		//console.log(serviceUrl);
		$.ajax({
			type:'GET',
			url:serviceUrl,
			dataType: 'jsonp',
			contentType: 'application/json',
			crossDomain : true,
			xhrFields: {
				withCredentials: true
			},
			error: function (request, textStatus, errorThrown) {
				//console.log(request.responseText);
				//console.log(textStatus);
				//console.log(errorThrown);
			}
		});
	}
};

// Callback that fetches response for list of regions.
function callback_GetRegionList(response, location){

	if(location != 'local'){

		dureUtil.storeAtLocal('RegionList', response);
	}

	console.log("===========Response for Region List Service.=============");
	if(response != undefined){

		// Store the response of list of regions in a global variable.
		dureMasterRegionList = response.regionList;
		//console.log(dureMasterRegionList);

		// Prepare Html-string for dropdown list.
		dureUtil.prepareRegionCountryListHtml(dureUtil.getIndicatorCountryList());
	}

	//Calling service for fetching world data.
	dureUtil.getWorldIndicatorData();
}

dureUtil.setAppInfOnWindow = function(){

	 //$('.appName').text(dureUtil.appInfo.applicationName); commented by swapnil to apply the logo image

	// Hard coding menus for view hub.
	/* if(dureUtil.appInfo.applicationName == 'View Hub'){
		console.log("Hiding sidebar options.");
		$(".sidebar-menu > [class='_hideOption']").hide();
	} */
}

// Calling data for components......
dureUtil.getDataForComponents = function(){

	console.log("================Fetching data components from application info.==================");

	if(dureUtil.getDataLevel() == 'world'){

		// Set Country level for map.
		dMap.setLevel('world');

		// Fetches file url for fetching geojson data.
		dureUtil.geoJsonFileUrl = dureUtil.getFileUrl('geojson','world');

		console.log('============== World GeoJSON file url================');
		console.log(dureUtil.geoJsonFileUrl);

		if(dureUtil.geoJsonFileUrl != undefined){
			// Fetch geojson data from respective json file.
			//dureUtil.getGeoJsonData();
			dureUtil.geoJson = worldGeo; // worldGeo is a global var in worldGeo.js so save this extra call
		}
		//Calling service for fetching country data.
		//dureUtil.getIndicatorData();
		dureUtil.callRegionListService();
	} else if (dureUtil.getDataLevel() == 'country') {

		// Set Country level for map.
		dMap.setLevel('country');

		var countryId = dureUtil.getCountryId();
		var countryISO = dureUtil.getCountryIsoFromID(countryId);

		// Fetches file url for fetching geojson data.
		dureUtil.geoJsonFileUrl = dureUtil.getFileUrl('geojson','country', countryISO);

		console.log('============== Country GeoJSON file url================');
		//console.log(dureUtil.geoJsonFileUrl);

		if(dureUtil.geoJsonFileUrl != undefined){
			// Fetch geojson data from respective json file.
			dureUtil.getGeoJsonData();
		}

		//Calling service for fetching country data.
		dureUtil.getIndicatorData();
	}
};

dureUtil.setDefaultValueForLayoutSettingControl = function(){
	var defaultLayoutSetting;

	if(dureUtil.emailId && dureUtil.checkIfKeyExsist(dureUtil.emailId)) {

		defaultLayoutSetting = dureUtil.retrieveFromLocal(dureUtil.emailId);

	} else {
		defaultLayoutSetting = dureUtil.retrieveFromLocal('public_profile');
	}

	//console.log(defaultLayoutSetting);

	$("input[value='"+defaultLayoutSetting.layout+"']").prop('checked', true);
	$("input[value='"+defaultLayoutSetting.theme+"']").prop('checked', true);
	$("input[value='"+defaultLayoutSetting.frequency+"']").prop('checked', true);
	//$("input[value='"+defaultLayoutSetting.component+"']").prop('checked', true);
}

// Fetches the url for the file type and correseponding data level.
dureUtil.getFileUrl = function(type, level, countryISO){                    // 16/3/2015

	var url = '';
	if(type != undefined){

		if (level == 'world') {
			url = 'data/world.geo.json';
		} else if(level == 'country') {
			if(countryISO) {
				url = 'data/countries/' + countryISO + '.geojson';
			}
		}
	}
	return url;
}

dureUtil.callComponents = function(componentData){
	var components = {};
	console.log('=========Called component data==========');
	//console.log(componentData);   // TODO change componentData.extractedObjects.worldIndicatorDataExt to componentData.extractedObjects.worldIndicatorData
	if(componentData != undefined){

		dureUtil.scaleRangeCat = { regionList: {}, apply: true};

		if (componentData.extractedObjects.worldIndicatorData != undefined) {
			// Sets data for map and Call MAP component.
			if(iHealthMap.setDataForMap(componentData.extractedObjects.worldIndicatorData) && ($('#ihmap').length > 0)){
				dureUtil.callMapComponent(componentData.extractedObjects,componentData); // TO DO : Fix Me
			}
			//console.log(componentData.extractedObjects.summaryData);
			dureUtil.loadInitialRegionSummaryData(componentData.extractedObjects.summaryData);			// TODO 16/3/2015
			// Set piechart data and then call Chart component.                //TODO 16/3/2015
			 if(dureUtil.preparePieChartData(componentData.extractedObjects.worldIndicatorData[0][iHealthMap.getCurrentyear()])){
				//dureUtil.callChartComponent('pie');
				loadPieChart(); //TODO
			}
			// Set table data and Call TABLE component.
			if(iHealthTable.setData(componentData)){

				dureUtil.callTableComponent();
			}
			// Set overlay data and Call overlay component.
			if(dureOverlays.setData(componentData)){
				dureUtil.currentFormattedJSONDataTemp = componentData;
				dureOverlays.initialize();
			}
		} else if (componentData.extractedObjects.worldIndicatorDataExt != undefined) {
            // Sets data for map and Call MAP component.
            if(iHealthMap.setDataForMap(componentData.extractedObjects.worldIndicatorDataExt) && ($('#ihmap').length > 0)){
                dureUtil.callMapComponent(componentData.extractedObjects,componentData); //TO DO : Fix Me
            }
            // Set piechart data and then call Chart component.
            if(dureUtil.preparePieChartData(componentData.extractedObjects.worldIndicatorDataExt[0][iHealthMap.getCurrentyear()])){
                //dureUtil.callChartComponent('pie');
				loadPieChart(); //TODO
            }
            // Set table data and Call TABLE component.
            if(iHealthTable.setData(componentData)){
                dureUtil.callTableComponent();
            }
			// Set overlay data and Call overlay component.
            if(dureOverlays.setData(componentData)){
                dureOverlays.initialize();
            }
        }

		dureUtil.scaleRangeCat.apply =  false;  //
	}
};

/***************************************** Section: FORMAT/PREPARE object for system ***************************************/

// Prepares/Edit object as per requirement or format.
dureUtil.prepareApplicationObjects = function (data){

	console.log('===================Prepare application objects====================');
	//console.log(data);
	// Set Application Data
	if(data.applications != undefined){

		// Check if data exist in local storage
		// Or set in global variable/local storage.
		for(var key in data.applications){
			if(data.applications[key].applicationId == dureConfig.getUserAppId()){

				// Set data in global
				dureUtil.appInfo = data.applications[key];
				break;
			}
		}
	}
	// Set Target related info.
	if(data.targetMinMaxYear.targets != undefined && data.targetMinMaxYear.targets.length != 0){
		dureUtil.setTargetInfo(data.targetMinMaxYear.targets);
		dureUtil.setTargetYearLimits(data.targetMinMaxYear.targets);
	}
	// Set Indicator related info.
	if(data.indicatorMinMaxYear.indicators != undefined && data.indicatorMinMaxYear.indicators.length != 0){
		dureUtil.setIndicatorInfo(data.indicatorMinMaxYear.indicators);
		dureUtil.setIndicatorYearLimits(data.indicatorMinMaxYear.indicators);
	}
	// Set Country List
	if(data.indicatorCountryList.countries != undefined){
		dureUtil.setIndicatorCountryList(data.indicatorCountryList.countries);
	}
	// Set Colors and Scale
}

// Prepare objects as per Chart.
dureUtil.prepareChartObjects = function(param,type,isocode,level){

	console.log("Creating chart object ------");
	//console.log(param);
	//console.log(type);
	var check = false;
	if(type == 'region'){
		check = prepareRegionData(isocode);
		//console.log(check);
	}else if( type == 'regionSummary'){
		check = prepareRegionSummaryData();
	}

	if(check){
		return true;
	}

	//Prepare Region Summary data .
	function prepareRegionSummaryData(){
		var regionSummary,key;
		if(level == 'target'){
			regionSummary = param.data.regions[1].regionSummaryData[0];
			key = 'regionSummaryData_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.regionId;
		}else{

			regionSummary = param[0];
			key = 'regionSummaryData_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.indicatorId+'_'+dureUtil.regionId;
		}
		if(dureUtil.retrieveFromLocal(key) == undefined){

			dureUtil.setRegionSummaryDataForChart(regionSummary);
		}
		return true;
	}

	// Prepare Region level data .
	function prepareRegionData(isocode){
		console.log("================= Preparing region data on click of function. ===================");
		//console.log(param);
		//console.log(dureUtil.getDataLevel());
		var region;
		if(dureUtil.getDataLevel() == 'world'){
			//console.log(param)
			region = param[0];                      // TODO 16/3/2015
		}else if(dureUtil.getDataLevel() == 'country'){
			//console.log(param);
			if (iHealthMap.getIndicatorDataType() == "Standard") {
				region = province.jsondata.indicators[1].indicatorData[0];
			} else {
				region = province.jsondata.indicators[1].indicatorDataExtension[0];
			}
		}else if(dureUtil.getDataLevel() == 'province'){
			region = param.indicators[2].districtIndicatorData[0];
		}else if(dureUtil.getDataLevel() == 'subprovince'){
			region = param;
		}
		var key = 'regionData_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.regionId;
		if(dureUtil.retrieveFromLocal(key) == undefined){
			dureUtil.setRegionDataForChart(region,isocode);
		}
		return true;
	}
};

//Prepare pie chart objects.
dureUtil.preparePieChartData = function(data){
	console.log('Prepare chart data');
	var pie = {};
	if(data != undefined){
		pie.data = data;
		pie.key = 'regionSummaryData_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.regionId;
		pie.labelLength = '';
		pie.title = '';
		pie.valueArr = [];
		pie.dataset = {};
		// Get length of the array of labels in a country i.e. get number of columns
		for(var k in pie.data[0]){
			if(pie.data[0][k][1] != undefined){
				pie.labelLength = pie.data[0][k][1].length;
				break;
			}
		}
		// Get unigue values of the label name from label array.
		//console.log(pie.data);
		for(var i = 0; i < pie.labelLength; i++){
			//console.log(pie.data);
			pie.valueArr.push(dureUtil.getUniqueValueForColsFromData(pie.data[0],i));
			//console.log(pie.valueArr);
		}

		// Get title i.e indicator name for the pie chart title.
		pie.title = dureUtil.retrieveFromLocal('metaIndicatorInfo');
		pie.title = JSON.stringify(pie.title['Indicator'+dureUtil.getIndicatorId()].indicatorName);
		// Prepare dataset that needs to be displayed on the chart in json format.
		for(var i=0;i < pie.valueArr[0].length;i++){
			pie.dataset[pie.valueArr[0][i]] = dureUtil.getCountOfCountriesForValue(pie.data,pie.valueArr[0][i]);
		}
		delete pie.labelLength;
		delete pie.data;
		//console.log("Line 230: Pie chart data prepared below:");
		//console.log(pie);
		// Load Summary data for Non Standard data format.
		// dureUtil.loadNonStdDataForRegionSummary(pie.dataset);

		//dureUtil.showOverviewPanelData(pie.dataset);     // FIX ME :(
		dureUtil.storeAtLocal(pie.key,pie);
		return true;
	}
}

dureUtil.getUniqueValueForColsFromData = function(data,index){
	var col = {};
	col.valueArr = [];
	for(var k in data){
		if(data[k][0][index] !=undefined) {
			col.valueArr.push(data[k][0][index]);
		}
	}
	return $.unique(col.valueArr);
}

dureUtil.getCountOfCountriesForValue = function(data,value){

	var i = 0;
	for(var k in data[0]){

		if(data[0][k][0][0] == value){
			i++;
		}
	}
	return i;
}

// To format objects according to need .
dureUtil.formatObjects = function(param){
	//console.log("Param in format obj");
	//console.log(param);
	return dureUtil.getYearsWithData(param);
}

// Function to fetch the keys.
dureUtil.getOnlyKeysFromObject = function(data){
	//console.log("Data required:- ");
	//console.log(data);
	var result = [];
	$.each(data, function(index, val) {
		if (index != '' && val[0].data != undefined) {
			result.push(index);
		}
	});
	return result;
};

// Format data and exclude years with no data
dureUtil.getYearsWithData = function(data) {
	var returnArray = [];
	var objOuterKeys = Object.keys(data);

	for(var i = 0; i < objOuterKeys.length; i++) {
		var innerObj = data[objOuterKeys[i]];

		for(var k in innerObj[0]) {
			if(innerObj[0].hasOwnProperty(k)) {
				if(innerObj[0][k][0].length > 0) {
					returnArray.push(objOuterKeys[i]);
				}
			}
				break;
		}
	}
	//console.log(returnArray);
	return returnArray;
}

dureUtil.prepareRegionCountryListHtml = function(option){
	if(option) {
	var html = '<option></option>';

	var region = [];
	//var inArray = ['Gavi','Non-Gavi'];	// For all regions comment this line.

	$.each(dureMasterRegionList,function(index,regionObject){
		$.each(regionObject,function(regionName,regionData){

			// For all regions comment below lines.
			/* if($.inArray(regionName,inArray) > -1){
				region.push(regionName);
			} */

			region.push(regionName);
		})
	});

	//console.log(region);
	// Build region search group.
	html += "<optgroup label='Region Search'>";
	$.each(region,function(key,value){
		html += '<option class="optgroup" value="'+value+'"  >'+value+'</option>';
	});
	html += '</optgroup>';

	// Build country search group.
	html += "<optgroup label='Country Search'>";
	for(var i=0;i < option.length;i++){
		html += '<option value="'+option[i]+'">'+option[i]+'</option>';
	}
	html += '</optgroup>';
	$('.selectpicker').append(html);
}
}


dureUtil.prepareDerivedData = function(param){
	var derived = {};
	console.log("================Preparing Derived data.==============");
	//console.log(param);
	if(param != undefined){
		derived.data = param;
		derived.result = {};
		derived.resArr = [];

		derived.data = param[0].data[0][2014][0];
		$.each(derived.data,function(k,v){
			derived.result = {};
			derived.result[2014] = v[0][0];
			derived.result.CountryCode = getCountryCode(k);
			derived.result.Country = getCountry(k);
			derived.resArr.push(derived.result);
		});
	}

	function getCountryCode(key){
		var codes = {};
		codes.data = L.codeLookup;
		codes.country = '';
		for(var k in codes.data){
			if(codes.data[k] == key){
				codes.country = k;
				break;
			}
		}
		return codes.country;
	}

	function getCountry(key){
		var country = {};
		country.data = L.countryLookup;
		country.name = '';
		for(var k in country.data){
			if(country.data[k]['alpha-3'] == key){
				country.name = country.data[k].name;
				break;
			}
		}
		return country.name;
	}
	// //console.log(derived.resArr);
	// debugger;
}

/************************************SECTION: Call to Map functionality to system *******************************************/

// Call the map component.
dureUtil.callMapComponent = function(mapData,componentData){

	console.log('========Called map component=========');

	if($('#ihmap').length > 0){

		// Initialising map object only if map object is not defined
		if(iHealthMap.map == undefined){
			dMap.loadMap();
		}

		iHealthMap.legendControlData = componentData.metaInfo.indicatorInfo.levels[0].scales[0].linear[0]; // data for Map Legend for world
		iHealthMap.legendControlData.indicatorName = componentData.metaInfo.indicatorInfo.indicatorName;
		//Render info for map....


		dMap.renderInfoForMap();
		setTimeout(function(){ iHealthMap.map.invalidateSize();}, 2500);        //  map tiles render properly
		//dureUtil.loadInitialRegionSummaryData(mapData.summaryData);			// TODO 16/3/2015
		// Render filter control for map...
		// iHealthMap.renderFilter(mapData.worldIndicatorData);
		// TODO change object mapData.worldIndicatorDataExt to mapData.worldIndicatorData

		// Check if DERIVED DATA exist in SERVICE JSON.
		if(mapData.derivedDataExt != undefined){
			// Prepare derived data extension so as to run overlay controls.
			dureUtil.prepareDerivedData(mapData.derivedDataExt);
		}

		dureOverlays.setData(componentData);
		if(dureUtil.indicatorId == 170 || dureUtil.indicatorId == 168) {
			removeControlBarOverlay();
		 renderBarOverlay();
		}else {
			 removeControlBarOverlay();
		}
	}
};

//Call geoJSON data.
dureUtil.getGeoJsonData = function(){

	console.log("==============Get Geojson file data.==============");


	$.getJSON(dureApp.appPath+dureUtil.geoJsonFileUrl, function(result) {
		dureUtil.geoJson = result;
		//console.log(dureUtil.geoJson);

	}).error(function(jqXHR, textStatus, errorThrown){

		if(jqXHR.status == 404){
			dureApp.showDialog('Province level data not available.','info');
		}
	});

}

// To check whether the user is authenicated user to access the service .
dureUtil.checkUserAuthentication = function(){
	var username = 'admin';
	var password = 'IHEALTH@9028';
	var encodedData = username+':'+password;
	var  authorizationToken = 'Basic '+window.btoa(encodedData);
	var queryString = 'targetid='+dureUtil.targetId+'&appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&regionid='+dureUtil.regionId+'&callback=callback_GetTargetData';
	var serviceUrl = dureUtil.AppBaseURLContext + 'target/all/worldregion/?'+queryString;

	$.ajax({
		type: "GET",
		xhrFields: {
			withCredentials: false
		},
		url:serviceUrl,
		username : username,
		password :password,
		dataType: "jsonp",
		contentType: "application/json",
		crossDomain: true,
		beforeSend: function(xhr){
		    //console.log("beforeSend");
			xhr.setRequestHeader('Authorization', 'Basic '+authorizationToken);
		 },
		 error: function (request, textStatus, errorThrown) {

			//console.log(request.responseText);
			//console.log(textStatus);
			//console.log(errorThrown);
        }
	});
};

// Callback fn to get response of checkUserAuthentication fn.
function callback_GetTargetData(resp){
//console.log("Inside Target Data Call.");
//console.log(resp);
	var target = {};
	if(dureUtil.targetMaxYear != undefined){
		target.summaryData = resp.data.regions[1].regionSummaryData[0][dureUtil.targetMaxYear].data;
	}
	//console.log('getTargetData .....');
	iHealthMap.setDataForMap(resp);
	dureUtil.setCurrentView(dureUtil.targetMenuId);
	dMap.renderInfoForMap();
	// dureUtil.loadRegionSummaryData(resp);
	dureUtil.loadInitialRegionSummaryData(target.summaryData);

	if(dureUtil.prepareChartObjects(resp,'regionSummary','','target')){
		dureUtil.initializeChart();
	}

	//Nath commented here for DEMO
	/*
		if(resp != undefined ){
			if(dureUtil.retrieveFromLocal('Target_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.langId) == undefined){
				//console.log('====================== Storing data in provider ============================');
				dureUtil.storeAtLocal('Target_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.langId,resp);  //conv:- target_appid_targetid_langid_region_id
				if(iHealthMap.setDataForMap(resp)){
					dMap.renderInfoForMap();
				}
			}else{
				dMap.renderInfoForMap();
			}
		}else{
			//console.log("===================Unauthorized Access ==================");
		}
	*/
};

// Gets indicator data for the desired country.
dureUtil.getIndicatorData = function(){
	//console.log("Getting indicator data at country level for desired country");
	var username = 'TIRSP';
	var password = 'Tirsp111';
	var encodedData = username+':'+password;
	var authorizationToken = 'Basic '+window.btoa(encodedData);

	var queryString = 'appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&targetid='+dureUtil.targetId+'&indicatorid='+dureUtil.indicatorId+'&countryid='+dureUtil.countryId+'&countryregionid='+dureUtil.countryRegionid+'&callback=callbackGetIndicatorData';
	//console.log(dureUtil.AppBaseURLContext);
	var serviceUrl = dureUtil.AppBaseURLContext + 'dataapi/indicator/country/data/?'+queryString;
	console.log(serviceUrl);
	/*
	var serviceUrl = dureUtil.AppBaseURLContext+'indicator/country/data/?appid=1&langid=1&targetid=1&indicatorid='+dureUtil.indicatorId+'&countryid=116&countryregionid=10&callback=callbackGetIndicatorData';
	console.log(serviceUrl);
	*/

	$.ajax({
		type: "GET",
		xhrFields: {
			withCredentials: true
		},
		username : username,
		password :password,
		dataType: "jsonp",
		contentType: "application/json",
		crossDomain: true,
		url: serviceUrl,
		beforeSend: function(xhr){
			xhr.setRequestHeader('Authorization', 'Basic '+authorizationToken);
		 }
	});
};

//Callback fn to get response of the above func.
function callbackGetIndicatorData(resp){
	var indicator = {};

	// var currentDataJSON = resp;

	dureUtil.storeAtLocal("CurrentJSONData",resp);
	dureUtil.respJsonData = resp;

	if(resp != undefined){
		console.log("Inside callbackIndicatorDATA");
		//console.log(resp);
		indicator.metaInfo = resp.indicators[0].indicatorInfo;
		indicator.extractedObjects;

		dureUtil.storeAtLocal("CurrentFormattedJSONData",indicator);
		dureUtil.currentFormattedJSONData = indicator;
		dureUtil.currentFormattedJSONDataTemp = null;
		dureUtil.setCurrentView(dureUtil.indicatorMenuId);
		dureUtil.setIndicatorMetaInfo(indicator.metaInfo);
		// iHealthMap.clearMap();

		indicator.extractedObjects = dureUtil.extractDataObjects(resp.indicators);

		// console.log("Setting range of years...")
		dureUtil.setRangeOfYears();
		// console.log(resp.indicators);
		//console.log(indicator.extractedObjects);

		//if(province.setDataForMap(resp)){
		//if(iHealthMap.setDataForMap)                  // Saurabh TODO
		if(iHealthMap.setDataForMap(indicator.extractedObjects)){
			// Initialising map object only if map object is not defined
			if(iHealthMap.map == undefined){
				dMap.loadMap();
			}
			dMap.renderInfoForMap();
			indicator.geoJSON = dMap.getCurrentGeoJSON();
		}

		if(indicator.extractedObjects != undefined){

			// To load overview .
			dureUtil.loadInitialRegionSummaryData(indicator.extractedObjects.summaryData);

			// Loads chart.
			if(dureUtil.prepareChartObjects(indicator.extractedObjects.summaryData,'regionSummary','','Indicator')){
				// Loads the chart to display the summary info on world level/country level/district level.
				//dureUtil.callChartComponent('column');
			}
			// To load Tables.
			if(iHealthTable.setData(indicator)){
				//dureUtil.callTableComponent();
			}
			// To load overlay
			if(dureOverlays.setData(indicator)){
				//dureOverlays.initialize();
			}
		}
			if(dureApp.titleObj != undefined){
				//$('.targetTitle').html(dureApp.titleObj.text());

				var titleIndicatorName = indicator.metaInfo.indicatorInfo.indicatorName;

				$('.targetTitleOnChart').html(titleIndicatorName);
				$('.targetTitleOnMap').html(titleIndicatorName);
				$('.targetTitleOnTable').html(titleIndicatorName);
			}

	}else{
		alert("Data unavailable for this region.");
	}
};

// Separating the objects from main json into new objects so that the required branch can be supplied to the components.
dureUtil.extractDataObjects = function(data){

	var indicator = {};  // New formatter JSON Object

	for(var i =0 ; i < data.length ; i ++)	{

		var dataJSON = data[i]; // Get the JSON object from array of JSON objects

		var keys = Object.getOwnPropertyNames(dataJSON); // Get Property Names

		var keyName = keys[0];

		switch(keyName){
			case 'indicatorInfo':
			indicator.metaInfo =  dataJSON['indicatorInfo']
			break;
			case 'indicatorData':
			indicator.coreData = dataJSON['indicatorData'];
			//indicator.extensionData = dataJSON.indicatorExtn;
			break;

			case 'indicatorSummaryData':
			indicator.summaryData = dataJSON['indicatorSummaryData'];
			break;

			case 'derivedData':
			indicator.derivedData = dataJSON['derivedData'];
			break;

			case 'districtIndicatorData':
			indicator.districtIndicatorData = dataJSON['districtIndicatorData'];
			break;

			case 'districtIndicatorSummaryData':
			indicator.districtIndicatorSummaryData = dataJSON['districtIndicatorSummaryData'];
			break;

			case 'districtDerivedInfo':
			indicator.districtDerivedInfo = dataJSON['districtDerivedInfo'];
			break;

			case 'derivedInfo':
			indicator.derivedInfo = dataJSON['derivedInfo'];
			break;

			case 'derivedDataExt':
			indicator.derivedDataExt = dataJSON['derivedDataExt'];
			break;

			case 'worldIndicatorDataExt':
			indicator.worldIndicatorDataExt = dataJSON['worldIndicatorDataExt'];
			indicator.extensionData = dataJSON['worldIndicatorDataExt'];
			break;

			case 'worldIndicatorData':
			indicator.worldIndicatorData = dataJSON['worldIndicatorData'];
			indicator.coreData = dataJSON['worldIndicatorData'];
			break;

		}

	}
	// //console.log(indicator);
	return indicator;

}

// Fetches world data at given Indicator level
dureUtil.getWorldIndicatorData = function() {

	console.log("==========Fetch world data at given Indicator level==========");
	var wrldInd = {};
	var resp;
	var worldIndicatorDataArray, existsLocally;

	if(dureUtil.checkIfKeyExsist('WorldIndicatorDataArray_'+dureUtil.appId)) {

		console.log("========== Using Local WorldIndicatorData ==========");
		worldIndicatorDataArray = dureUtil.retrieveFromLocal('WorldIndicatorDataArray_'+dureUtil.appId);

		//console.log(worldIndicatorDataArray);

		$.each(worldIndicatorDataArray, function(index, worldIndicatorData){

			////console.log(worldIndicatorData.indicatorMetaInfo[0].indicatorInfo.indicatorId);

			if(worldIndicatorData.indicatorMetaInfo[0].indicatorInfo.indicatorId == dureUtil.indicatorId){
				resp = worldIndicatorData;
				existsLocally = "TRUE";
			}
		});
	}

	if(existsLocally){
		callback_GetWorldIndicatorData(resp, 'local');
	} else {

		if(Offline.state == 'up') {
			// Online
			console.log("========== Calling Service WorldIndicatorData ==========");

			wrldInd.queryString = 'appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&indicatorid='+dureUtil.indicatorId+
			'&regionid='+dureUtil.regionId+'&callback=callback_GetWorldIndicatorData';
			wrldInd.url = dureUtil.AppBaseURLContext+'dataapi/indicator/world/data/?'+wrldInd.queryString;
			console.log(wrldInd.url);

			$.ajax({
				type: 'GET',
				url: wrldInd.url,
				dataType: 'jsonp',
				contentType: 'application/json',
				timeout: 60000, // sets timeout to 60 seconds
				crossDomain : true
			});
		} else {
			dureApp.showDialog("No offline data available.","error");
		}
	}
}

function callback_GetWorldIndicatorData(resp, location){
  console.log("=ssss");
	if(dureUtil.indicatorId == 232 ) {
		   $.getJSON( "tempdata/drug_access.json", function( data ) {
			dureUtil.temp_accessFilePaths = data.data;
		   });
		 }
	if(dureUtil.indicatorId == 233) {

	   $.getJSON( "tempdata/garpr_filename_list.json", function( data ) {

		dureUtil.temp_accessFilePaths = data.data;
	   });
	 }
	if(location != 'local'){

		//dureUtil.worldIndicatorDataLocalArray;

		dureUtil.worldIndicatorDataLocalArray.push(resp);

		if(dureUtil.worldIndicatorDataLocalArray.length > 10) {

			dureUtil.worldIndicatorDataLocalArray.splice(0, 1);
		}

		dureUtil.storeAtLocal('WorldIndicatorDataArray_'+dureUtil.appId, dureUtil.worldIndicatorDataLocalArray);
	}

	var worldInd = {};
	console.log("============ World Indicator Data ===========");
	//console.log(resp);
	if(resp != undefined) {
		dureUtil.respJsonData = resp;
		if(resp.indicatorMetaInfo != undefined) {
			worldInd.metaInfo = resp.indicatorMetaInfo[0];
			// Check whether indicator data exist in array.
			if(resp.indicators.length != 0) {
				worldInd.indicators = resp.indicators;
				dureUtil.setCurrentView(dureUtil.indicatorMenuId);
				dureUtil.setIndicatorMetaInfo(worldInd.metaInfo);
				worldInd.extractedObjects = dureUtil.extractDataObjects(resp.indicators);

				dureUtil.currentFormattedJSONData = $.extend(true,{},worldInd);
				// console.log("World json data.");
				// console.log(dureUtil.currentFormattedJSONData);
				dureUtil.setRangeOfYears();              //  TODO 16/3/2015
				// Call components for window.
				dureUtil.callComponents(worldInd);
				if(dureApp.titleObj != undefined){
					//$('.targetTitle').html(dureApp.titleObj.text());

					var titleIndicatorName = worldInd.metaInfo.indicatorInfo.indicatorName;

					$('.targetTitleOnChart').html(titleIndicatorName);
					$('.targetTitleOnMap').html(titleIndicatorName);
					$('.targetTitleOnTable').html(titleIndicatorName);
				}
				//---Code for highlighting menu tabs -----
				$(".indicator").removeClass("currentmenuselection");
				$("#I_"+dureUtil.indicatorId).addClass("currentmenuselection");

				     $('.breadcrumb a:last-child').replaceWith('<i class="fa fa-angle-double-right"></i><a href="#" style="font-size: 14px;color: black;"data-trigger="hover" data-toggle="popover"  data-content="' + worldInd.metaInfo.indicatorInfoExt.label + '">'+ worldInd.metaInfo.indicatorInfo.indicatorName +'</a>');
					 // $('[data-toggle="popover"]').popover({
						 // container: 'body'
					 // });

					 $("#indicator-meta-ext").html(worldInd.metaInfo.indicatorInfoExt.label);
				dureUtil.indicatorNameInfoExt = worldInd.metaInfo.indicatorInfoExt.label;

			}else{
				dureApp.showDialog("Data is unavailable for indicator","info");
			}
		}else{
			dureApp.showDialog("Data is unavailable for indicator","info");
		}
	}else{

		dureApp.showDialog("Service is temporarily unavailable.","info");
	}
}

// Call indicator data service to fetch the data for indicator.
/* dureUtil.getDataOnDrillDown = function(regId){
	console.log("=================== Calling Indicator data service =====================");
	console.log(dureUtil.getDataLevel());
	var username = 'TIRSP';
	var password = 'Tirsp111',serviceUrl,queryString;//?appid=1&langid=1&targetid=1&indicatorid=1&countryid=8&countryregionid=1

	if(dureUtil.getDataLevel() == 'world'){
		queryString = 'appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&targetid='+dureUtil.targetId+'&indicatorid='+dureUtil.indicatorId+'&countryid='+dureUtil.countryId+'&countryregionid='+dureUtil.countryRegionid+'&callback=callback_GetCountryDrillDownData';
		serviceUrl = dureUtil.AppBaseURLContext + 'dataapi/indicator/country/data/?'+queryString;
	}else if(dureUtil.getDataLevel() == 'country'){
		dureUtil.provinceId = regId;
		console.log("Province Id is :-  ");
		console.log(dureUtil.provinceId);
		queryString = 'appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&indicatorid='+dureUtil.indicatorId+'&countryid='+dureUtil.countryId+'&provinceid='+dureUtil.provinceId+'&callback=callback_GetProvinceDrillDownData';
		serviceUrl = dureUtil.AppBaseURLContext + 'dataapi/indicator/district/data/?'+queryString;

		$('.leaflet-control-layers').hide();
	}else if(dureUtil.getDataLevel() == 'province'){
		dureUtil.districtId = regId;
		//console.log(dureUtil.provinceId);
		queryString = 'indicatorid='+dureUtil.indicatorId+'&countryid='+dureUtil.countryId+'&provinceid='+dureUtil.provinceId+
		'&districtid='+dureUtil.districtId+'&callback=callback_GetDistrictDrillDownData';
		serviceUrl = dureUtil.AppBaseURLContext + 'target/localattribute/?'+queryString;
	}
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
        password :password,
		error: function (request, textStatus, errorThrown) {
			//console.log(request.responseText);
			//console.log(textStatus);
			//console.log(errorThrown);
        }
	});
}; */

// Drill down Call indicator data service to fetch the data for indicator.
dureUtil.getDataOnDrillDown = function(regId) {
	console.log("=================== Calling drillDown Indicator data service =====================");
	//console.log(dureUtil.getDataLevel());
	var resp;
	var existsLocally;

	if(dureUtil.getDataLevel() == 'world') {
		if(dureUtil.checkIfKeyExsist('countryDrillDownData_'+dureUtil.appId)) {

			var countryDrillDownDataArray;
			console.log("========== Using Local World Level drill down data ==========");
			countryDrillDownDataArray = dureUtil.retrieveFromLocal('countryDrillDownData_'+dureUtil.appId);

			//console.log(countryDrillDownDataArray);

			$.each(countryDrillDownDataArray, function(index, countryDrillDownData) {

				if(countryDrillDownData.indicatorRegions[0].regionInfo.countryId == dureUtil.countryId && countryDrillDownData.indicators[0].indicatorInfo.indicatorId == dureUtil.indicatorId){
					resp = countryDrillDownData;
					existsLocally = true;
				}

			});
		}
	} else if(dureUtil.getDataLevel() == 'country') {
		if(dureUtil.checkIfKeyExsist('provinceDrillDownData_'+dureUtil.appId)) {

			var provinceDrillDownDataArray;
			console.log("========== Using Local Country Level drill down data ==========");
			provinceDrillDownDataArray = dureUtil.retrieveFromLocal('provinceDrillDownData_'+dureUtil.appId);

			$.each(provinceDrillDownDataArray, function(index, provinceDrillDownData) {

				if(provinceDrillDownData.indicators[1].geoInfo.provinceId == dureUtil.provinceId && provinceDrillDownData.indicators[0].indicatorInfo.indicatorId == dureUtil.indicatorId){
					resp = provinceDrillDownData;
					existsLocally = true;
				}

			});
		}
	} else if(dureUtil.getDataLevel() == 'province') {
		if(dureUtil.checkIfKeyExsist('districtDrillDownData_'+dureUtil.appId)) {

			var districtDrillDownDataArray;
			console.log("========== Using Local Province Level drill down data ==========");
			districtDrillDownDataArray = dureUtil.retrieveFromLocal('districtDrillDownData_'+dureUtil.appId);

			$.each(districtDrillDownDataArray, function(index, districtDrillDownData) {

				if(districtDrillDownData.indicatorRegions[0].regionInfo.districtId == dureUtil.districtId && districtDrillDownData.indicators[0].indicatorInfo.indicatorId == dureUtil.indicatorId){
					resp = districtDrillDownData;
					existsLocally = true;
				}

			});
		}
	} else {
		existsLocally = false;
	}

	if(existsLocally) {

		console.log('============= Using service call for drilldown ================');
		if(dureUtil.getDataLevel() == 'world') {
			setTimeout(function(){ callback_GetCountryDrillDownData(resp, 'local') }, 500);
			//callback_GetCountryDrillDownData(resp, 'local');
		} else if(dureUtil.getDataLevel() == 'country') {
			setTimeout(function(){ callback_GetProvinceDrillDownData(resp, 'local') }, 500);
			//callback_GetProvinceDrillDownData(resp, 'local');
		} else if(dureUtil.getDataLevel() == 'province') {
			setTimeout(function(){ callback_GetDistrictDrillDownData(resp, 'local') }, 500);
			//callback_GetDistrictDrillDownData(resp, 'local');
		}

	} else {

		if(Offline.state == 'up') {

			console.log('============= Using service call for drilldown ================');
			// Online
			var username = 'TIRSP';
			var password = 'Tirsp111',serviceUrl,queryString;//?appid=1&langid=1&targetid=1&indicatorid=1&countryid=8&countryregionid=1

			if(dureUtil.getDataLevel() == 'world') {
				queryString = 'appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&targetid='+dureUtil.targetId+'&indicatorid='+dureUtil.indicatorId+'&countryid='+dureUtil.countryId+'&countryregionid='+dureUtil.countryRegionid+'&callback=callback_GetCountryDrillDownData';
				serviceUrl = dureUtil.AppBaseURLContext + 'indicator/country/data/?'+queryString;
			} else if(dureUtil.getDataLevel() == 'country') {
				dureUtil.provinceId = regId;
				console.log("Province Id is :-  ");
				//console.log(dureUtil.provinceId);
				queryString = 'appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&indicatorid='+dureUtil.indicatorId+'&countryid='+dureUtil.countryId+'&provinceid='+dureUtil.provinceId+'&callback=callback_GetProvinceDrillDownData';
				serviceUrl = dureUtil.AppBaseURLContext + 'indicator/district/data/?'+queryString;

				$('.leaflet-control-layers').hide();
			} else if(dureUtil.getDataLevel() == 'province') {
				dureUtil.districtId = regId;
				console.log(dureUtil.provinceId);
				queryString = 'indicatorid='+dureUtil.indicatorId+'&countryid='+dureUtil.countryId+'&provinceid='+dureUtil.provinceId+'&districtid='+dureUtil.districtId+'&callback=callback_GetDistrictDrillDownData';
				serviceUrl = dureUtil.AppBaseURLContext + 'target/localattribute/?'+queryString;
			}
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
				password :password,
				timeout: 60000, // sets timeout to 60 seconds
				error: function (request, textStatus, errorThrown) {
					//console.log(request.responseText);
					//console.log(textStatus);
					//console.log(errorThrown);
				}
			});

		} else {
			dureApp.showDialog("No offline data available.","error");
		}
	}
};

/* // Callback function to fetch indicator data for a country.
function callback_GetCountryDrillDownData(resp){                      // TODO double click on layer
	var check, countryLcase, countryISO;
	console.log("========= Receiving response from indicator service for country. ==========");
	console.log(resp);
	check = province.setDataForMap(resp);
	countryLcase = resp.indicatorRegions[0].regionInfo.regionName;
	countryISO = dureUtil.getCountryIsoFromID(resp.indicatorRegions[0].regionInfo.countryId);

	console.log(countryLcase);
	console.log(countryISO);

	if(check){
	iHealthMap.drilldownToCountry(countryLcase, countryISO);
	var indicator = {};
	indicator.summaryData = [];
	indicator.metaInfo = resp.indicators[0].indicatorInfo;
	indicator.coreData ;
	indicator.extensionData ;
	indicator.derivedData ;
	indicator.geoJSON ;
	indicator.extractedObjects;
	indicator.extractedObjects = dureUtil.extractDataObjects(resp.indicators);	 // TODO
	// To load Tables.
	dureUtil.currentFormattedJSONData = indicator;
	if(dureOverlays.setData(indicator)){
		dureOverlays.initialize();
	}
	// Summary box
	dureUtil.loadInitialRegionSummaryData(indicator.extractedObjects.summaryData);
	// Table
	if(iHealthTable.setData(indicator)) {
		//dureUtil.callTableComponent();
	}
	//if(dureUtil.prepareChartObjects(indicator.extractedObjects.summaryData,'regionSummary','','Indicator')){	//TODO
	//			// Loads the chart to display the summary info on world level/country level/district level.
	//			//dureUtil.callChartComponent('column');
	//			console.log(indicator.extractedObjects);
	//}
	}
} */



// Callback function to fetch indicator data for a province in a country.
/* function callback_GetProvinceDrillDownData(resp){
	var check,provinceLcase,drillDown = {};
	console.log("========= Receiving response from indicator service for province. ==========");
	//console.log(resp);
	drillDown.indicators = dureUtil.extractDataObjects(resp.indicators);
	//console.log(drillDown.indicators);
	if(drillDown.indicators.districtIndicatorSummaryData != undefined){
		//dureUtil.loadInitialRegionSummaryData(drillDown.indicators.districtIndicatorSummaryData)
	}
	check = subprovince.setDataForMap(resp);
	provinceLcase = resp.indicators[1].geoInfo[0].provinceName;
	//console.log(provinceLcase);
	var indicators = {};
	indicators.extractedObjects = drillDown.indicators; // To load overlay

	dureUtil.currentFormattedJSONData = indicators;

	if(dureOverlays.setData(indicators)) {
		//alert("set overlay data");
	}
	if(check){
		province.drilldownToProvince(provinceLcase);
	}
} */

// Callback function to fetch indicator data for a district in a province.
/* function callback_GetDistrictDrillDownData(resp){
	var check,districtLcase,drillDown = {};
	if(resp != undefined){
		console.log("========= Receiving response from indicator service for district. ==========");
		//console.log(resp);
		var currentView = dureUtil.retrieveFromLocal("currentView");
		var year = dureUtil.getCurrentYear();
		if(resp.localAttributeData[0][year] != undefined){

			//drillDown.summaryData = resp.indicators[3].districtIndicatorSummaryData[0][dureUtil.indicatorMaxYear][0].data;
			check = local.setDataForMap(resp);
			districtLcase = subprovince.getName();
			//dureUtil.loadInitialRegionSummaryData(drillDown.summaryData);
			console.log(districtLcase);
			if(check){
				subprovince.drilldownToDistrict(districtLcase);
			}
		}else{

			dureApp.showDialog('Local Data unavailable for the current year.','error');
		}
	}else{
		dureApp.showDialog('Data unavailable.','error');
	}
} */

// Callback function to fetch indicator data for a country.
function callback_GetCountryDrillDownData(resp, dataLocation) {                      // TODO double click on layer
	var check, countryLcase, countryISO;
	console.log("========= Receiving response from indicator service for country. ==========");
	//console.log(resp);

	if(dataLocation != 'local') {

		if(resp.indicators[1].indicatorData) {

			dureUtil.countryDrillDownDataLocalArray.push(resp);

			if(dureUtil.countryDrillDownDataLocalArray.length > 5) {

				dureUtil.countryDrillDownDataLocalArray.splice(0, 1);
			}

			//dureUtil.storeAtLocal('countryDrillDownData_'+dureUtil.appId+'_'+dureUtil.countryId+'_'+dureUtil.indicatorId, dureUtil.countryDrillDownDataLocalArray);
			dureUtil.storeAtLocal('countryDrillDownData_'+dureUtil.appId, dureUtil.countryDrillDownDataLocalArray);
		}
	}

	check = province.setDataForMap(resp);


	countryLcase = resp.indicatorRegions[0].regionInfo.regionName;
	countryISO = dureUtil.getCountryIsoFromID(resp.indicatorRegions[0].regionInfo.countryId);

	if(check){
		iHealthMap.drilldownToCountry(countryLcase, countryISO);

		var indicator = {};
		// indicator.metaInfo = resp.indicators[0].indicatorInfo;
		indicator.extractedObjects = dureUtil.extractDataObjects(resp.indicators);	 // TODO
		// To load Tables.
		dureUtil.currentFormattedJSONData = indicator;
		if(dureOverlays.setData(indicator)){
			dureOverlays.initialize();
		}
		// Summary box
		dureUtil.loadInitialRegionSummaryData(indicator.extractedObjects.summaryData);
		// Table
		if(iHealthTable.setData(indicator)) {
			//dureUtil.callTableComponent();
		}
		//if(dureUtil.prepareChartObjects(indicator.extractedObjects.summaryData,'regionSummary','','Indicator')){	//TODO
		//			// Loads the chart to display the summary info on world level/country level/district level.
		//			//dureUtil.callChartComponent('column');
		//			console.log(indicator.extractedObjects);
		//}
	}
}

// Callback function to fetch indicator data for a province in a country.
function callback_GetProvinceDrillDownData(resp, location){
	var check,provinceLcase,drillDown = {};
	console.log("========= Receiving response from indicator service for province. ==========");
	//console.log(resp);

	if(location != 'local') {

		if(resp.indicators[2].districtIndicatorData) {
			dureUtil.provinceDrillDownDataLocalArray.push(resp);

			if(dureUtil.provinceDrillDownDataLocalArray.length > 5) {

				dureUtil.provinceDrillDownDataLocalArray.splice(0, 1);
			}

			//dureUtil.storeAtLocal('provinceDrillDownData_'+dureUtil.appId+'_'+dureUtil.provinceId+'_'+dureUtil.indicatorId, dureUtil.provinceDrillDownDataLocalArray);
			dureUtil.storeAtLocal('provinceDrillDownData_'+dureUtil.appId, dureUtil.provinceDrillDownDataLocalArray);
		}
	}

	drillDown.indicators = dureUtil.extractDataObjects(resp.indicators);
	//console.log(drillDown.indicators);
	if(drillDown.indicators.districtIndicatorSummaryData != undefined){
		dureUtil.loadInitialRegionSummaryData(drillDown.indicators.districtIndicatorSummaryData)
	}
	check = subprovince.setDataForMap(resp);
	provinceLcase = resp.indicators[1].geoInfo[0].provinceName;
	//console.log(provinceLcase);
	var indicators = {};
	indicators.extractedObjects = drillDown.indicators; // To load overlay

	dureUtil.currentFormattedJSONData = indicators;

	if(dureOverlays.setData(indicators)) {
		//alert("set overlay data");
	}
	if(check){
		province.drilldownToProvince(provinceLcase);
	}
}

// Callback function to fetch indicator data for a district in a province.
function callback_GetDistrictDrillDownData(resp, location){
	var check,districtLcase,drillDown = {};

	if(location != 'local') {

		if(resp.indicators[1].indicatorData) {
			dureUtil.districtDrillDownDataLocalArray.push(resp);

			if(dureUtil.districtDrillDownDataLocalArray.length > 5) {

				dureUtil.districtDrillDownDataLocalArray.splice(0, 1);
			}

			//dureUtil.storeAtLocal('districtDrillDownData_'+dureUtil.appId+'_'+dureUtil.districtId+'_'+dureUtil.indicatorId, dureUtil.districtDrillDownDataLocalArray);
			dureUtil.storeAtLocal('districtDrillDownData_'+dureUtil.appId, dureUtil.districtDrillDownDataLocalArray);
		}
	}

	if(resp != undefined){
		console.log("========= Receiving response from indicator service for district. ==========");
		//console.log(resp);

		var currentView = dureUtil.retrieveFromLocal("currentView");
		var year = dureUtil.getCurrentYear();
		if(resp.localAttributeData[0][year] != undefined){

			//drillDown.summaryData = resp.indicators[3].districtIndicatorSummaryData[0][dureUtil.indicatorMaxYear][0].data;
			check = local.setDataForMap(resp);
			districtLcase = subprovince.getName();
			//dureUtil.loadInitialRegionSummaryData(drillDown.summaryData);
			//console.log(districtLcase);
			if(check){
				subprovince.drilldownToDistrict(districtLcase);
			}
		}else{

			dureApp.showDialog('Local Data unavailable for the current year.','error');
		}
	}else{
		dureApp.showDialog('Data unavailable.','error');
	}
}

// Call this service for fetching worldwide data for a particular indicator.
dureUtil.getDataForIndicator = function(){
	var worldInd = {};
	worldInd.username = 'TIRSP';
	worldInd.password = 'Tirsp111';
	worldInd.callbkStr = '&callback=callbackGetWorldDataForIndicator';
	worldInd.queryString = '?appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&regionid='+dureUtil.regionId+
	'&indicatorid='+dureUtil.indicatorId+worldInd.callbkStr;
	worldInd.serviceUrl = dureUtil.AppBaseURLContext+'dataapi/indicator/world/data/'+worldInd.queryString

	$.ajax({
		type:'GET',
		url:worldInd.serviceUrl,
		dataType: 'jsonp',
		contentType: 'application/json',
		crossDomain : true,
		xhrFields: {
			withCredentials: true
		},
		username : worldInd.username,
        password :worldInd.password,
		error: function (request, textStatus, errorThrown) {
			//console.log(request.responseText);
			//console.log(textStatus);
			//console.log(errorThrown);
        }
	});
};

// callback function to fetch indicator data for worldwide.
function callbackGetDataForIndicator(resp){
	//console.log(resp);
}

/******************************** SECTION: CALL TO SIDEBAR FUNCTIONALITY TO SYSTEM *****************************************/

// Initializes targets on Sidebar.
dureUtil.callSidebarMenuComponent = function(indicatorName){

	var titleIndicatorName = indicatorName;

	ihealthMenu.createTargetMenuForSidebar();
	//$('.targetTitle').html($('.indicator').first().text());
	$('.targetTitleOnChart').html(titleIndicatorName);
	$('.targetTitleOnMap').html(titleIndicatorName);
	$('.targetTitleOnTable').html(titleIndicatorName);

	/* creating default breadcrump */

	var $bc = $('<li class="item"></li>');
	$('.breadcrumb').html($bc.prepend('<a href="#">'+$('.sidebar-menu li a span').eq(0).text()+'</a> <a href="#"><i class="fa fa-angle-double-right"></i><b style="font-size: medium"> '+ titleIndicatorName +' </b></a>'));

	/* Clear summary boxes */
	//$('.regionSummary_1').children(".inner").siblings('.small-box-footer').text('333');

};

/******************************** SECTION: CALL TO CHART FUNCTIONALITY TO SYSTEM *****************************************/

// Call chart components on window.
dureUtil.callChartComponent = function(type){
	dChart.renderChart(type);
};

// Sets region summary data for chart .
dureUtil.setRegionSummaryDataForChart = function(data){
	var regionSummary = {};
	regionSummary.data = [];
	if(data != undefined){
		regionSummary.rangeOfYears = getRangeOfYears(data);
		regionSummary.data = getGenericSummaryData(data,regionSummary.rangeOfYears);
		//console.log(regionSummary.rangeOfYears);
		//console.log(regionSummary.data);
		// Key pattern for storing Region Summary data - regionSummaryData_APPid_TARGETid_REGIONid
	if(dureUtil.storeAtLocal('regionSummaryData_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.regionId,regionSummary)){
			return true;
		}
	}

	function getRangeOfYears(years){
		return dureUtil.getOnlyKeysFromObject(years);
	}

	function getGenericSummaryData(data,years){
		//console.log(data);
		//console.log("years : - "+years);
		if(data != undefined){
			var genericData = [];
			// for(var j=0; j < data[years[0]].data[1].length; j++){		// For targets uncomment this line.
			for(var j=0; j < data[years[0]][0].data[1].length; j++){
				genericData[j] = formatSummaryData(data,years,j);
			}
		}
		//console.log("======== Generic data =====");
		//console.log(genericData);
		return genericData;
	}

	function formatSummaryData(data,years,index){
		var result = {};
		result.generic = {};
		result.generic.data = [];
		for(var i = 0; i <years.length; i++){

			result.generic.name = data[years[i]][0].data[1][index];
			result.generic.data[i] = data[years[i]][0].data[0][index];
			// result.generic.name = data[years[i]].data[1][index]; // --- For target uncomment lines ---
			// result.generic.data[i] = data[years[i]].data[0][index];
		}
		return result;
	}
};

// Sets region data for chart.
dureUtil.setRegionDataForChart = function(data,isocode){
	var region = {};
	region.data = [];
	var currentYearData = {};
	var currentYear = iHealthMap.getCurrentyear();

	if(data != undefined){

		console.log("Year Format Length --> "+data[currentYear].length);
		currentYearData = data[currentYear][0];
		region.rangeOfYears = getRangeOfYears(data);
		region.comparisonData = dureUtil.fetchComparisonDataForCurrentYear(currentYearData,isocode);

		if(dureUtil.getDataLevel() == 'subprovince'){
			region.data = getLocalGenericData(data,region.rangeOfYears,isocode);
		}else{
			region.data = getGenericData(data,region.rangeOfYears,isocode);
		}
		//console.log(region);
		iHealthChart.setProvinceData(region);
	}

	function getRangeOfYears(data){
		return dureUtil.getYearsWithData(data);
	}

	function getGenericData(data,years,isocode){
		var genericData = [];
		if(data != undefined){
			for(var i=0;i < data[years[0]][0][isocode][0].length;i++){
				genericData[i] = formatRegionData(data,years,isocode,i);
			}
		}
		return genericData;
	}

	function getLocalGenericData(data,years,locid){
		//console.log(data);
		//console.log(years);
		//console.log(isocode);
		var genericData = [];
		if(data != undefined){
			for(var i=0;i < data[years[0]][0][locid][0].data.length;i++){
				genericData[i] = formatLocalRegionData(data,years,locid,i);
			}
		}
		return genericData;
	}

	function formatRegionData(data,years,isocode,index){
		var result = {};
		result.generic = {};
		result.generic.data = [];
		for(var i = 0; i <years.length; i++){
			result.generic.name = data[years[i]][0][isocode][1][index];
			result.generic.data[i] = data[years[i]][0][isocode][0][index];
		}
		return result;
	}

	function formatLocalRegionData(data,years,isocode,index){
		var result = {};
		result.generic = {};
		result.generic.data = [];
		for(var i = 0; i <years.length; i++){
			result.generic.name = data[years[i]][0][isocode][0].label[index];
			result.generic.data[i] = data[years[i]][0][isocode][0].data[index];
		}
		return result;
	}
};

dureUtil.fetchComparisonDataForCurrentYear = function(currentYearData,isocode){
	var region = {};
	if(currentYearData != undefined){

		region.listOfRegions = dureUtil.getListOfRegionsFromData(currentYearData);
		region.comparisonDataForRegion = dureUtil.formatDataForRegionComparison(currentYearData,isocode);
	}
	return region;
}

dureUtil.getListOfRegionsFromData = function(currentYearData){
	// console.log("==== Fetching list of regions. =====");
	var regionNamesList = [];
	var isocodeList = [];
	if(currentYearData != undefined){

		isocodeList = Object.keys(currentYearData);

		if(dureUtil.getDataLevel() == 'country'){
			for(var key in isocodeList){

				for(index in dureUtil.geoJson.features){

					if(isocodeList[key] == dureUtil.geoJson.features[index].properties.ISO){

						regionNamesList.push(dureUtil.geoJson.features[index].properties.NAME_1)
						break;
					}

				}

			}
		}else if(dureUtil.getDataLevel() == 'province'){
			// console.log("Inside province regions condition..");
			// console.log(isocodeList);
			// console.log(subprovince.geoJson);
			for(var key in isocodeList){

				for(index in subprovince.geoJson.features){

					if(isocodeList[key] == subprovince.geoJson.features[index].properties.ISOCODE){
						// console.log(subprovince.geoJson.features[index].properties.NAME_2);
						regionNamesList.push(subprovince.geoJson.features[index].properties.NAME_2)
						break;
					}

				}

			}
		}
		else if(dureUtil.getDataLevel() == 'world'){
			// console.log("Inside province regions condition..");
			// console.log(isocodeList);

			for(var key in isocodeList){
				var checkPoint = false;              // if country not found than push NA in array to maintain index
				for(index in L.countries){

					if(isocodeList[key] == L.countries[index].features[0].id){
						// console.log(subprovince.geoJson.features[index].properties.NAME_2);
						regionNamesList.push(L.countries[index].features[0].properties.name)
						checkPoint = true;
						break;
					}
				}
				if(!checkPoint) {
					regionNamesList.push('N/A');
				}
			}
		}
		return regionNamesList;

	}
}

dureUtil.formatDataForRegionComparison = function(currentYearData,selectedRegionCode){

	console.log("Creating current year data for comparison chart.");
	// console.log(currentYearData);
	var regionComparisonValueArray = [];
	if(currentYearData != undefined){
		$.each(currentYearData,function(isocode,object){
			if(object[0][0] != -1) {
				var compareObj = {};
				compareObj.y = object[0][0];
				if(selectedRegionCode == isocode){
					compareObj.color = "#CCCCCC";
				}else{
					compareObj.color = "#3C8DBC";
				}
				regionComparisonValueArray.push(compareObj);
			} else{
				var compareObj = {};
				 compareObj.y = null;
				if(selectedRegionCode == isocode){
					compareObj.color = "#CCCCCC";
				}else{
					compareObj.color = "#3C8DBC";
				}
				regionComparisonValueArray.push(compareObj);
			}
		});

		//console.log(regionComparisonValueArray);
	}
	return regionComparisonValueArray;

}

/*********************************************** SECTION: LOCAL STORAGE **************************************************/

dureUtil.getSecondsFromDays = function(days){

	var seconds, milliseconds;

	seconds = (parseInt(days, 10) * 86400);

	return (parseInt(seconds, 10)* 1000);
}

dureUtil.storeAtLocal = function(key,val){

	var newval;
	var e;
	var defaultLayoutSettingJStorage = {};

	if(val != undefined)
	{
		e=JSON.stringify(val)
		newval = Base64.encode(e);
	}

	if(dureUtil.emailId && dureUtil.checkIfKeyExsist(dureUtil.emailId)) {

		defaultLayoutSettingJStorage = dureUtil.retrieveFromLocal(dureUtil.emailId);

	} else if(dureUtil.checkIfKeyExsist('public_profile')){

		defaultLayoutSettingJStorage = dureUtil.retrieveFromLocal('public_profile');
	} else {
		defaultLayoutSettingJStorage.frequency = 7;
	}

	//console.log(defaultLayoutSettingJStorage);

	$.jStorage.set(key,newval);
	$.jStorage.setTTL(key, dureUtil.getSecondsFromDays(defaultLayoutSettingJStorage.frequency));
}

dureUtil.retrieveFromLocal = function(key){
	var e;
	var newval1;
	e = $.jStorage.get(key);

	var newval;
	if(e != undefined)
	{
	  newval = Base64.decode(e);
	  newval1 = JSON.parse(newval);
	}
	return newval1;

};

/*************/

// Store object/data locally to a variable so as to re-use the data and also avoid fetching data from server thus to increase the processing speed.
/* dureUtil.storeAtLocal = function(key,val){
	//console.log("storing data in jStorage");
	$.jStorage.set(key,val);
	$.jStorage.setTTL(key, 604800); // expires in given seconds
} */

//Retrieve data from Local storage with the given particular key.
/* dureUtil.retrieveFromLocal = function(key){
	return $.jStorage.get(key);
}; */

// To print the jStorage values for particular key on //console.
dureUtil.showjStorageValue = function(key){
	//console.log('================================ jStorage value =============================');
	//console.log($.jStorage.get(key));
}

// To clear jStorage value for particular key.
dureUtil.clearStorageValues = function(key){

	$.jStorage.deleteKey(key);
}

// Check if key exsist for Target
dureUtil.checkKeyForTarget = function(target_id){

	if(dureUtil.retrieveFromLocal('Target_'+dureUtil.appId+'_'+target_id+'_'+dureUtil.langId)){
		return true;
	}
	return false;
}

// Checks if data exsist for key in jStorage . Returns true if correct and false if data is not their.
dureUtil.checkIfKeyExsist = function(key){

	if(dureUtil.retrieveFromLocal(key) != undefined){
		return true;
	}
	return false;
};

/*********************************************** SECTION: USER VIEW SECTION ************************************************/

// Generates a key for target/indicator depending on their selection from current view and thus displays view .
dureUtil.setCurrentView = function(param){

	// If Target, param = T_1, T_2;
	// If Indicator, param = I_1, I_2;
	console.log('**** Setting Current View ****');
	//console.log(param);
	var currentView = {};

	var generatedViewKey;
	var numericKey = -1;
	var textKey = "";
	var dataKeys = param.split("_");

	if(dataKeys != undefined && dataKeys.length > 1){

		textKey =  dataKeys[0];
		numericKey = dataKeys[1];
	}

	if (numericKey >= 0 && textKey.length > 0){

		var underScore = '_';
		if(textKey == "I"){
			generatedViewKey = "Indicator" +  underScore + dureUtil.appId + underScore + dureUtil.targetId + underScore + numericKey+ underScore + dureUtil.langId;
			currentView.indicatorIDMenu = param;
			currentView.indicatorID = parseInt(numericKey);
		}
		if(textKey == "T"){
			generatedViewKey = "Target" +  underScore + dureUtil.appId + underScore + numericKey + underScore + dureUtil.langId;
			currentView.targetIDMenu = param;
			currentView.targetID = parseInt(numericKey);
		}
		//console.log("Line 307: Generated View Key =================");
		//console.log(generatedViewKey);
		currentView.currentViewKey = generatedViewKey;
		//console.log(currentView);
		dureUtil.storeAtLocal("currentView",currentView);
	}
}

// Get key for the stored key in storage
dureUtil.getCurrentViewKey = function(key){

	return dureUtil.retrieveFromLocal(key);
}

/******************************** SECTION: TARGET/INDICATOR INFO & LIMITS ***************************************************/

// Sets target info .
dureUtil.setTargetInfo = function (targetParam){
	//console.log('calling setTargetInfo');
	var metaTargetInfo = {};
	if(targetParam != undefined){
		for(var i=0;i < targetParam.length;i++){
			var target = targetParam[i];
			target.targetId = "Target" + target.targetId;
			metaTargetInfo[target.targetId] = target;
		}
		dureUtil.storeAtLocal("metaTargetInfo",metaTargetInfo);
	}
};

// Sets indicator info .
dureUtil.setIndicatorInfo = function (indicatorParam){
	//console.log('########### setting Indicator Info ###########');
	var metaIndicatorInfo = {};
	if(indicatorParam != undefined){
	//console.log(data.indicatorMinMaxYear.indicators.length);
		for(var i=0;i < indicatorParam.length;i++){
			var indicator = indicatorParam[i];
			indicator.id = "Indicator" + indicator.indicatorId;
			metaIndicatorInfo[indicator.id] = indicator;
		}
		dureUtil.storeAtLocal("metaIndicatorInfo",metaIndicatorInfo);
	}
};

// Sets Min year and Max Year Limits of a range for a particular TARGET.
dureUtil.setTargetYearLimits = function(targetParam){
	if(targetParam != undefined){
		for(var i=0;i < targetParam.length;i++){
			if(dureUtil.targetId != targetParam[i].targetId){

				continue;
			}else{

				dureUtil.targetMinYear = targetParam[i].minYear;
				dureUtil.targetMaxYear = targetParam[i].maxYear;
				break;
			}
		}
	}
	//console.log(dureUtil.targetMaxYear);
	//console.log(dureUtil.targetMinYear);
}

// Sets Min year and Max Year Limits of a range for a particular INDICATORS.
dureUtil.setIndicatorYearLimits = function(indicatorParam){

	//console.log(indicatorParam);

	if(indicatorParam.length != 0){

		for(var i=0;i < indicatorParam.length;i++){
			if(dureUtil.indicatorId != indicatorParam[i].indicatorId){

				continue;
			}else{
				dureUtil.indicatorMinYear = indicatorParam[i].minYear;
				dureUtil.indicatorMaxYear = indicatorParam[i].maxYear;
				break;
			}
		}
	}
}

// Gets min year limit for particular TARGET.
dureUtil.getMinYearForTarget = function(index){
	if(index != undefined){
		var targetKey = "Target" + index;
		//console.log('targetKey ' + targetKey);
		var metaTargetInfo = dureUtil.retrieveFromLocal("metaTargetInfo") ;
		if(metaTargetInfo != undefined){
			//console.log(metaTargetInfo[targetKey].minYear);
			return metaTargetInfo[targetKey].minYear;
		}
	}
}

// Gets max year limit for particular TARGET.
dureUtil.getMaxYearForTarget = function(index){

	if(index != undefined){
		var targetKey = "Target" + index;
		var metaTargetInfo = dureUtil.retrieveFromLocal("metaTargetInfo") ;
		if(metaTargetInfo != undefined){
			//console.log(metaTargetInfo[targetKey].maxYear);
			return metaTargetInfo[targetKey].maxYear;
		}

	}
}

// Gets min year limit for particular INDICATOR.
dureUtil.getMinYearForIndicator = function(index){
	if(index != undefined){
		var indicatorKey = "Indicator" + index;
		//console.log('indicatorKey ' + indicatorKey);
		var metaIndicatorInfo = dureUtil.retrieveFromLocal("metaIndicatorInfo");
		if(metaIndicatorInfo != undefined){
			//console.log(metaIndicatorInfo[indicatorKey].minYear);
			return metaIndicatorInfo[indicatorKey].minYear;
		}

	}
}

// Gets max year limit for particular INDICATOR.
dureUtil.getMaxYearForIndicator = function(index){
	if(index != undefined){
		var indicatorKey = "Indicator" + index;
		//console.log('indicatorKey ' + indicatorKey);
		var metaIndicatorInfo = dureUtil.retrieveFromLocal("metaIndicatorInfo");
		if(metaIndicatorInfo != undefined){
			//console.log(metaIndicatorInfo[indicatorKey].maxYear);
			return metaIndicatorInfo[indicatorKey].maxYear;
		}
	}
}


// Sets range of years
dureUtil.setRangeOfYears = function(){
	// console.log("Range of years...");
	// console.log(dureUtil.currentFormattedJSONData);
	if(dureUtil.getIndicatorId() == 187) {
		if(dureUtil.currentFormattedJSONData.extractedObjects.coreData != undefined){
			if(dureUtil.currentFormattedJSONData.extractedObjects.coreData[0] != undefined){
				dureUtil.rangeOfYears = dureUtil.getYearsWithData(dureUtil.currentFormattedJSONData.extractedObjects.coreData[0]);
			}
		}

	} else {

		if(dureUtil.currentFormattedJSONData.extractedObjects.extensionData != undefined){  // TODO
			if(dureUtil.currentFormattedJSONData.extractedObjects.extensionData[0] != undefined){
				dureUtil.rangeOfYears = dureUtil.getYearsWithData(dureUtil.currentFormattedJSONData.extractedObjects.extensionData[0]);
			}
		}else if(dureUtil.currentFormattedJSONData.extractedObjects.coreData != undefined){
			if(dureUtil.currentFormattedJSONData.extractedObjects.coreData[0] != undefined){
				dureUtil.rangeOfYears = dureUtil.getYearsWithData(dureUtil.currentFormattedJSONData.extractedObjects.coreData[0]);
			}
		}
	}
	// console.log("File: Util");
	// console.log(dureUtil.rangeOfYears);
};

// Get range of years
dureUtil.getRangeOfYears = function(){
	return dureUtil.rangeOfYears;
}

// Sets list of countries in array
dureUtil.setIndicatorCountryList = function(countries){
	if(countries != undefined){
		$.each(countries,function(k,v){
			dureUtil.countryList.push(v.countryName);
		});
	}
}

// Gets list of countries
dureUtil.getIndicatorCountryList = function(){
	return dureUtil.countryList;
}

// Sets indicator meta info.
dureUtil.setIndicatorMetaInfo = function(metaInfo){
//console.log(metaInfo);
	dureUtil.indicatorMetaInfo = metaInfo;
};

// Sets indicator meta info by param .
dureUtil.getIndicatorMetaInfoByParam = function(index){

	return dureUtil.indicatorMetaInfo.indicatorInfo[index]; // >>> Ivizard Global project 17/05/2015
	//return dureUtil.indicatorMetaInfo[index];
};

/*********************************************** SECTION: REGION SUMMARY DATA ***********************************************/

// Loads Region Summary Data.   dureUtil.loadRegionSummaryData ---- for world level.
dureUtil.loadInitialRegionSummaryData = function(regionSumData){
	var summary = {};
	var data;
	//console.log(regionSumData);
	//console.log(dureUtil.indicatorMaxYear);
	//console.log(dureUtil.rangeOfYears);
	//console.log(" ===== Loading initial Summary Data ======");

	if(regionSumData != undefined){

		// If indicator min year doesnot have any data for min year then it will check for the first year in the range of arrays and provice the info on components. --- By Shone

		if(regionSumData[0][dureUtil.indicatorMaxYear] == undefined){
			dureUtil.indicatorMaxYear = dureUtil.rangeOfYears[dureUtil.rangeOfYears.length - 1];
		}
		if(regionSumData[0][dureUtil.indicatorMaxYear].data){
			data = regionSumData[0][dureUtil.indicatorMaxYear].data;
		} else{
			data = regionSumData[0][dureUtil.indicatorMaxYear][0].data;
		}

		//console.log(" ===== Loading Region Summary Data ======");
		summary.attrArray = data[1] ;
		summary.valArray = data[0];
		// //console.log(summary.attrArray);
		// //console.log(summary.valArray);
		summary.result = dureUtil.formatDataForRegionSummary(summary);
		//console.log(summary.result);
	}
	dureUtil.setRegionSummaryDataInView(summary.result);
}

// Change the region summary when required for some functionality like change of year on slider.
dureUtil.changeRegionSummaryData = function(data){

	var summary = {};
	if(data != undefined){
		//console.log("==== Changing Region Summary Data ====");
		summary.attrArray = data[1] ;
		summary.valArray = data[0];
		summary.result = dureUtil.formatDataForRegionSummary(summary);
		dureUtil.setRegionSummaryDataInView(summary.result);
	}
}

// Change the overview summary when required for some functionality like change of year on slider.
dureUtil.changeComponentData = function(data){

	var panel = {};
	if(data != undefined){
		// Set piechart data and then call Chart component.
		console.log("Changing pie chart data");
		if(dureUtil.preparePieChartData(data)){
			dureUtil.callChartComponent('pie');
		}
	}
}

//
dureUtil.formatDataForRegionSummary = function(data){
	if(data != undefined){
		var genericSummaryData = {};
    console.log(data);
		if(data.attrArray.length != 0){
			for(var i=0;i < data.attrArray.length;i++){
				genericSummaryData['regionSummary_'+(i+1)] = {};
				genericSummaryData['regionSummary_'+(i+1)].attr = data.attrArray[i];
				genericSummaryData['regionSummary_'+(i+1)].val = dureUtil.numberWithCommas(data.valArray[i]);
			}
		}
	}
	return genericSummaryData;
}

dureUtil.setRegionSummaryDataInView = function(param){
	console.log("=== Setting region summary data In view ===");
	if(param != undefined){
		$.each(param,function(k,v){

			if(v.val != null){
				$('.'+k).show();
				$('.regionSummary_1').removeClass( "bg-aqua bg-green bg-yellow" ).removeClass('bg-blue');
				$('.regionSummary_1').removeClass( "bg-aqua bg-green bg-yellow" ).addClass('bg-red');
				$('.small-box').parent('div').removeClass('col-lg-12');
				$('.small-box').parent('div').addClass('col-lg-4');
				$('.'+k).children(".inner").children('h3').html(v.val);
				$('.'+k).children(".inner").siblings('.small-box-footer').html(v.attr);

			} else {

				$('.'+k).hide();
				$('.regionSummary_1').removeClass( "bg-aqua bg-green bg-yellow" ).addClass('bg-blue');
				$('.small-box').parent('div').removeClass('col-lg-4');
				$('.small-box').parent('div').addClass('col-lg-12');
			}
		});
	}else{
		$('.regionSummary_1').find('.inner > h3').text($('#tab_1-1').children('div').eq(0).attr('data-summary'));
		$('.regionSummary_2').find('.inner > h3').text($('#tab_1-1').children('div').eq(1).attr('data-summary'));
		$('.regionSummary_3').find('.inner > h3').text($('#tab_1-1').children('div').eq(2).attr('data-summary'));

	}
};

dureUtil.showOverviewPanelData = function(data){
	var i=1;
	if(data != undefined){
		for(var k in data){
			if( i == 4){
				break;
			}  // FIX ME :(
			// $('.regionSummary_'+i).children(".inner").children("p").remove();
			//$('.regionSummary_'+i).children(".inner").children('h3').html(data[k]);
			// $('.regionSummary_'+i).children(".inner").children('h3').after("<p>Countries</p>");
			//$('.regionSummary_'+i).children(".inner").siblings('.small-box-footer').html(k);
			i++;
		}
	}
}
/************************************************SECTION: Table Functionalities *******************************************/

dureUtil.callTableComponent = function(){
	dTable.load();
};
/*********************************************** SECTION: COMMON FUNCTIONALITIES ******************************************/

dureUtil.trim = function(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

dureUtil.removeSpaces = function(str) {
	return str.replace(/\s/g, '');
}

dureUtil.numberWithCommas = function(x) {

	if(x != undefined){

		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	else{

		return x;
	}
};

dureUtil.numberWithSpace = function(x) {

 if(x != undefined){

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 }
 else{

  return x;
 }
};


dureUtil.setDataLevel = function(levelParam){
	dureUtil.dataLevel = levelParam;
	return true;
}

dureUtil.getDataLevel = function(){
	if(dMap.checkLevel() == 'world'){
		dureUtil.dataLevel = 'world';
	}else if(dMap.checkLevel() == 'country'){
		dureUtil.dataLevel = 'country';
	}else if(dMap.checkLevel() == 'province'){
		dureUtil.dataLevel = 'province';
	}else if(dMap.checkLevel() == 'district'){
		dureUtil.dataLevel = 'subprovince';
	} else if (dMap.checkLevel() == 'region') {
		dureUtil.dataLevel = 'region';
	}
	return dureUtil.dataLevel;
};

// Capitalizes the first letter.
dureUtil.capitalizeFirstLetter = function (string){
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

//Sets TARGET ID
dureUtil.setTargetId = function(targetId){

	dureUtil.targetId = targetId;
	return true;
};

// Sets INDICATOR ID
dureUtil.setIndicatorId = function(indicatorId){

	dureUtil.indicatorId = indicatorId;
	//console.log("Indicator Id set - "+ dureUtil.indicatorId);
	return true;
};

// Sets INDICATOR MENU ID
dureUtil.setIndicatorMenuId = function(menuId){
	dureUtil.indicatorMenuId = menuId;
	return true;
};

// Gets target id.
dureUtil.getTargetId = function(){

	return dureUtil.targetId;
};

// Gets indicator id.
dureUtil.getIndicatorId = function(){

	return dureUtil.indicatorId;
};

// Sets Role ID
dureUtil.setRoleId = function(roleId){
	dureUtil.roleId = roleId;
	return true;
};

// Gets Role ID
dureUtil.getRoleId = function(){
	return dureUtil.roleId;
};

// Get Country ID
dureUtil.getCountryId = function() {
	return dureUtil.countryId;
}

// Set Country ID
dureUtil.setCountryId = function(countryId) {
	dureUtil.countryId = countryId;
	return true;
}

// Get Country Region Id
dureUtil.getCountryRegionId = function() {
	return dureUtil.countryRegionid;
}

// Set Country Region Id
dureUtil.setCountryRegionId = function(countryRegionId) {
	dureUtil.countryRegionid = countryRegionId;
	return true;
}

// Filter data according to params
dureUtil.getUniqueFromArray = function (inputArray){

    var outputArray = [];
	 outputArray = $.unique(inputArray)
    // for (var i = 0; i < inputArray.length; i++)
    // {
        // if ((jQuery.inArray(inputArray[i], outputArray)) == -1)
        // {
            // outputArray.push(inputArray[i]);
        // }
    // }
    return outputArray;

};
dureUtil.getOnlyUniqueValues = function(value, index, self) {
    return self.indexOf(value) === index;
};

dureUtil.getUniqueFromArrayNew = function (arr){

    var unique = arr.filter( dureUtil.getOnlyUniqueValues );
    return unique;

}

dureUtil.getCurrentYear = function(){
	var currentYr = province.getCurrentYear();
	return currentYr;
}

// Returns Geo JSON Name Property for a given ISO code and GeoJSON Object
dureUtil.getNameFromGeoCode = function(code,geoJSON){
	var name  = "";
	if(code != undefined && geoJSON != undefined)
	{
		var features = geoJSON.features;
		//console.log(code);
		if(features != undefined)
		{
			for(var k in features){
			//	console.log(features[k].properties);
				if(features[k].properties.ISO == code){
					name = features[k].properties.NAME_1;
					break;
				}
			}
		}

	}
	return name;
};

// Returns Geo JSON Name Property for a given ISO code and GeoJSON Object
dureUtil.getGeoCodeFromName = function(countryName,geoJSON){
	//console.log(countryName);
	//console.log(geoJSON);
	var code  = "";
	if(countryName != undefined && geoJSON != undefined)
	{
		var features = geoJSON.features;

		if(features != undefined)
		{
			for(var k in features){
				if(features[k].properties.name == countryName){
					code = features[k].properties.iso_a3;
					break;
				}
			}
		}

	}

	//console.log(code);
	return code;
};

dureUtil.redrawViews = function(){
	if(iHealthMap != undefined && iHealthMap.map != undefined){
		//console.log("Redrawing map");
		iHealthMap.reloadBaseLayer();
	}
	if(iHealthChart != undefined && iHealthChart.chart != undefined){
		var newWidth = iHealthChart.chart.containerWidth // Backup of old width here
		//console.log('old width ' + newWidth);
		//console.log(iHealthChart);
		//console.log(iHealthChart.chart);
		var chartParentNode = $(iHealthChart.chart.container.parentElement);
		if (chartParentNode != undefined)
		{
			newWidth = chartParentNode.width();
			//console.log('new width ' + newWidth);
		}
		iHealthChart.chart.setSize(newWidth,iHealthChart.chart.containerHeight, false);
		iHealthChart.chart.redraw();
	};
};

dureUtil.getCountryNamefromIso = function (isocode) {
    var regionName;
    for (var iso in L.countries) {

        if (isocode == iso) {
            regionName = L.countries[iso].features[0].properties.name;
            break;
        }
    }
    return regionName;
};

dureUtil.getCountryIsoFromID = function (id) {
	var isocode;
	for (var iso in countryIdMapping) {

		if (countryIdMapping[iso].countryId == id) {
			isocode = iso;
			break;
		}

	}
    return isocode;
};

// Overwriting HTML Popup view for Leaflet DVF Framwork to intorduce NUMBER formatting

L.HTMLUtils = {
    buildTable: function(obj, className, ignoreFields) {
        className = className || "table table-condensed table-striped table-bordered";
        var table = L.DomUtil.create("table", className);
        var thead = L.DomUtil.create("thead", "", table);
        var tbody = L.DomUtil.create("tbody", "", table);
        thead.innerHTML = "<tr><th>Name</th><th>Value</th></tr>";
        ignoreFields = ignoreFields || [];
        function inArray(arrayObj, value) {
            for (var i = 0, l = arrayObj.length; i < l; i++) {
                if (arrayObj[i] === value) {
                    return true;
                }
            }
            return false;
        }
        for (var property in obj) {
            if (obj.hasOwnProperty(property) && !inArray(ignoreFields, property)) {
                var value = obj[property];
                if (typeof value === "object") {
                    var container = document.createElement("div");
                    container.appendChild(L.HTMLUtils.buildTable(value, ignoreFields));
                    value = container.innerHTML;
                }
                tbody.innerHTML += "<tr><td>" + property + "</td><td>" + dureUtil.numberWithCommas(value) + "</td></tr>";

				//console.log(dureUtil.numberWithCommas(value));
            }
        }
        return table;
    }
};


// Exact round off
function numberWithRound(number, places) {
    var multiplier = Math.pow(10, places+2); // get two extra digits
    var fixed = Math.floor(number*multiplier); // convert to integer
    fixed += 44; // round down on anything less than x.xxx56
    fixed = Math.floor(fixed/100); // chop off last 2 digits
    return fixed/Math.pow(10, places);
}

// Layout Settings

dureUtil.syncPersonalLayoutSettings = function () {

	$('#sync-personal-settings').on('click', function(){

		if(dureUtil.emailId && dureUtil.checkIfKeyExsist(dureUtil.emailId)) {

			dureUtil.clearStorageValues(dureUtil.emailId);

		}

		if(dureUtil.checkIfKeyExsist('public_profile')){
			dureUtil.clearStorageValues('public_profile');
		}

		/* if(!dureUtil.emailId && !dureUtil.checkIfKeyExsist('public_profile')){
			//console.log('localstorage');

			var layoutSettingsObject = {};

			layoutSettingsObject.layout = 'vertical';
			layoutSettingsObject.theme = 'blue';
			layoutSettingsObject.component = 'all';
			layoutSettingsObject.frequency = '7';

			dureUtil.storeAtLocal('public_profile', layoutSettingsObject);
		} */

		var layoutSettingsObject = {};

		layoutSettingsObject.layout = 'tab';
		layoutSettingsObject.theme = 'blue';
		layoutSettingsObject.component = 'all';
		layoutSettingsObject.frequency = '7';

		dureUtil.storeAtLocal('public_profile', layoutSettingsObject);

		//location.reload(true);
		window.location.href = "";
	});

};

dureUtil.resetButtonControl = function() {

	var ButtonControl = L.Control.extend({
		options : {
			position : 'topleft'
		},

		onAdd : function (map) {
			// create the control container with a particular class name
			var controlUI = L.DomUtil.create('div', 'resetMap leaflet-bar fa fa-refresh');
			controlUI.style.backgroundColor = '#ffffff';
			controlUI.style.color = '#000000';
			//controlUI.style.borderStyle = 'solid';
			//controlUI.style.borderColor = '#FFFFFF';
			controlUI.style.borderRadius = '4px';
			//controlUI.style.borderWidth = '2px';
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.style.padding = '7px';
			controlUI.title = 'Reset map';
			controlUI.innerHTML = " ";

			L.DomEvent.addListener(controlUI, 'click', L.DomEvent.stopPropagation)
				.addListener(controlUI, 'click', L.DomEvent.preventDefault)
				.addListener(controlUI, 'click', function () {
					setTimeout( function() {
						console.log(" Reset Map ");
						dMap.onResettingMap();
					}, 200);
				});

			return controlUI;
		}
	});

	iHealthMap.map.addControl(new ButtonControl());
}

dureUtil.setIsoCode = function(iso){

 if(iso != undefined){

  dureUtil.isoCode = iso;
  return true;
 }

}

dureUtil.getIsoCode = function(){
	return dureUtil.isoCode;
};


	// Animations Effects ( searo)
dureUtil.applyDropShaddowEffect = function(map) {
			// Get the SVG element from the overlayPane
			var svg = map.getPanes().overlayPane.firstChild,

			// Create defs element
			defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
			// Create filter element
			svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter'),
			// Create blur element
			svgBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
			// Create feOffset element
			feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset'),
			//create feMerge element
			feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge'),

			// create feMergeNode element
			feMergeNode = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');

			// create feMergeNode element
			feMergeNodeSourceGraphic = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');

			// Set ID attribute of filter
			svgFilter.setAttribute('id', 'drop-shadow');

			// Give room to blur to prevent clipping

			//svgFilter.setAttribute('height', '130%');
			svgFilter.setAttribute('x', '-100%');
			svgFilter.setAttribute('y', '-100%');
			svgFilter.setAttribute('width', '500%');
			svgFilter.setAttribute('height', '500%');

			//set attributes on svgBlur
			svgBlur.setAttribute('stdDeviation', 5);
			svgBlur.setAttribute('result', "blur");
			svgBlur.setAttribute('in', "SourceAlpha");

			// set attributes on feOffset element

			feOffset.setAttribute('in', "blur");
			feOffset.setAttribute('dx', 5);
			feOffset.setAttribute('dy', 5);
			feOffset.setAttribute('result', "offsetBlur");

			// set attributes on feMergeNode element

			feMergeNode.setAttribute('in', "offsetBlur");
			feMergeNodeSourceGraphic.setAttribute('in', "SourceGraphic");

			// append elements

			svgFilter.appendChild(svgBlur);
			svgFilter.appendChild(feOffset);
			svgFilter.appendChild(feMerge);
			feMerge.appendChild(feMergeNode);
			feMerge.appendChild(feMergeNodeSourceGraphic);
			defs.appendChild(svgFilter);
			svg.appendChild(defs);

			// bind hover event
			/*$(".leaflet-overlay-pane svg > g path").on({
				mouseenter: function () {
					console.log(this);
					this.setAttribute('filter', 'url(#drop-shadow)');

				},
				mouseleave: function () {

				}
			});*/
	}

	// Add Mask on map for  disputed areas, lakes

dureUtil.addMaskOnMap = function() {

 if(dureUtil.maskGeoLayer) iHealthMap.map.removeLayer(dureUtil.maskGeoLayer);

 $.getJSON('data/mask-lines.geojson', function(rData) {

  dureUtil.maskGeoJson = rData;
  var disputedAreas = {line:["IN-AP-Dispute","ES-S"]};
  var waterBodies = {lake:["Lakes"]};
  dureUtil.maskGeoLayer = L.geoJson(dureUtil.maskGeoJson,{
   style: function(features) {
	    return {
	      fillColor: $.inArray(features.properties.NAME,waterBodies.lake) > -1 ? "#c0cfd7":"#000000",
	      weight: 2,
	      opacity: 1,
	      color: 'white',
	      dashArray: $.inArray(features.properties.NAME,disputedAreas.line) > -1 ? 0 : $.inArray(features.properties.NAME,waterBodies.lake) > -1 ? 0 : 3,
	      fillOpacity: 0.7
	      };
	  }});
   iHealthMap.map.addLayer(dureUtil.maskGeoLayer);
 });
}
