/* #### iVizard Global #### */
/* #### File containing functionality for creating overlays #### */

var dureOverlays = {};
var gaviOverlays = {};
var states = [];

dureOverlays.scaleRangeCat = { regionList: {}, apply: true };   // for OverLay base Highchart
dureOverlays.colorContainer  = null;
dureOverlays.currentSelOverlayName = '';
dureOverlays.initObjBubbleChartOverlay = function() {
  dureOverlays.radiusScaleRangeCat = { regionList: {"Low":[], "Medium":[], "High":[]}, range:[{name:"Low",scale:[0,1,2,3]},{name:"Medium",scale:[4,5,6]},{name:"High",scale:[7,8,9,10]}], apply: true, overlayName:"" };   // for OverLay Bubble type	
};

dureOverlays.initObjBubbleChartOverlay();

gaviOverlays.initialize = function () {
    //gaviOverlays.clearOverlays();
    if (gaviOverlays.selectLayer != undefined || gaviOverlays.selectLayer != null || gaviOverlays.selectLayer == "") {
        gaviOverlays.removeSelectLayers();
        gaviOverlays.clearOverlays();
    }

    gaviOverlays.selectLayer = '';
    gaviOverlays.gaviOverlay = '';
    gaviOverlays.nonGaviOverlay = '';
    gaviOverlays.prepareStripesOverLay();
};

dureOverlays.initialize = function() {
	
	if(dureOverlays.selectLayer != undefined && dureOverlays.selectLayer != '' ){
		dureOverlays.removeSelectLayers();
		dureOverlays.clearOverlays();
	}
	
	dureOverlays.allOverlayLayers = [];
    dureOverlays.circleMarkerRadiusMax = 0;
    dureOverlays.customMarkerIconSizeMax = 0;
    dureOverlays.tempDatayear = 0;
    dureOverlays.overlayArr = [];
    dureOverlays.bubbleLayerData = [];
    dureOverlays.selectLayer = '';
    dureOverlays.BubbleOverlayOptions = {};
    dureOverlays.radiusFunction = new L.LinearFunction(new L.Point(0, 2), new L.Point(100, 40));
    dureOverlays.setBubbleOptions;
	dureOverlays.prepareOverlays(); // Prepare overlays on page load
	dureOverlays.data = {};
	dureOverlays.OverlayVisible = false;
	dureOverlays.bubbleColor = '';
	dureOverlays.overlayStyle = '';
	dureOverlays.yearOnLegend = '';
	dureOverlays.currentYear = iHealthMap.getCurrentyear();
	
	//gaviOverlays.initialize(); // Uncomment to enable gavi-non gavi stripe overlays 
};
/********************************** Section: Set - Get Overlay Data **********************************/
dureOverlays.setData = function(data){
console.log('####### SET OVERLAY DATA #########');

	if(data){
		if(data.extractedObjects.hasOwnProperty('derivedData') || data.extractedObjects.hasOwnProperty('derivedDataExt')){
			dureOverlays.data = $.extend(true ,{},data);
			return true;	
		}
	}
	return false;
}

dureOverlays.getData = function(){
	return dureOverlays.data;
};

/********************************** SECTION: CALL PREPARATION OF ALL OVERLAYS ON PAGE LOAD **********************************/

dureOverlays.prepareOverlays = function(){
	var dataFormat, overlayData, overlayDerivedInfo = {};	
	
	overlayData = dureOverlays.getData();	// Get data 	
	
	console.log('### Prepare overlays and overlay control on page load ###');
	//console.log(overlayData);
	
	if (!overlayData.extractedObjects)
	return;

	if(dureUtil.getDataLevel() == 'province'){
		overlayDerivedInfo = overlayData.extractedObjects.districtDerivedInfo;
	} else {
		overlayDerivedInfo = overlayData.extractedObjects.derivedInfo;
	}

	if (overlayDerivedInfo != undefined) {

		//console.log(overlayData.extractedObjects);
		
		$.each(overlayDerivedInfo, function (key, object) {
		
			if (object.dataFormat == 'Non-Standard') {

				var nonStdData = dureOverlays.getNonStandardDataFromDerivedId(object.derivedId, overlayData.extractedObjects.derivedDataExt);
			
				if (nonStdData.data != undefined) {
				
					if ((object.derivedStyle == 'Marker') || (object.derivedStyle == 'Star') || (object.derivedStyle == 'Triangle') || (object.derivedStyle == 'Circle') || (object.derivedStyle == 'Diamond') || (object.derivedStyle == 'Population') || (object.derivedStyle == 'Health Facility') || (object.derivedStyle == 'House Hold')) {

						if (nonStdData != undefined) {
							dureOverlays.drawCustomMarkerOverlay(object, nonStdData, false);
						}                    
					} else {
						console.log('### ERROR: Derived Style does not match Non-Standard Data.');
					}
				} else {
					console.log('### ERROR: Derived Style does not match Non-Standard Data.');
				}

			} else if (object.dataFormat == 'Standard') {

				var stdData = dureOverlays.getStandardDataFromDerivedId(object.derivedId, overlayData.extractedObjects.derivedData);
			
				if (stdData.data != undefined) {
					
					if (object.derivedStyle == 'Bubble') {
						
						if (stdData != undefined) {
							
							dureOverlays.setBubbleOverlayOptions();
							dureOverlays.prepareBubbleOverlay(object, stdData, false);
						}
						
					} else if (object.derivedStyle == 'chart') {
						
						if (stdData != undefined) {
							dureOverlays.prepareBarOverlay(object, stdData)
						}
						
					} else if (object.derivedStyle == 'Radial') {
						
						if (stdData != undefined) {
							dureOverlays.drawRadialBarChart(object, stdData);
						} 
						
					} else if ((object.derivedStyle == 'Marker') || (object.derivedStyle == 'Star') || (object.derivedStyle == 'Triangle') || (object.derivedStyle == 'Circle') || (object.derivedStyle == 'Diamond') || (object.derivedStyle == 'Population') || (object.derivedStyle == 'Health Facility') || (object.derivedStyle == 'House Hold')) {

						if (stdData != undefined) {
							dureOverlays.drawCustomMarkerOverlay(object, stdData, false);
						}                    
					} else {
						console.log('### ERROR: Derived Style does not match Standard Data.');
					}
				} else {
					console.log('### ERROR: Derived Data is not available.');
				}
            } else {
				console.log('### ERROR: Derived IDs does not match for derivedInfo & derivedData.');
			}
        });

		dureOverlays.callOverlayControlsOnMap(dureOverlays.overlayArr);
    } else {

		console.log('No overlay data');
		//dureApp.showDialog('Overlays not available for the indicator as data is not available.', 'info');
	}
	
	$('.leaflet-control-layers-overlays option').prop('selected', false).trigger('chosen:updated');	
};

/****************************************************** SECTION: Clear Overlay *********************************************************/
dureOverlays.removeSelectLayers = function(){

   if(dureOverlays.selectLayer){
		dureOverlays.selectLayer.removeFrom(iHealthMap.map);
    	dureOverlays.selectLayer = null;
	}
};

dureOverlays.clearOverlays = function(){
	
	console.log('### CLEAR OVERLAY ###');
	
	if(dureOverlays.allOverlayLayers != undefined){
		$.each(dureOverlays.allOverlayLayers,function(key,object){
			iHealthMap.map.removeLayer(object);
		});		
	}
	
	//$('#marker-legend').remove();
	$('#marker-legend').parent().remove();
	$('.leaflet-control-layers-overlays option').prop('selected', false).trigger('chosen:updated');
	
	$('.overlaybase-chartcontainer').empty();  //To clear overlay char after clearing.
};

gaviOverlays.removeSelectLayers = function () {
    console.log('REMOVING GAVI SELECT LAYER');
    gaviOverlays.selectLayer.removeFrom(iHealthMap.map);
    gaviOverlays.selectLayer = null;
};

gaviOverlays.clearOverlays = function () {

    if (gaviOverlays.gaviOverlay != undefined) {

        iHealthMap.map.removeLayer(gaviOverlays.gaviOverlay);
    }

    if (gaviOverlays.nonGaviOverlay != undefined) {

        iHealthMap.map.removeLayer(gaviOverlays.nonGaviOverlay);
    }

};

/***************************************** SECTION: Radial Bar Overlay **********************************************/

dureOverlays.prepareDataForRadialBarChart = function(dataJSON){
	var finalFormmattedJSON = [];		
	var straightObjectList = [];
	
	for (objName in dataJSON) {	
		//console.log(objName);
		var newObjectList = [];
		if(dataJSON.hasOwnProperty(objName)) {
			 
			//Get object for objName
			var object = dataJSON[objName];
			var currentYear = objName;
			
			var innerArrayObject = object[0];
			 
			for(innerObjectName in innerArrayObject){
			 
				var innerObject = innerArrayObject[innerObjectName];
				var newJSONObject = {};
				newJSONObject.Year = currentYear;
				newJSONObject.Country = innerObjectName;
				newJSONObject.Value = innerObject[0][0];
				straightObjectList.push(newJSONObject);						
			}
		}
	}			

	var formatterObjectList = [];
	
	for(countryObjectName in L.countries)
	{
		var formattedObjectContainer =  {};
		var formattedObject = {};
		for(objectName in straightObjectList)
		{
			var straightObject = straightObjectList[objectName];

			if(countryObjectName == straightObject.Country)
			{					
				if(formattedObjectContainer.hasOwnProperty(countryObjectName))
				{						
					formattedObject = formattedObjectContainer[countryObjectName];
					var valueOfData = straightObject.Value;
					if(valueOfData == undefined)
					{
						valueOfData = "";
					}
					formattedObject[straightObject.Year] =  "" + valueOfData;
					formattedObjectContainer.countryObjectName = formattedObject;
				}
				else
				{						
					var retrievedObject = iHealthMap.getCountryObjectFromAlpha3(countryObjectName);
					
					formattedObject.Country = retrievedObject.countryName;
					formattedObject.CountryCode = retrievedObject.countryCode;
					var valueOfData = straightObject.Value;
					if(valueOfData == undefined)
					{
						valueOfData = "";
					}							
					formattedObject[straightObject.Year] =  "" + valueOfData;
					formattedObjectContainer.countryObjectName = formattedObject;
				}						
			}					
		}
		
		if(!$.isEmptyObject(formattedObjectContainer))
		{
			formatterObjectList.push(formattedObjectContainer);
		}
	}
	
	for(obj in formatterObjectList)
	{
		finalFormmattedJSON.push(formatterObjectList[obj].countryObjectName);
	}
	
	return finalFormmattedJSON;
};

dureOverlays.drawRadialBarChart = function(overlayinfo,dataJSON){
	//console.log("===== Radial chart ====");
	//console.log(dataJSON);
	dureOverlays.overlayArr.push(overlayinfo.derivedName);
	var dataForRadialBarChart = dureOverlays.prepareDataForRadialBarChart(dataJSON[0]);		 

	var categories = ['2013']; // Years to display on layer
	
	//------------ Get max value from data ------------//	
	var maxvalue = 0;
	
	$.each(dataForRadialBarChart, function(index, object)
	{
		$.each(object, function(ind, obj)
		{			
			if(ind !== "CountryCode" && ind !== "Country" && $.inArray(ind, categories) !== -1)
			{
				if(parseInt(obj) > maxvalue)
				{
					maxvalue = parseInt(obj);
				}			
			}
		});
	});
		
	var fillColorFunctionBars = new L.HSLLuminosityFunction(new L.Point(0, 0.5), new L.Point(categories.length - 1, 1), {outputHue: 0, outputSaturation: '100%'});
	
	var styleFunction = new L.StylesBuilder(categories, {
		displayName: function (index) {
			return categories[index];
		},
		color: 'hsl(0,100%,20%)',
		fillColor: fillColorFunctionBars,
		minValue: 0,
		maxValue: maxvalue+1,
		maxHeight: 5
	});

	options = {
		recordsField: null,
		locationMode: L.LocationModes.COUNTRY,
		codeField: 'CountryCode',
		chartOptions: styleFunction.getStyles(),
		layerOptions: {
			fillOpacity: 0.7,
			opacity: 1,
			weight: 1,
			width: 6,
			offset: 0
		},
		tooltipOptions: {
			iconSize: new L.Point(250, 100),
			iconAnchor: new L.Point(-5, 100)
		},
		onEachRecord: function (layer, record) {
			var $html = $(L.HTMLUtils.buildTable(record));

			layer.bindPopup($html.wrap('<div/>').parent().html(), {
				maxWidth: 400,
				minWidth: 400
			});
		}
	};

	var radialBarChartLayer = new L.RadialBarChartDataLayer(dataForRadialBarChart, options);   

	dureOverlays.allOverlayLayers.push(radialBarChartLayer);
	radialBarChartLayer.addTo(iHealthMap.map);
};

/***************************************** SECTION: Bar Chart Overlay **********************************************/

dureOverlays.prepareBarOverlay = function(object,overLayData){
	//console.log(overLayData);
	dureOverlays.overlayArr.push(object.derivedName);
	var newFormatedObj = {};
	var newFormattedPeriodWiseObject = [];
	var dataJSON = overLayData[0];	
	var currentYear = iHealthMap.getCurrentyear();
	
	//Prepare overlay data format.	
	var formatArr = [];
	for(var iso in dataJSON){
		var formatobj = {};
		var label = '';
		var value = '';
		formatobj['Province'] = dureOverlays.getProvinceNamefromIso(iso);
		for(var key in dataJSON[iso][0]){

			label = dataJSON[iso][1][key];
			value = dataJSON[iso][0][key];	
			if(label != undefined && value != undefined){
				formatobj[label] = value;
			}
		}
		formatobj.year = currentYear;
		formatobj.ISO = iso;
		formatArr.push(formatobj);
	}
	
	newFormatedObj[currentYear] = formatArr;	
	var categories = dureOverlays.getCategoriesForBarChart(dataJSON); // Categories to display on layer	
	var maxvalue = 0;
	
	$.each(newFormatedObj, function(year, datArray){
		$.each(datArray, function(index, dataObject){
		
			$.each(dataObject,function(key,value){
				if($.inArray(key, categories) !== -1){
				
					if(parseInt(value) > maxvalue)
					{
						maxvalue = parseInt(value);
					}			
				}
			});

		});
	});
	
	var year = iHealthMap.getCurrentyear();
	newFormattedPeriodWiseObject = newFormatedObj[year]; //Hardcoded to check the working of bar chart.
	
	var fillColorFunctionBars = new L.HSLHueFunction(new L.Point(0, 90), new L.Point(categories.length - 1, 0));
	
	//var fillColorFunctionBars = new L.HSLLuminosityFunction(new L.Point(0, 0.5), new L.Point(categories.length - 1, 1), {outputHue: 0, outputSaturation: '100%'});
	//console.log(fillColorFunctionBars);
	var styleFunction = new L.StylesBuilder(categories, {
		displayName: function (index) {
			return categories[index];
		},
		color: 'hsl(0,100%,20%)',
		fillColor: fillColorFunctionBars,
		minValue: 0,
		maxValue: maxvalue+1,
		maxHeight: 70
	});
	
	options = {
		recordsField: null,
		locationMode: L.LocationModes.STATE,
		codeField: 'ISO',
		chartOptions: styleFunction.getStyles(),
		layerOptions: {
			fillOpacity: 0.7,
			opacity: 1,
			weight: 1,
			width: 10,
			offset: 1
		},
		tooltipOptions: {
			iconSize: new L.Point(250, 100),
			iconAnchor: new L.Point(-5, 100)
		}/* ,
		onEachRecord: function (layer, record) {
			var $html = $(L.HTMLUtils.buildTable(record));


			var $newHtml = "<div class='box box-solid box-primary box-transparent box-rm-margin-bottom'>"+
					"<div class='box-header collapsibleHeader'>"+						
						"<div class='box-tools pull-right'>"+
							"<button class='btn btn-primary btn-xs' data-widget='collapse'><i class='fa fa-minus'></i></button>"+
						"</div>"+
					"</div>"+
					"<div class='box-body' style='display: block;'>"+$html.wrap('<div/>').parent().html()+"</div>"+
				"</div>";
				
			layer.bindPopup($newHtml, {
				maxWidth: 400,
				minWidth: 400
			});
		} */
	};
	var barChartLayer = new L.BarChartDataLayer(newFormattedPeriodWiseObject, options);  
	
	dureOverlays.allOverlayLayers.push(barChartLayer);
	barChartLayer.addTo(iHealthMap.map);
};

//Fetch array of categories for chart.
dureOverlays.getCategoriesForBarChart = function(dataJSON){
	var categories = [];
	var currentYear = iHealthMap.getCurrentyear();
	//console.log(dataJSON);
	for(var iso in dataJSON){
		for(var index in dataJSON[iso][1]){			
			if(dataJSON[iso][1][index] != ''){
				categories.push(dataJSON[iso][1][index]);				
			}				
		}
		break;		
	}
	return categories;
};

/******************************************** SECTION: Bubble Overlay ***************************************************/

/******************************************** set bubble overlay options ************************************************/

dureOverlays.setBubbleOverlayOptions = function() {
	
	var currentLocationMode;
	
	if(dureUtil.getDataLevel() == 'province'){
		currentLocationMode = L.LocationModes.DISTRICT; // Change this for district level
	} else if (dureUtil.getDataLevel() == 'country'){
		currentLocationMode = L.LocationModes.STATE; // Change this for country level
	} else {
		currentLocationMode = L.LocationModes.COUNTRY; // Change this for world level
	}
	
    dureOverlays.BubbleOverlayOptions = {
        recordsField: null,
        locationMode: currentLocationMode,  
        codeField: 'ISO',
        displayOptions: {}, /* display options is set in dureOverlays.prepareBubbleOverlayData */
        layerOptions: {
            fillOpacity: 0.7,
            opacity: 1,
            weight: 1,
            color: 'hsl(220,100%,25%)',
            numberOfSides: 40,
            dropShadow: false,
            gradient: false
        },
        tooltipOptions: {
            iconSize: new L.Point(250, 100),
            iconAnchor: new L.Point(-5, 100)
        },
        onEachRecord: function(layer, record) {
			
			dureOverlays.prepareRadiusWiseList(layer, record);							// Seperate list for chart
			
            var $html = $(L.HTMLUtils.buildTable(record));
            layer.bindPopup($html.wrap('<div/>').parent().html(), {
                maxWidth: 400,
                minWidth: 400
            });
        }
    };
};

//Prepare bubble overlay data District

dureOverlays.prepareBubbleOverlayDistrictData = function (info, dataJSON) {
	
	//var countryCentroids = dureOverlays.getCountryCentroids(); // For world level markers 
	var stateCentroids = dureOverlays.getStateCentroids(); // For country level markers

	var currentBubbleOverlay = {};
	currentBubbleOverlay.data = dataJSON.data;

	var currentYear, latestYear;
	
	//console.log(currentBubbleOverlay);
	
	currentYear = iHealthMap.getCurrentyear();
	latestYear = dureOverlays.getLatestYearFromData(currentBubbleOverlay.data);
	
	var finalObject = {};

	//dureOverlays.customMarkerIconSizeMax = 0;
	var currentBubbleOverlayData = [];
	
	$.each(currentBubbleOverlay.data, function(index, Object) {
	
		if(Object[currentYear] != undefined){
			
			dureOverlays.yearOnLegend = currentYear;
			dureOverlays.circleMarkerRadiusMax = 0;
			
			$.each(Object[currentYear][0], function (districtISO, Obj) {
			
				if (districtISO != undefined) {
					
					var markerValue = Obj[0][0];
					var jsonObject = {};					
					
					//var districtInfo = dureOverlays.getDistrictCentroid(districtISO); // For province level markers					
					
					if (eval(dureOverlays.circleMarkerRadiusMax) < eval(Object[currentYear][0][districtISO][0][0])) {
						dureOverlays.circleMarkerRadiusMax = eval(Object[currentYear][0][districtISO][0][0]);
					}
					
					var yearKey = ""+currentYear;
					var CodeKey = "ISO";
					var NameKey = "District";
					//Preparing Data for bubble overlay layer. Data should be an array of objects.
					var obj = {};
					obj[yearKey] = Number(Object[currentYear][0][districtISO][0][0]);
					obj[CodeKey] = districtISO;
					obj[NameKey] = dureOverlays.getDistrictNamefromIso(districtISO);
					
					currentBubbleOverlayData.push(obj);
				}
			});
			
		} else if(Object[latestYear] != undefined) {
			
			dureOverlays.yearOnLegend = latestYear;
			
			dureOverlays.circleMarkerRadiusMax = 0;
			
			$.each(Object[latestYear][0], function (districtISO, Obj) {
			
				if (districtISO != undefined) {
					
					var markerValue = Obj[0][0];
					var jsonObject = {};					
					
					//var districtInfo = dureOverlays.getDistrictCentroid(districtISO); // For province level markers 
					
					if (eval(dureOverlays.circleMarkerRadiusMax) < eval(Object[latestYear][0][districtISO][0][0])) {
						dureOverlays.circleMarkerRadiusMax = eval(Object[latestYear][0][districtISO][0][0]);
					}
					
					var yearKey = ""+latestYear;
					var CodeKey = "ISO";
					var NameKey = "District";
					//Preparing Data for bubble overlay layer. Data should be an array of objects.
					var obj = {};
					obj[yearKey] = Number(Object[latestYear][0][districtISO][0][0]);
					obj[CodeKey] = districtISO;
					obj[NameKey] = dureOverlays.getDistrictNamefromIso(districtISO);
					
					currentBubbleOverlayData.push(obj);
				}
			});
			
		} else {
			console.log('### ERROR: Year data does not match.');
		}
		
	});
	
	/********** setting display key for dureOverlays.BubbleOverlayOptions **********/

	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend] = {};
	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['displayName'] = info.derivedName;
	dureOverlays.bubbleColor = dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['fillColor'] = info.levels[0].scales[0].linear[0].colorScale[0];

	dureOverlays.radiusFunction = new L.LinearFunction(new L.Point(0, 2), new L.Point(4, 1));
	
	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['radius'] = dureOverlays.radiusFunction;
	
	//console.log(currentBubbleOverlayData);
	return currentBubbleOverlayData;
};

//Prepare bubble overlay data Province.
dureOverlays.prepareBubbleOverlayProvinceData = function (info, dataJSON) {
	
	//var countryCentroids = dureOverlays.getCountryCentroids(); // For world level markers 
	var stateCentroids = dureOverlays.getStateCentroids(); // For country level markers

	var currentBubbleOverlay = {};
	currentBubbleOverlay.data = dataJSON.data;

	var currentYear, latestYear;
	
	currentYear = iHealthMap.getCurrentyear();
	latestYear = dureOverlays.getLatestYearFromData(currentBubbleOverlay.data);
	
	var finalObject = {};

	//dureOverlays.customMarkerIconSizeMax = 0;
	var currentBubbleOverlayData = [];
	
	$.each(currentBubbleOverlay.data, function(index, Object) {

		//console.log(Object);
	
		if(Object[currentYear] != undefined){
			
			dureOverlays.yearOnLegend = currentYear;
			dureOverlays.circleMarkerRadiusMax = 0;
			
			$.each(stateCentroids, function (ind, Obj) {
				
				var isocode;				
				isocode = ind;
				//console.log(isocode);
				//console.log(Obj);
				
				if (Object[currentYear][0][isocode] != undefined) {
					
					if (eval(dureOverlays.circleMarkerRadiusMax) < eval(Object[currentYear][0][isocode][0][0])) {
						dureOverlays.circleMarkerRadiusMax = eval(Object[currentYear][0][isocode][0][0]);
					}
					
					var yearKey = ""+currentYear;
					var CodeKey = "ISO";
					var NameKey = "Province";
					//Preparing Data for bubble overlay layer. Data should be an array of objects.
					var obj = {};
					obj[yearKey] = Number(Object[currentYear][0][isocode][0][0]);
					obj[CodeKey] = isocode;
					obj[NameKey] = dureOverlays.getProvinceNamefromIso(isocode);
					
					currentBubbleOverlayData.push(obj);
				}
			});
			
		} else if(Object[latestYear] != undefined){
			
			dureOverlays.yearOnLegend = latestYear;
			
			$.each(stateCentroids, function (ind, Obj) {

				var isocode;				
				isocode = ind;
			
				if (Object[latestYear][0][isocode] != undefined) {
					
					if (eval(dureOverlays.circleMarkerRadiusMax) < eval(Object[latestYear][0][isocode][0][0])) {
						dureOverlays.circleMarkerRadiusMax = eval(Object[latestYear][0][isocode][0][0]);
					}
					
					var yearKey = ""+latestYear;
					var CodeKey = "ISO";
					var NameKey = "Province";
					//Preparing Data for bubble overlay layer. Data should be an array of objects.
					var obj = {};
					obj[yearKey] = Number(Object[latestYear][0][isocode][0][0]);
					obj[CodeKey] = isocode;
					obj[NameKey] = dureOverlays.getProvinceNamefromIso(isocode);
					
					currentBubbleOverlayData.push(obj);					
				}
			});
			
		} else {
			console.log('### ERROR: Year data does not match.');
		}
		
	});
	
	/********** setting display key for dureOverlays.BubbleOverlayOptions **********/

	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend] = {};
	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['displayName'] = info.derivedName;
	dureOverlays.bubbleColor = dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['fillColor'] = info.levels[0].scales[0].linear[0].colorScale[0];	

	dureOverlays.radiusFunction = new L.LinearFunction(new L.Point(0, 1), new L.Point(100, 40));	
	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['radius'] = dureOverlays.radiusFunction;
	
	//console.log(currentBubbleOverlayData);
	return currentBubbleOverlayData;
};

//Prepare bubble overlay data Country.

dureOverlays.prepareBubbleOverlayData = function (info, dataJSON) {
	
	var countryCentroids = dureOverlays.getCountryCentroids(); // For world level markers 
	//var stateCentroids = dureOverlays.getStateCentroids(); // For country level markers

	var currentBubbleOverlay = {};
	currentBubbleOverlay.data = dataJSON.data;

	var currentYear, latestYear;
	
	currentYear = iHealthMap.getCurrentyear();
	latestYear = dureOverlays.getLatestYearFromData(currentBubbleOverlay.data);
	
	var finalObject = {};

	//dureOverlays.customMarkerIconSizeMax = 0;
	var currentBubbleOverlayData = [];
	
	$.each(currentBubbleOverlay.data, function(index, Object) {

		if(Object[currentYear] != undefined){
			
			dureOverlays.yearOnLegend = currentYear;
			dureOverlays.circleMarkerRadiusMax = 0;
			
			$.each(countryCentroids, function (ind, Obj) {
				
				if (Object[currentYear][0][Obj.code] != undefined) {
					
					if (eval(dureOverlays.circleMarkerRadiusMax) < eval(Object[currentYear][0][Obj.code][0][0])) {
						dureOverlays.circleMarkerRadiusMax = eval(Object[currentYear][0][Obj.code][0][0]);
					}
					
					var yearKey = ""+currentYear;
					var CodeKey = "ISO";
					var NameKey = "Country";
					//Preparing Data for bubble overlay layer. Data should be an array of objects.
					var obj = {};
					obj[yearKey] = "" + Object[currentYear][0][Obj.code][0][0];
					obj[CodeKey] = Obj.code;
					obj[NameKey] = dureOverlays.getCountryNamefromIso(Obj.code);
					
					currentBubbleOverlayData.push(obj);
				}
			});
			
		} else if(Object[latestYear] != undefined){
			
			dureOverlays.yearOnLegend = latestYear;
			
			$.each(countryCentroids, function (ind, Obj) {

				if (Object[latestYear][0][Obj.code] != undefined) {
					
					if (eval(dureOverlays.circleMarkerRadiusMax) < eval(Object[latestYear][0][Obj.code][0][0])) {
						dureOverlays.circleMarkerRadiusMax = eval(Object[latestYear][0][Obj.code][0][0]);
					}
					
					var yearKey = ""+latestYear;
					var CodeKey = "ISO";
					var NameKey = "Country";
					//Preparing Data for bubble overlay layer. Data should be an array of objects.
					var obj = {};
					obj[yearKey] = "" + Object[latestYear][0][Obj.code][0][0];
					obj[CodeKey] = Obj.code;
					obj[NameKey] = dureOverlays.getCountryNamefromIso(Obj.code);
					
					currentBubbleOverlayData.push(obj);					
				}
			});
			
		} else {
			console.log('### ERROR: Year data does not match.');
		}
		
	});
	
	/********** setting display key for dureOverlays.BubbleOverlayOptions **********/

	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend] = {};
	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['displayName'] = info.derivedName;
	dureOverlays.bubbleColor = dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['fillColor'] = info.levels[0].scales[0].linear[0].colorScale[0];					

	dureOverlays.BubbleOverlayOptions['displayOptions'][dureOverlays.yearOnLegend]['radius'] = dureOverlays.radiusFunction;
	
	//console.log(currentBubbleOverlayData);
	return currentBubbleOverlayData;
}; 

dureOverlays.prepareBubbleOverlay = function (info, dataJSON, addToMap) {
	
	var bubbleOverlay = {};
	var currentBubbleOverlayData = [];

	dureOverlays.overlayArr.push(info.derivedName);
	
	if(dureUtil.getDataLevel() == 'province'){
		currentBubbleOverlayData = dureOverlays.prepareBubbleOverlayDistrictData(info, dataJSON);
	} else if (dureUtil.getDataLevel() == 'country'){
		currentBubbleOverlayData = dureOverlays.prepareBubbleOverlayProvinceData(info, dataJSON);
	} else {
		currentBubbleOverlayData = dureOverlays.prepareBubbleOverlayData(info, dataJSON);
	}	
	
	/* overwritting the leaflet function for the bubble size with max value */
	dureOverlays.updateCircularMarker();

	//console.log(dureOverlays.BubbleOverlayOptions);	
	//console.log(currentBubbleOverlayData);
	
	//Instantiate an bubble overlay 			
	var bubbleOverlayLayer = new L.DataLayer(currentBubbleOverlayData, dureOverlays.BubbleOverlayOptions);	
	dureOverlays.allOverlayLayers.push(bubbleOverlayLayer);
	
	if (addToMap) {
		bubbleOverlayLayer.addTo(iHealthMap.map);			
	}	
};

// Updates the radius of Circular Marker
dureOverlays.updateCircularMarker = function(){
	
	var radiusMAXBase = dureOverlays.circleMarkerRadiusMax;
	var multiplicationFactor = 25;
	
	//console.log(radiusMAXBase);
	//console.log(numDigits(radiusMAXBase));
	
	if(dureOverlays.numDigits(radiusMAXBase) > 3){    
		multiplicationFactor = 250;
	}
	
	L.CircleMarker = L.CircleMarker.extend({
	
		initialize: function(latlng, options) {
			L.Circle.prototype.initialize.call(this, latlng, null, options);

			var actualRadius = this.options.radius;
//console.log(radiusMAXBase);
//console.log(radiusMAXBase.length);
//console.log(multiplicationFactor);
//console.log(actualRadius);
			var proportionalRadius = Math.round((actualRadius * multiplicationFactor / radiusMAXBase), 0);			
//console.log(proportionalRadius);				
			if (proportionalRadius > 10) {
				proportionalRadius = 10;
			}
//console.log(proportionalRadius);			
			this._radius = proportionalRadius;
		},
	});
};

/******************************************** SECTION: Custom Marker Overlay ***************************************************/

// Calculate custom marker icon size
dureOverlays.customMarkerIconSize = function(markerValue){
	
	var multiplicationFactor = 50;
	
	if(dureOverlays.numDigits(dureOverlays.customMarkerIconSizeMax) > 4){    
		multiplicationFactor = 250;
	}
	
	var proportionalMarkerIconSize = Math.round((markerValue * multiplicationFactor / dureOverlays.customMarkerIconSizeMax), 0);			
	
	//console.log(proportionalMarkerIconSize);
	
	if (proportionalMarkerIconSize > 25) {
		proportionalMarkerIconSize = 25;
	}
	
	return proportionalMarkerIconSize;
};

// Gets the color according to the data-scale and color-scale from provided data .
dureOverlays.getColorScaleForData = function (markerValue, overlayinfo) {

    var scale = {};
    if (markerValue != undefined) {

		if(dureUtil.getDataLevel() == 'country'){
			
			scale.lower = overlayinfo.levels[1].scales[0].linear[0].lowScale;
			scale.higher = overlayinfo.levels[1].scales[0].linear[0].highScale;
			scale.color = overlayinfo.levels[1].scales[0].linear[0].colorScale;
			scale.scaleDesc = overlayinfo.levels[1].scales[0].linear[0].scaleDesc;
			
		} else if(dureUtil.getDataLevel() == 'province') {
		
			scale.lower = overlayinfo.levels[2].scales[0].linear[0].lowScale;
			scale.higher = overlayinfo.levels[2].scales[0].linear[0].highScale;
			scale.color = overlayinfo.levels[2].scales[0].linear[0].colorScale;
			scale.scaleDesc = overlayinfo.levels[2].scales[0].linear[0].scaleDesc;
			
		} else {
			
			scale.lower = overlayinfo.levels[0].scales[0].linear[0].lowScale;
			scale.higher = overlayinfo.levels[0].scales[0].linear[0].highScale;
			scale.color = overlayinfo.levels[0].scales[0].linear[0].colorScale;
			scale.scaleDesc = overlayinfo.levels[0].scales[0].linear[0].scaleDesc;
		}

        // For standard data format calculate the legend using scales higher and lower
        if (overlayinfo.dataFormat == 'Standard') {

            for (var i = 0; i < scale.higher.length; i++) {
                if (markerValue >= scale.lower[i] && markerValue <= scale.higher[i]) {
                    scale.markerColor = scale.color[i];
                } else if (markerValue > scale.higher[scale.higher.length - 1]) {
                    scale.markerColor = scale.color[i];
                } else if (markerValue < scale.lower[0]) {
                    scale.markerColor = scale.color[i];
                }
            }
        } else { // For non-standard data format calculate the legend using scale description
			
            for (var i = 0; i < scale.scaleDesc.length; i++) {

                if (scale.scaleDesc[i] != "null") {

                    if (scale.scaleDesc[i] == markerValue) {
                        scale.markerColor = scale.color[i];
                    }
                }
            }
        }

        if (scale.markerColor == undefined) {
            scale.markerColor = '#000000';
        }
    }
    
    return scale.markerColor;
};

// Prepare marker data for Province Level
dureOverlays.prepareDistrictDataForCustomMarkerLayer = function(overlayinfo, dataJSON) {

	//console.log(overlayinfo);
	//console.log(dataJSON);

	var currentProvince = province.dbClickCrntObj.target.feature.properties.ISO;
	var customMarkerOverlay = {};
	customMarkerOverlay.data = dataJSON.data;

	var currentYear, latestYear;
	
	currentYear = iHealthMap.getCurrentyear();
	latestYear = dureOverlays.getLatestYearFromData(customMarkerOverlay.data);
	
	var finalObject = {};
	var currentCustomMarkerOverlayData = [];
	
	$.each(customMarkerOverlay.data, function(index, Object) {
	
		if(Object[currentYear] != undefined){
			
			dureOverlays.yearOnLegend = currentYear;
			
			$.each(Object[currentYear][0], function (districtISO, Obj) {
			
				if (districtISO != undefined) {
					
					var markerValue = Obj[0][0];
					var jsonObject = {};					
					
					var districtInfo = dureOverlays.getDistrictCentroid(districtISO); // For province level markers 
					
					//console.log(districtInfo);
					
					/* if (eval(dureOverlays.customMarkerIconSizeMax) < eval(Object[latestYear][0][isocode][0][0])){

						dureOverlays.customMarkerIconSizeMax = eval(Object[latestYear][0][isocode][0][0]);
					} */					
					
					jsonObject.lat = districtInfo[districtISO].lat;
					jsonObject.lon = districtInfo[districtISO].lon;
					jsonObject.code = districtISO;
					jsonObject.name = dureOverlays.getDistrictNamefromIso(districtISO);
					jsonObject.value = numberWithRound(markerValue, 2);					
					jsonObject.color = dureOverlays.getColorScaleForData(markerValue, overlayinfo);
					
					finalObject[districtISO] = jsonObject;
				}
			
			});			
			
		} else if(Object[latestYear] != undefined){
			
			dureOverlays.yearOnLegend = latestYear;
			
			$.each(Object[latestYear][0], function (districtISO, Obj) {
			
				if (districtISO != undefined) {
					
					var markerValue = Obj[0][0];
					var jsonObject = {};
					
					var districtInfo = dureOverlays.getDistrictCentroid(districtISO); // For province level markers 
					
					/* if (eval(dureOverlays.customMarkerIconSizeMax) < eval(Object[latestYear][0][isocode][0][0])){

						dureOverlays.customMarkerIconSizeMax = eval(Object[latestYear][0][isocode][0][0]);
					} */
					
					jsonObject.lat = districtInfo[districtISO].lat;
					jsonObject.lon = districtInfo[districtISO].lon;
					jsonObject.code = districtISO;
					jsonObject.name = dureOverlays.getDistrictNamefromIso(districtISO);
					jsonObject.value = numberWithRound(markerValue, 2);					
					jsonObject.color = dureOverlays.getColorScaleForData(markerValue, overlayinfo);
					
					finalObject[districtISO] = jsonObject;
				}
			
			});	
			
		} else {
			console.log('### ERROR: Year data does not match.');
		}
		
	});
	//console.log(finalObject);
	return finalObject;
};

// Prepare marker data for Country level 
dureOverlays.prepareStateDataForCustomMarkerLayer = function(overlayinfo, dataJSON) {

	//console.log(overlayinfo);
	var regionCentroids;
	
	regionCentroids = dureOverlays.getStateCentroids(); // For country level markers	
	
	//console.log(regionCentroids);
	
	var customMarkerOverlay = {};
	customMarkerOverlay.data = dataJSON.data;

	var currentYear, latestYear;
	
	currentYear = iHealthMap.getCurrentyear();
	latestYear = dureOverlays.getLatestYearFromData(customMarkerOverlay.data);
	
	var finalObject = {};
	var currentCustomMarkerOverlayData = [];

	//dureOverlays.customMarkerIconSizeMax = 0;
	
	//console.log(customMarkerOverlay);
	
	$.each(customMarkerOverlay.data, function(index, Object) {
	
		if(Object[currentYear] != undefined){
			
			//console.log(Object[currentYear]);
			
			dureOverlays.yearOnLegend = currentYear;
			
			var labelValue, labelValue1;
			
			$.each(regionCentroids, function (iso, Obj) {
				
				if (Object[currentYear][0][iso] != undefined) {
					
					var markerValue = Object[currentYear][0][iso][0][0];					
					var markerValue1 = Object[currentYear][0][iso][0][1];					
					
					if(Object[currentYear][0][iso][1][0] != "" && Object[currentYear][0][iso][1][0] != undefined) {
						labelValue = Object[currentYear][0][iso][1][0];	
						labelValue1 = Object[currentYear][0][iso][1][1];	
					}

					var jsonObject = {};					
					
					/* if (eval(dureOverlays.customMarkerIconSizeMax) < eval(Object[currentYear][0][isocode][0][0])){

						dureOverlays.customMarkerIconSizeMax = eval(Object[currentYear][0][isocode][0][0]);
					} */
					
					jsonObject.lat = Obj.lat;
					jsonObject.lon = Obj.lng;
					jsonObject.code = iso;
					jsonObject.name = dureOverlays.getProvinceNamefromIso(iso);
					
					if(labelValue != ""){
						jsonObject.label = labelValue;					
					}
					
					jsonObject.value = numberWithRound(markerValue, 2);
					
					//jsonObject[''+labelValue1] = markerValue1;	
					
					jsonObject.color = dureOverlays.getColorScaleForData(markerValue, overlayinfo);
					
					finalObject[iso] = jsonObject;
				}
			});
			
		} else if(Object[latestYear] != undefined){
			
			dureOverlays.yearOnLegend = latestYear;
			
			$.each(regionCentroids, function (iso, Obj) {
				
				if (Object[latestYear][0][iso] != undefined) {
					
					var markerValue = Object[latestYear][0][iso][0][0];
					var jsonObject = {};
					
					/* if (eval(dureOverlays.customMarkerIconSizeMax) < eval(Object[latestYear][0][isocode][0][0])){

						dureOverlays.customMarkerIconSizeMax = eval(Object[latestYear][0][isocode][0][0]);
					} */
					
					//console.log(dureOverlays.getProvinceNamefromIso(iso));
					
					jsonObject.lat = Obj.lat;
					jsonObject.lon = Obj.lng;
					jsonObject.code = iso;
					jsonObject.name = dureOverlays.getProvinceNamefromIso(iso);
					
					if ($.isNumeric(markerValue)) {
						jsonObject.value = dureUtil.numberWithSpace(markerValue);
					} else {
						jsonObject.value = numberWithRound(markerValue, 2);
					}
					
					jsonObject.color = dureOverlays.getColorScaleForData(markerValue, overlayinfo);
					
					finalObject[iso] = jsonObject;
				}
			});
			
		} else {
			console.log('### ERROR: Year data does not match.');
		}
		
	});
	//console.log(finalObject);
	return finalObject;
};

// Prepare marker data for World level 
dureOverlays.prepareDataForCustomMarkerLayer = function(overlayinfo, dataJSON) {

//	console.log(overlayinfo);
//	console.log(dataJSON);
	var regionCentroids;		
	
	regionCentroids = dureOverlays.getCountryCentroids(); // For world level markers 	
	
	var customMarkerOverlay = {};
	customMarkerOverlay.data = dataJSON.data;

	var currentYear, latestYear;
	
	currentYear = iHealthMap.getCurrentyear();
	latestYear = dureOverlays.getLatestYearFromData(customMarkerOverlay.data);
	
	var finalObject = {};
	var currentCustomMarkerOverlayData = [];

	//dureOverlays.customMarkerIconSizeMax = 0;
	
	$.each(customMarkerOverlay.data, function(index, Obj1) {
		
		var countryArray,firstISOCountry;
		
		if(Obj1[currentYear] != undefined){
			
			countryArray = Object.keys(Obj1[currentYear][0]);
		} else if(Obj1[latestYear] != undefined){
		
			countryArray = Object.keys(Obj1[latestYear][0]);
		}
		
		firstISOCountry = countryArray[0];
		
		//console.log(countryArray[0]);
		
		if(Obj1[currentYear] != undefined){
			
			//console.log(Obj1[currentYear]);
			
			dureOverlays.yearOnLegend = currentYear;			
			var labelValue, labelValue1, labelValue2;
			
			$.each(regionCentroids, function (ind, Obj) {
				
				if (Obj1[currentYear][0][Obj.code] != undefined) {
					
					var jsonObject = {};					
					
					var markerValue = Obj1[currentYear][0][Obj.code][0][0];					
					var markerValue1 = Obj1[currentYear][0][Obj.code][0][1];					
					var markerValue2 = Obj1[currentYear][0][Obj.code][0][2];					
					
					if(Obj1[currentYear][0][firstISOCountry][1][0] != undefined && Obj1[currentYear][0][firstISOCountry][1][0] != "") {
						labelValue = Obj1[currentYear][0][firstISOCountry][1][0];	
/* 						labelValue1 = Obj1[currentYear][0][firstISOCountry][1][1];	
						labelValue2 = Obj1[currentYear][0][firstISOCountry][1][2]; */	
					}	

					if(Obj1[currentYear][0][firstISOCountry][1][1] != undefined && Obj1[currentYear][0][firstISOCountry][1][1] != "") {	
						labelValue1 = Obj1[currentYear][0][firstISOCountry][1][1];							
					}

					if(Obj1[currentYear][0][firstISOCountry][1][2] != undefined && Obj1[currentYear][0][firstISOCountry][1][2] != "") {
						labelValue2 = Obj1[currentYear][0][firstISOCountry][1][2];	
					}					
					
					/* if (eval(dureOverlays.customMarkerIconSizeMax) < eval(Obj1[currentYear][0][isocode][0][0])){

						dureOverlays.customMarkerIconSizeMax = eval(Obj1[currentYear][0][isocode][0][0]);
					} */
					
					jsonObject.lat = Obj.center.lat;
					jsonObject.lon = Obj.center.lng;
					jsonObject.code = Obj.code;
					//jsonObject.name = dureOverlays.getCountryNamefromIso(Obj.code);
					jsonObject['Country'] = dureOverlays.getCountryNamefromIso(Obj.code);
					
					if ($.isNumeric(markerValue)) {
						jsonObject.value = dureUtil.numberWithSpace(markerValue);
					} else {
						jsonObject.value = numberWithRound(markerValue, 2);
					}
					
					if ($.isNumeric(markerValue1)) {
						markerValue1 = dureUtil.numberWithSpace(markerValue1);
					} else {
						markerValue1 = numberWithRound(markerValue1, 2);
					}
					
					if ($.isNumeric(markerValue2)) {
						markerValue2 = dureUtil.numberWithSpace(markerValue2);
					} else {
						markerValue2 = numberWithRound(markerValue2, 2);
					}
					
					if(labelValue != undefined){
						//jsonObject.label = labelValue;	
						jsonObject[''+labelValue] = jsonObject.value;												
					}
					
					if(labelValue1 != undefined){							
						jsonObject[''+labelValue1] = markerValue1;												
					}
					
					if(labelValue2 != undefined){						
						jsonObject[''+labelValue2] = markerValue2;						
					}
					
					//jsonObject.value = numberWithRound(markerValue, 2);
					
					//jsonObject[''+labelValue1] = markerValue1;	
					
					jsonObject.color = dureOverlays.getColorScaleForData(markerValue, overlayinfo);
					
					//console.log(jsonObject);
					finalObject[Obj.code] = jsonObject;
				}
			});
			
		} else if(Obj1[latestYear] != undefined){
			
			dureOverlays.yearOnLegend = latestYear;			
			var labelValue, labelValue1, labelValue2;
			
			//console.log(Object.keys(Obj1[latestYear][0]));
			
			$.each(regionCentroids, function (ind, Obj) {
				
				//console.log(Obj.code);				
				//console.log(Obj1[latestYear][0]);
				//console.log(Obj1[latestYear][0][Obj.code]);
				
				if (Obj1[latestYear][0][Obj.code] != undefined) {
					
					//var markerValue = Obj1[latestYear][0][Obj.code][0][0];
					var jsonObject = {};					
					
					//console.log(Obj1[latestYear][0][Obj.code][0]);
					//console.log(Obj1[latestYear][0][Obj.code][1]);
					
					var markerValue = Obj1[latestYear][0][Obj.code][0][0];					
					var markerValue1 = Obj1[latestYear][0][Obj.code][0][1];					
					var markerValue2 = Obj1[latestYear][0][Obj.code][0][2];					
					
					if(Obj1[latestYear][0][firstISOCountry][1][0] != undefined && Obj1[latestYear][0][firstISOCountry][1][0] != "") {
												
						labelValue = Obj1[latestYear][0][firstISOCountry][1][0];								
					}
					
					if(Obj1[latestYear][0][firstISOCountry][1][1] != undefined && Obj1[latestYear][0][firstISOCountry][1][1] != "") {	
						labelValue1 = Obj1[latestYear][0][firstISOCountry][1][1];
					}

					if(Obj1[latestYear][0][firstISOCountry][1][2] != undefined && Obj1[latestYear][0][firstISOCountry][1][2] != "") {
						labelValue2 = Obj1[latestYear][0][firstISOCountry][1][2];	
					}
					
					/* if (eval(dureOverlays.customMarkerIconSizeMax) < eval(Obj1[latestYear][0][isocode][0][0])){

						dureOverlays.customMarkerIconSizeMax = eval(Obj1[latestYear][0][isocode][0][0]);
					} */
					
					jsonObject.lat = Obj.center.lat;
					jsonObject.lon = Obj.center.lng;
					jsonObject.code = Obj.code;
					//jsonObject.name = dureOverlays.getCountryNamefromIso(Obj.code);					
					jsonObject['Country'] = dureOverlays.getCountryNamefromIso(Obj.code);					

					//console.log(labelValue);
					//console.log(labelValue1);
					//console.log(labelValue2);
					
					if ($.isNumeric(markerValue)) {
						jsonObject.value = dureUtil.numberWithSpace(markerValue);
					} else {
						jsonObject.value = numberWithRound(markerValue, 2);
					}
					
					if ($.isNumeric(markerValue1)) {
						markerValue1 = dureUtil.numberWithSpace(markerValue1);
					} else {
						markerValue1 = numberWithRound(markerValue1, 2);
					}
					
					if ($.isNumeric(markerValue2)) {
						markerValue2 = dureUtil.numberWithSpace(markerValue2);
					} else {
						markerValue2 = numberWithRound(markerValue2, 2);
					}
					
					if(labelValue != undefined) {
						//jsonObject.label = labelValue;
						jsonObject[''+labelValue] = jsonObject.value;
					}					
					
					if(labelValue1 != undefined) {
						jsonObject[''+labelValue1] = markerValue1;					
					}
					
					if(labelValue2 != undefined) {
						jsonObject[''+labelValue2] = markerValue2;					
					}
					
					jsonObject.color = dureOverlays.getColorScaleForData(markerValue, overlayinfo);
					//console.log(jsonObject);
					finalObject[Obj.code] = jsonObject;
				}
			});
			
		} else {
			console.log('### ERROR: Year data does not match.');
		}
		
	});
	//console.log(finalObject);
	return finalObject;
};

dureOverlays.drawCustomMarkerOverlay = function(overlayinfo, dataJSON, addToMap) {
	
	//console.log(dataJSON);
	//console.log(overlayinfo);
	
	dureOverlays.scaleRangeCat = { regionList: {}, apply: true };
	dureOverlays.overlayArr.push(overlayinfo.derivedName);

    var dataForCustomMarkerLayer;
	
	if(dureUtil.getDataLevel() == 'country'){
		
		dataForCustomMarkerLayer = dureOverlays.prepareStateDataForCustomMarkerLayer(overlayinfo, dataJSON);
		
	} else if(dureUtil.getDataLevel() == 'province'){
		
		dataForCustomMarkerLayer = dureOverlays.prepareDistrictDataForCustomMarkerLayer(overlayinfo, dataJSON);
		
	} else {
		dataForCustomMarkerLayer = dureOverlays.prepareDataForCustomMarkerLayer(overlayinfo, dataJSON);
	}
	
	//console.log(overlayinfo);
	//console.log(dataForCustomMarkerLayer);

    var sizeFunction = new L.LinearFunction([1, 16], [253, 48]);

    var options = {
        recordsField: null,
        locationMode: L.LocationModes.LATLNG,
        latitudeField: 'lat',
        longitudeField: 'lon',
        displayOptions: {
            'value': {
                /* color: new L.HSLHueFunction([0, 200], [253, 330], {
                    outputLuminosity: '60%'
                }) */
                color: '#ff0000'
            }
        },
        layerOptions: {
            fill: false,
            stroke: false,
            weight: 0,
            color: '#A0A0A0'
        },
        setIcon: function (record, options) {

            var markerType = "";
            var markerValue = "";
            var style = "";

            var color = L.Util.getFieldValue(record, 'color');
            var value = L.Util.getFieldValue(record, 'value');

            if (overlayinfo.derivedStyle == 'Star') {
                markerType = "fa fa-star-o";              
            } else if (overlayinfo.derivedStyle == 'Triangle') {
                markerType = "ihealth-icon-triangle";
            } else if (overlayinfo.derivedStyle == 'Circle') {
                markerType = "ihealth-icon-circle2";
            } else if (overlayinfo.derivedStyle == 'Diamond') {
                markerType = "ihealth-icon-hexagon";
            } else if (overlayinfo.derivedStyle == 'Population') {
                markerType = "fa fa-users";
            } else if (overlayinfo.derivedStyle == 'Health Facility') {
                markerType = "fa fa-hospital-o";
            } else if (overlayinfo.derivedStyle == 'House Hold') {
                markerType = "fa fa-home";
            } else if (overlayinfo.derivedStyle == 'Marker') {
                markerType = "badge-with-values";
                markerValue = value;
                style = 'background: radial-gradient( 5px -9px, circle, white 8%, ' + color + ' 26px );' +
                    'background: -moz-radial-gradient( 5px -9px, circle, white 8%, ' + color + ' 26px );' +
                    'background: -ms-radial-gradient( 5px -9px, circle, white 8%, ' + color + ' 26px );' +
                    'background: -o-radial-gradient( 5px -9px, circle, white 8%, ' + color + ' 26px );' +
                    'background: -webkit-radial-gradient( 5px -9px, circle, white 8%, ' + color + ' 26px );' +
                    'background-color: ' + color + ';';
                color = '#000000';
            }

            if ((value == "Unknown") || (value == "None") || (value == "Null") || (value == "null") || (value == undefined) || (value == 'N/A')) {
                markerType = "";
                markerValue = "";
                color = '#a9a9a9';
            }

            var html = '<div class="custom-icon-marker"><i class="' + markerType + '" style="' + style + '">' + markerValue + '</i></div>';

            var $html = $(html);
            var $i = $html.find('i');
            L.StyleConverter.applySVGStyle($i.get(0), options);

            var size = sizeFunction.evaluate(value);
            size = 10;

            $i.width(size);
            $i.height(size);
            $i.css('font-size', size + 'px');
            $i.css('font-weight', 'bolder');
            //$i.css('line-height', size + 'px');
            $i.css('color', color);

            var icon = new L.DivIcon({
                iconSize: new L.Point(size, size),
                iconAnchor: new L.Point(size / 2, size / 2),
                className: 'custom-icon',
                html: $html.wrap('<div/>').parent().html()
            });

            return icon;
        },
        onEachRecord: function (layer, record) {

            var record_copy = $.extend(true, [], record);

			//console.log(record);
			dureOverlays.prepareDataForOverLayBaseChart(record); // TODO Data for overlay chart
            
			delete record_copy.lat;
            delete record_copy.lon;
            delete record_copy.code;
            delete record_copy.color;
            //delete record_copy.value;
			
			//console.log(record_copy);			
            layer.bindPopup($(L.HTMLUtils.buildTable(record_copy)).wrap('<div/>').parent().html());
        }
    }

    var markerDataLayer = new L.MarkerDataLayer(dataForCustomMarkerLayer, options);
    dureOverlays.allOverlayLayers.push(markerDataLayer);
	if (addToMap) {
        markerDataLayer.addTo(iHealthMap.map);
		$('.custom-icon-marker').parent().removeAttr('title'); // Remove hover LATLNG title from markers
    }    
};

/****************************** SECTION: show overlays functions for overlay select control ******************************/

dureOverlays.showRadialChartForYear = function(option,overLayData){
	//console.log('REACHED');
	//console.log(overLayData);
	option.derivedName = option.label;
    var overLayDataArray = [];
	overLayDataArray.push(overLayData.data);
	dureOverlays.drawRadialBarChart(option,overLayDataArray);
};

dureOverlays.showBarChartForYear = function(info,overLayData){
	//console.log(option);
	//option.derivedName = option.label;
    var overLayDataArray = [];
	overLayDataArray.push(overLayData.data);
	dureOverlays.prepareBarOverlay(info,overLayDataArray);
}

dureOverlays.showBubbleOverlay = function(option, overLayData){	
	
	dureOverlays.setBubbleOverlayOptions();
	dureOverlays.prepareBubbleOverlay(overLayData.info,overLayData.data, true);
}

dureOverlays.showCustomMarkerOverlay = function (info, overLayData) {

    //console.log(overLayData);
    dureOverlays.drawCustomMarkerOverlay(info, overLayData.data, true);
	$('.custom-icon-marker').parent().removeAttr('title');
};

/***************************************** SECTION: Overlay data for specific year **********************************************/

dureOverlays.getOverlayDataForCurrentYear = function (currentYear, overLayLabel) {

    dureOverlays.currentOverlayScales = false;
    var currentDerivedData;
    var currentOverlayData = {};
    currentOverlayData.name = "";
    currentOverlayData.style = "";
    currentOverlayData.data = [];
	
    if (dureUtil.currentFormattedJSONData.extractedObjects != undefined) {
        
		var derivedDataExt = dureUtil.currentFormattedJSONData.extractedObjects.derivedDataExt;
        var derivedData = dureUtil.currentFormattedJSONData.extractedObjects.derivedData;
        //var derivedInfo = dureUtil.currentFormattedJSONData.extractedObjects.derivedInfo;
		var derivedInfo;

		//console.log(dureUtil.currentFormattedJSONData.extractedObjects);
		
		if(dureUtil.getDataLevel() == 'province'){
			derivedInfo = dureUtil.currentFormattedJSONData.extractedObjects.districtDerivedInfo;
		} else {
			derivedInfo = dureUtil.currentFormattedJSONData.extractedObjects.derivedInfo;
		}
		
/*      console.log(derivedDataExt);
        console.log(derivedData); */
        console.log(derivedInfo);

		console.log(overLayLabel);
		
        $.each(derivedInfo, function (index, object) {
						
			console.log(object.derivedName);			
			
			if (object.derivedName != undefined && dureUtil.trim(object.derivedName.toString().toUpperCase()) == dureUtil.trim(overLayLabel).toUpperCase()) {

				if (object.dataFormat == 'Non-Standard' && derivedDataExt != undefined) {
					
					var nonStdData = dureOverlays.getNonStandardDataFromDerivedId(object.derivedId, derivedDataExt);
					
					currentOverlayData.data = nonStdData;
					
				} else if (object.dataFormat == 'Standard' && derivedData != undefined) {
					
					var stdData = dureOverlays.getStandardDataFromDerivedId(object.derivedId, derivedData);
					
					if (object.derivedStyle == 'Radial') {
						/* Radial overlay data */
						// console.log('#### Hardcoding for Radial in Derived Data ####');
						//currentDerivedData = derivedData[index].data[0];                    
						currentOverlayData.data = stdData;

						/* PREPARE THE SCALES FOR THE RADIAL CHART */
						/* do this for first time only */
						if (!dureOverlays.currentOverlayScales) {

							dureOverlays.ScaleArry = [];
							$.each(object.levels[0].scales, function (i, j) {
								for (objName in j) {
									//console.log(objName);

									if (objName == 'radial') {

										$.each(j[objName], function (a, b) {
											//console.log(b);

											for (var x = 0; x < b.colorScale.length; x++) {

												var tempScaleObj = {};

												tempScaleObj.lowScale = b.lowScale[x];
												tempScaleObj.highScale = b.highScale[x];
												tempScaleObj.colorScale = b.colorScale[x];
												tempScaleObj.scaleDesc = b.scaleDesc[x];

												dureOverlays.ScaleArry.push(tempScaleObj);
											}
										});
									}
								}
							});
							dureOverlays.currentOverlayScales = true;
						}

						/* PREPARE THE SCALES FOR THE RADIAL CHART */
						// Get all the years not just current .. U r showing radials for each year !!!

					} else {
						currentOverlayData.data = stdData;
					}
					
				} else {
					console.log('### ERROR: Derived IDs does not match while preparing data.');
				}
				
				currentOverlayData.name = object.derivedName;
				currentOverlayData.style = object.derivedStyle;
				currentOverlayData.info = object;
				
			} else {
				console.log('### ERROR: Selected overlay name does not match derivedName.');
			}
        });
    }

    //console.log(currentOverlayData);
    return currentOverlayData;
};

/***************************************** SECTION: Overlay select control **********************************************/

L.Control.SelectLayers.prototype._onOverlayLayerOptionChange = function (e) {
    //Note. Don't try to implement this function through .selectedIndex
    //or delegation of click event. These methods have bunch of issues on Android devices.
    console.log("### Overlay Clicked ###");
    //dureOverlays.clearOverlays();
	dureOverlays.circleMarkerRadiusMax = 0;           // TODO
    var options = this._overlaysList.options;

    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        var layer = this._layers[option.layerId].layer;

        console.log('###'+option.selected);

		if (option.label == 'X|Clear' && option.selected == true) {

            gaviOverlays.clearOverlays();
            return false;
        } else if (option.label == 'GAVI' && option.selected == true) {

            console.log('gavi');

            //gaviOverlays.clearOverlays();
            //iHealthMap.map.addLayer(gaviOverlays.Gavi_overlay);

            if (iHealthMap.map.hasLayer(gaviOverlays.gaviOverlay)) {

                console.log('remove gavi layer');
                iHealthMap.map.removeLayer(gaviOverlays.gaviOverlay);

            } else {

                console.log('add gavi layer');
                iHealthMap.map.addLayer(gaviOverlays.gaviOverlay);
            }

            return false;

        } else if (option.label == 'Non-GAVI' && option.selected == true) {

            console.log('non gavi');

            //gaviOverlays.clearOverlays();
            //iHealthMap.map.addLayer(gaviOverlays.Non_gavi_overlay);

            if (iHealthMap.map.hasLayer(gaviOverlays.nonGaviOverlay)) {

                console.log('remove non gavi layer');
                iHealthMap.map.removeLayer(gaviOverlays.nonGaviOverlay);
            } else {

                console.log('add non gavi layer');
                iHealthMap.map.addLayer(gaviOverlays.nonGaviOverlay);
            }

            return false;

        }
		
        if (option.selected) {

            if (option.text == 'X | Clear Overlays') {
                dureOverlays.clearOverlays();
                return false;
            } else {

            	dureOverlays.currentSelOverlayName = option.text;
                var overLayData = dureOverlays.getOverlayDataForCurrentYear(iHealthMap.getCurrentyear(), option.text);
				//console.log(overLayData);

				//dureOverlays.showOverLayLegendBox(option, overLayData.info);
                // Update the layer data for current layerid !!
                if (overLayData != undefined && overLayData.data.length != 0) {

					//this._layers[option.layerId].layer._data = overLayData.data;

					dureOverlays.currentOverlayStyle = overLayData.style;

					if (dureOverlays.currentOverlayStyle == 'Radial') {

						dureOverlays.showRadialChartForYear(option, overLayData);

					} else if (dureOverlays.currentOverlayStyle == 'Bubble') {

						dureOverlays.initObjBubbleChartOverlay();                       // reinitilize obj when bubble overlay change
						dureOverlays.showBubbleOverlay(option, overLayData);
						loadOverLayBaseChartBubble(option);	
						dureOverlays.showOverLayLegendBox(option, overLayData.info);	
						//iHealthChart.loadColumnChart('Overlay');						
						
					} else if ((overLayData.style == 'Marker') || (overLayData.style == 'Star') || (overLayData.style == 'Triangle') || (overLayData.style == 'Circle') || (overLayData.style == 'Diamond') || (overLayData.style == 'Population') || (overLayData.style == 'Health Facility') || (overLayData.style == 'House Hold')) {
						
						dureOverlays.showOverLayLegendBox(option, overLayData.info);
						dureOverlays.showCustomMarkerOverlay(overLayData.info, overLayData);
						loadOverLayBaseChart();	
					}

					//dureOverlays.showOverLayLegendBox(option, overLayData.info);

					if (!this._map.hasLayer(layer)) {
						this._map.addLayer(layer)
					}
							//loadOverLayBaseChart();	
				} else {

					console.log('### No Overlay Data');
					//dureApp.showDialog('Data is not available for ' + option.label + ' overlay for the year ' + iHealthMap.getCurrentyear(), 'info');
					dureOverlays.clearOverlays();
				}                
			}
		} else {
			console.log('Overlay not selected');
		}
	}
};

/********************************************* SECTION: Common functionalities *******************************************************/

// Get derivedData from derivedId
dureOverlays.getStandardDataFromDerivedId = function(derivedId, derivedData){

	var stdData = {};

	$.each(derivedData, function (ind, object) {

		//console.log(derivedId);
		//console.log(object);
		
		if (derivedId == object.derivedId) {
						
			stdData.data = object.data;			
		}

	});

	stdData.derivedId = derivedId;	
	return stdData;
};

dureOverlays.getNonStandardDataFromDerivedId = function(derivedId, derivedDataExt){

	var nonStdData = {};

	$.each(derivedDataExt, function (ind, object) {

		if (derivedId == object.derivedId) {
			
			nonStdData.data = object.data;			
		}

	});

	nonStdData.derivedId = derivedId;
	
	return nonStdData;

};

// Add Overlay select control to map 
dureOverlays.callOverlayControlsOnMap = function(overlayNameArr){
		
	var overlays = {};
	//console.log(overlayNameArr);
	//console.log(dureOverlays.allOverlayLayers);
	
	overlays = {
        "X | Clear Overlays": "" 	/* Hardcode for clear overlays */
    };
	
	$.each(overlayNameArr, function(index, value) {
		overlays[value] = dureOverlays.allOverlayLayers[index];
	});

	var currentView = dureUtil.retrieveFromLocal("currentView");
	//console.log(currentView);
	if(currentView.currentViewKey != null) {
		dureOverlays.selectLayer = L.control.selectLayers(baseMaps, overlays, {
			position: "topleft"
		});
		dureOverlays.selectLayer.addTo(iHealthMap.map);
	} else {
		//console.log('CHECKING SELECT LAYER');
		if (dureOverlays.selectLayer != undefined) {
			//console.log('REMOVING SELECT LAYER');
			dureOverlays.selectLayer.removeLayer(dureOverlays.allOverlayLayers);
            // selectLayer.removeFrom(province.map);     // Commented by Shone == For JH
            dureOverlays.selectLayer.removeFrom(iHealthMap.map);
            dureOverlays.selectLayer = null;
        }
	}
};

// Format geoJson for provinces(states) of a country so as to support the leaflet dvf functionality.
dureOverlays.formatStatesGeoJson = function(geoJSON){

	var formatgeoJson = {};

	$.each(geoJSON.features,function(key,val){
		var featureObj = {};
		var featureArr = [];
		featureObj = {	
			'type':'Feature',
			'geometry': {
				'coordinates':val.geometry.coordinates,
				'type':val.geometry.type
			},
			'properties':{
				'name': val.properties.NAME_1,
				'ISO':val.properties.ISO
			}
		}

		featureArr.push(featureObj);
		formatgeoJson[val.properties.ISO] = {		
			'type': 'FeatureCollection',
			'features': featureArr
		}	
	});	
	return formatgeoJson;
};

// Format geoJson for provinces(states) of a country so as to support the leaflet dvf functionality.
dureOverlays.formatDistrictGeoJson = function(geoJSON){

	var formatgeoJson = {};

	$.each(geoJSON.features,function(key,val){
		var featureObj = {};
		var featureArr = [];
		featureObj = {	
			'type':'Feature',
			'geometry': {
				'coordinates':val.geometry.coordinates,
				'type':val.geometry.type
			},
			'properties':{
				'name': val.properties.NAME_1,
				'ISO':val.properties.ISOCODE
			}
		}

		featureArr.push(featureObj);
		formatgeoJson[val.properties.ISOCODE] = {		
			'type': 'FeatureCollection',
			'features': featureArr
		}	
	});	
	return formatgeoJson;
};

// Fetch centroids of the provinces(states) for displaying markers overlay
dureOverlays.getDistrictCentroid = function(districtISO) {

	// Overiding or formating the respective province geojson as per leaflet-dvf format.		
	L.districts = dureOverlays.formatDistrictGeoJson(subprovince.geoJson);	
	
	// Overwriting L.districtCentroids
	L.districtCentroids = L.GeometryUtils.loadCentroids(L.districts);
	
	var finalObject = {};
	
	$.each(L.districtCentroids, function (iso, Obj) {

		if(districtISO == iso){		

			var jsonObject = {};					
			
			jsonObject.lat = Obj.lat;
			jsonObject.lon = Obj.lng;
			
			finalObject[iso] = jsonObject;		
		}
	});
	
    //return L.districtCentroids;
	return finalObject;
};

// Fetch centroids of the provinces(states) for displaying markers overlay
dureOverlays.getStateCentroids = function() {

	// Overiding or formating the respective province geojson as per leaflet-dvf format.		
	L.states = dureOverlays.formatStatesGeoJson(dureUtil.geoJson);	
	
	// Overwriting L.stateCentroids
	L.stateCentroids = L.GeometryUtils.loadCentroids(L.states);

    return L.stateCentroids;
};

// Fetch centroids of the countries for displaying markers overlay 
dureOverlays.getCountryCentroids = function () {

    var countriesGEOJSON = L.countries;
    var countryCenters = [];

    $.each(countriesGEOJSON, function (index, Object) //<--- fetch countries with centroids from geoJson
        {
            var center = L.GeometryUtils.loadCentroid(Object);
            var object = {};
            object.code = index;
            object.center = center;
            countryCenters.push(object);
        });

    return countryCenters;
};

dureOverlays.getCountryNamefromIso = function (isocode) {

    var regionName;
    for (var iso in L.countries) {

        if (isocode == iso) {
            regionName = L.countries[iso].features[0].properties.name;
            break;
        }
    }
    return regionName;
};

dureOverlays.getProvinceNamefromIso = function (isocode) {
	
	var regionName;
	for(var iso in L.states){
	
		if(isocode == iso){			
			regionName = L.states[iso].features[0].properties.name;
			break;
		}	
	}
	return regionName;
};


dureOverlays.getDistrictNamefromIso = function (isocode) {

	var districtName;

	for (var i = 0; i <= (subprovince.geoJson.features.length - 1); i++) {

		if (subprovince.geoJson.features[i].properties.ISOCODE == isocode) {
			districtName = subprovince.geoJson.features[i].properties.NAME_2;
			break;
		}
	}
	return districtName;
}

// Fetch latest year from data
dureOverlays.getLatestYearFromData = function (data) {
	var yearsWithData = dureUtil.getYearsWithData(data[0]);
	return Math.max.apply(Math,yearsWithData);
}

dureOverlays.numDigits = function (x) {
	
	var num = (Math.log((x ^ (x >> 31)) - (x >> 31))/Math.log(10) | 0) + 1;	
	return num;
}

/********************************************* SECTION: Overlay Legend *******************************************************/

dureOverlays.showOverLayLegendBox = function (option, overlayInfo) {

console.log('### overlay legend ###');
//console.log(overlayInfo);

    var overlayStyle = overlayInfo.derivedStyle;
    var scale = {};
    var html = '';
    var icon = '';
    if (overlayStyle == 'Chart') {
        icon += '<h5>' + option.label + '</h5>' + '<i class="overlay-chart" style="background:#73D137;border:1px solid;float:left;margin-right:10px;height:15px;width:15px;"></i>Male<br/>' +
            '<i class="overlay-chart" style="background:#CE1F37;border:1px solid;float:left;margin-right:10px;height:15px;width:15px;"></i>Female';
    } else if (overlayStyle == 'Bubble') {
		
		icon += '<div class="legendInnerDiv"><h5>' + option.label + '</h5> - ' + dureOverlays.yearOnLegend + '<i class="legendstyle overlay-bubble" style="background: linear-gradient(145deg,#e5e6eb, ' + dureOverlays.bubbleColor + '); background-color:'+ dureOverlays.bubbleColor + ';"></i></div>';

    } else if ((overlayStyle == 'Marker') || (overlayStyle == 'Star') || (overlayStyle == 'Triangle') || (overlayStyle == 'Circle') || (overlayStyle == 'Diamond') || (overlayStyle == 'Population') || (overlayStyle == 'Health Facility') || (overlayStyle == 'House Hold')) {

		if(dureUtil.getDataLevel() == 'country'){
			
			scale.lower = overlayInfo.levels[1].scales[0].linear[0].lowScale;
			scale.higher = overlayInfo.levels[1].scales[0].linear[0].highScale;
			scale.color = overlayInfo.levels[1].scales[0].linear[0].colorScale;
			scale.scaleDesc = overlayInfo.levels[1].scales[0].linear[0].scaleDesc;
			dureOverlays.colorContainer = scale;
		
		} else if(dureUtil.getDataLevel() == 'province'){
		
			scale.lower = overlayInfo.levels[2].scales[0].linear[0].lowScale;
			scale.higher = overlayInfo.levels[2].scales[0].linear[0].highScale;
			scale.color = overlayInfo.levels[2].scales[0].linear[0].colorScale;
			scale.scaleDesc = overlayInfo.levels[2].scales[0].linear[0].scaleDesc;
			dureOverlays.colorContainer = scale;
			
		} else {
			
			scale.lower = overlayInfo.levels[0].scales[0].linear[0].lowScale;
			scale.higher = overlayInfo.levels[0].scales[0].linear[0].highScale;
			scale.color = overlayInfo.levels[0].scales[0].linear[0].colorScale;
			scale.scaleDesc = overlayInfo.levels[0].scales[0].linear[0].scaleDesc;
			dureOverlays.colorContainer = scale;
		}

        if (overlayStyle == 'Star') {
            markerType = "fa fa-star-o";
        } else if (overlayStyle == 'Triangle') {
            markerType = "ihealth-icon-triangle";
        } else if (overlayStyle == 'Circle') {
            markerType = "ihealth-icon-circle2";
        } else if (overlayStyle == 'Diamond') {
            markerType = "ihealth-icon-hexagon";
        } else if (overlayStyle == 'Population') {
            markerType = "fa fa-users";
        } else if (overlayStyle == 'Health Facility') {
            markerType = "fa fa-hospital-o";
        } else if (overlayStyle == 'House Hold') {
            markerType = "fa fa-home";
        } else if (overlayStyle == 'Marker') {
            markerType = "badge-with-values";
        }

        icon += '<div class="legendInnerDiv"><h5>' + option.label + ' - '+ dureOverlays.yearOnLegend +'</h5></div>';

        for (var i = 0; i < scale.scaleDesc.length; i++) {

            if ((scale.scaleDesc[i] == "Unknown") || (scale.scaleDesc[i] == "null") || (scale.scaleDesc[i] == "None") || (scale.scaleDesc[i] == "Null") || (scale.scaleDesc[i] == undefined) || (scale.scaleDesc[i] == 'N/A')) {
                icon += '';
            } else {

                if (markerType == 'badge-with-values') {
                    icon += '<div class="legendInnerDiv"><i class="legendstyle ' + markerType + '" style="color: ' + scale.color[i] + '; font-size:12px;font-weight:bolder; background: radial-gradient( 5px -9px, circle, white 8%, ' + scale.color[i] + ' 26px );' +
                        'background: -moz-radial-gradient( 5px -9px, circle, white 8%, ' + scale.color[i] + ' 26px );' +
                        'background: -ms-radial-gradient( 5px -9px, circle, white 8%, ' + scale.color[i] + ' 26px );' +
                        'background: -o-radial-gradient( 5px -9px, circle, white 8%, ' + scale.color[i] + ' 26px );' +
                        'background: -webkit-radial-gradient( 5px -9px, circle, white 8%, ' + scale.color[i] + ' 26px );' +
                        'background-color: ' + scale.color[i] + ';"></i>&nbsp;' + '<span> ' + scale.scaleDesc[i] + '</span></div>';
                } else {
                    icon += '<div class="legendInnerDiv"><i class="legendstyle ' + markerType + '" style="color: ' + scale.color[i] + '; font-size:12px;font-weight:bolder;"></i>&nbsp;' + '<span>' + scale.scaleDesc[i] + '</span></div>';
                }
            }
        }
    }

  //  html += '<div class="box-body" id="marker-legend" style="display: block;">' + icon + '</div>';
  html += '<div class="box-body" style="display: block;"><div id="marker-legend">' + icon + '</div></div>';

  //  $('#marker-legend').remove();
    $('#marker-legend').parent().remove();
    $('.scaleWrap .box').append(html);
};

/********************************************************************************************************************************/
/***************************************** Gavi/Non-Gavi DVF Stripes layer *******************************************************/
/********************************************************************************************************************************/

gaviOverlays.getCodes = function (fileterdRegoinValues) {

	var worldGeoJsonData = worldGeo;	
	var setFilterData = [];
	
	for (var i = 0; i <= (worldGeoJsonData.features.length - 1); i++) {
		for (var j = 0; (j <= fileterdRegoinValues.length - 1); j++) {
			
			//console.log(worldGeoJsonData.features[i].properties.iso_a3);
			//console.log([fileterdRegoinValues[j]]);
			
			if (worldGeoJsonData.features[i].properties.iso_a3 == fileterdRegoinValues[j].code) {
				setFilterData.push(worldGeoJsonData.features[i]);
			}
		}
	}
	return setFilterData;
}

gaviOverlays.prepareStripesOverLay = function () {
	
	var worldGeoJsonData = worldGeo;
	var gaviRegionList = dureMasterRegionList[0];
    var nonGaviRegionList = dureMasterRegionList[1];
	//var nonGaviRegionObject = {};
	
	//nonGaviRegionObject.nonGavi = nonGaviRegionList['Non-Gavi'];
	
	var gaviGeoJson = gaviOverlays.getCodes(gaviRegionList.Gavi);
	var nonGaviGeoJson = gaviOverlays.getCodes(nonGaviRegionList['Non-Gavi']);

	gaviOverlays.gaviOverlay = new L.GeoJSON(gaviGeoJson, {
		
		style: function (feature) {
			
		//console.log(feature);
			
			return {
				color: '#000',
				opacity: 1.0,
				weight: 1,
				fillOpacity: 0.7,
				fillPattern: {
					url: 'img/gavi.png',
					pattern: {
						width: '200px',
						height: '200px',
						patternUnits: 'userSpaceOnUse'
					},
					image: {
						width: '200px',
						height: '200px'
					}
				}
			}
		}
	});
	
	gaviOverlays.nonGaviOverlay = new L.GeoJSON(nonGaviGeoJson, {
		
		style: function (feature) {
			
		//console.log(feature);
			
			return {
				color: '#000',
				opacity: 1.0,
				weight: 1,
				fillOpacity: 0.7,
				fillPattern: {
					url: 'img/nongavi.png',
					pattern: {
						width: '200px',
						height: '200px',
						patternUnits: 'userSpaceOnUse'
					},
					image: {
						width: '200px',
						height: '200px'
					}
				}
			}
		}
	});
	
	//iHealthMap.map.addLayer(gaviOverlays.gaviOverlay);
	//iHealthMap.map.addLayer(gaviOverlays.nonGaviOverlay);
	
	var gaviOverlayLayers = {

		"GAVI": gaviOverlays.gaviOverlay,
		"Non-GAVI": gaviOverlays.nonGaviOverlay,
		"X|Clear": ''
	};
		
	if (gaviOverlays.selectLayer == "" || gaviOverlays.selectLayer == undefined || gaviOverlays.selectLayer == null) {

		gaviOverlays.selectLayer = L.control.selectLayers(baseMaps, gaviOverlayLayers, {
			position: "topleft",
            showBaseLayers: false
        }).addTo(iHealthMap.map);
    }
}

/* Overlay base chart  Data*/ 

dureOverlays.prepareDataForOverLayBaseChart = function(data) {
	if(data) {
		
		dureOverlays.prepareScaleWiseList(data);	
	}
}

	// Seperate Countries according to their scale value
dureOverlays.prepareScaleWiseList = function(data) {
			//console.log(data);
			var scaleRangeName = 'range-'+ data.color.replace(new RegExp('#', 'g'), "");
			var displayName = data.Country != undefined ? data.Country : data.Province != undefined ? data.Province : data.District != undefined ? record.District : "not defined"
			//var displayName = data.Country != undefined ? data.Country : data.name;
			var value = data.value;
			var metaContainer = [];
			if(!dureOverlays.scaleRangeCat.regionList.hasOwnProperty(scaleRangeName)) {
				dureOverlays.scaleRangeCat.regionList[scaleRangeName] = [];
			}
			metaContainer.push(displayName);
			metaContainer.push(value);
			dureOverlays.scaleRangeCat.regionList[scaleRangeName].push(metaContainer); 
}

function metaInfoPieChartOverLay(colorCode) {
    var returnInfo = {};
    returnInfo.name = 'No data available';
    var color = '#' + colorCode.substring(colorCode.lastIndexOf('-') + 1, colorCode.length);
    var metaInfo = dureOverlays.colorContainer;
    var colorScale = metaInfo.color;
    for(var i = 0; i < colorScale.length; i++){
        if(color == colorScale[i]) {
            returnInfo.name = metaInfo.scaleDesc[i];
            break;
        }
    }

    return returnInfo;
}


function prepareDataPieOverLay() {
    var returnChartData = {};
     returnChartData.series = [];
     returnChartData.drilldown = [];
     returnChartData.title = dureOverlays.currentSelOverlayName;
    $.each(dureOverlays.scaleRangeCat.regionList, function(index, val) {
        var innerData = {};
        var drillData = {};
        var meta = metaInfoPieChartOverLay(index);
        innerData.name = meta.name;
        innerData.y = val.length;
        innerData.color = '#' + index.substring(index.lastIndexOf('-') + 1, index.length);
        innerData.drilldown = meta.name;
        drillData.id = meta.name;
        drillData.type = 'column';
        drillData.data = [];
        for(var i =0; i < val.length; i++){
             var innerDrillData = [];
             //console.log(val[i][1].replace(/([,\s]{1,})/,""));
             innerDrillData.push(val[i][0]);
             
             innerDrillData.push(Number(val[i][1].toString().replace(/,/g,'')));

             drillData.data.push(innerDrillData);

        }
        drillData.dataLabels = {enabled:false};
        returnChartData.series.push(innerData);
        returnChartData.drilldown.push(drillData);
    });
     //console.log(returnChartData);
    return returnChartData;
}

/*Chart for bubble chart*/

dureOverlays.prepareRadiusWiseList = function(layer, record) {

	var bubbleRadius = Math.abs(layer._radius);
	var bubbleValue = record[dureOverlays.yearOnLegend];    // object Key Access by year on legend for bubble chart **
	var name = record.Country != undefined ? record.Country : record.Province != undefined ? record.Province : record.District != undefined ? record.District : "not defined"

	for(var i = 0; i < dureOverlays.radiusScaleRangeCat.range.length; i++) {
		if(dureOverlays.radiusScaleRangeCat.range[i].scale.indexOf(bubbleRadius) > -1) {
			var container = [];
			var keyName = dureOverlays.radiusScaleRangeCat.range[i].name;
			container.push(name);
			container.push(Number(bubbleValue));
			dureOverlays.radiusScaleRangeCat.regionList[keyName].push(container);
			break;
		}
	}
}

dureOverlays.parseDataBubbleChart = function(option) {
    var returnChartData = {};
     returnChartData.series = [];
     returnChartData.drilldown = [];
      returnChartData.title = option.innerHTML;
    $.each(dureOverlays.radiusScaleRangeCat.regionList, function(index, val) {
        var innerData = {};
        var drillData = {};
        innerData.name = index;
        innerData.y = val.length;        
		innerData.color = dureOverlays.bubbleColor;//'#FF0000';
        innerData.drilldown = index;
        drillData.id = index;
        drillData.type = 'column';
        drillData.data = [];
        for(var i =0; i < val.length; i++){
             var innerDrillData = [];
             //console.log(val[i][1].replace(/([,\s]{1,})/,""));
             //console.log(val[i]);
             innerDrillData.push(val[i][0]);
             
             innerDrillData.push(Number(val[i][1].toString().replace(/,/g,'')));

             drillData.data.push(innerDrillData);

        }
        drillData.dataLabels = {enabled:false};
        returnChartData.series.push(innerData);
        returnChartData.drilldown.push(drillData);
    });
   
    return returnChartData;
}