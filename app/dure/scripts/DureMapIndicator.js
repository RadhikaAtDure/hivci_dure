/*************************************** Section: Initialize and Set Map object *********************************************/
var province = {};
province.initialize = function (country, ISO) {
	dureOverlays.clearOverlays();
	iHealthMap.clearLayer(); // TODO remove layer from world
	dureOverlays.removeSelectLayers();
	console.log("==== Initializing the province objects ====");
	province._lat = -0.0312;
	province._long = 37.902;
	//iHealthMap._defaultZoom = 6;
	province._defaultZoom = 6;
	province._maxZoom = 18;
	province.geoJson = null;
	province.geojsonLayer = null;
	province.ggl = null;
	province.countryName = country;
	province.countryISO = ISO;
	province.fileName = province.countryISO + '.geojson'; // TODO change province name to lower case
	//console.log(province.fileName);
	province.currentYear = iHealthMap.currentYear;
	province.currentYearIndex = 0;
	province.minYearValue = 0;
	province.maxYearValue = 0;
	province.rangeOfYears = [];
	province.stateLayers = [];
	province.currentBounds = '';
	province.serviceUrl = '';
	province.name = '';
	province.id = 1;
	province.setMapObject();
	province.slideNext();
	province.slidePrev();
	province.population = null;
	province.dbClickCrntObj = null;
	province.scaleRangeCat = { regionList: {}, apply: true};     // 12/06/2015 Seperate provience accor. to scale
	filterLayerContainer('NAME_1', false, []);
	iHealthMap.setFullScreenZoomLevel(province._defaultZoom);
	province.createlabelBox(country);
};

//Setting map object.
province.setMapObject = function (data) {
	console.log("==== Setting map obj====");
	if (iHealthMap.map != undefined) {
		province.map = iHealthMap.map;
	}
	//province.loadLayer();  // Commented by shone due to bug
	dMap.renderInfoForMap();
}

/*************************************** Section: Set,Get and Check Map data ************************************************/
// Sets Map data
province.setDataForMap = function (data) {
	console.log("======== Setting province map data =======");
	console.log(data);
	for(var i = 0; i < data.indicators.length; i++){
		if(data.indicators[i].hasOwnProperty('indicatorData')){
			province.jsondata = data;		
			iHealthMap.jsondata = data;
			return true;	
		}else if(data.indicators[i].hasOwnProperty('indicatorDataExtension')){
			province.jsondata = data;		
			iHealthMap.jsondata = data;
			return true;
		}
	}
	if($.inArray(data.indicatorRegions[0].regionInfo.regionCode,["ESH","JMU","SAA"]) > -1)
	{
		dureApp.showDialog("Subnational data is not applicable", 'error');
	}else{
		dureApp.showDialog("Subnational data is not available", 'error');
	}
	
	return false;
};

// Checks data in provider.
province.checkDataInProvider = function () {
	//console.log(province.jsondata);
	if (province.jsondata != undefined) {
		return true;
	} else if (province.checkIfKeyExsistInStorage()) {
		if (province.getDataFromProvider()) {
			return true;
		}
	}
	return false;
}

// Gets data from provider.
province.getDataFromProvider = function () {
	console.log("==== Fetching Data for Sub province====");
};

/*********************************************** Section:Scale for province map *********************************************/

province.renderLegend = function () {
	// console.log("========= Rendering the legend and updating legend to province level ===========");
	//console.log(province.jsondata);
	var legend = {}; // TODO
	legend.colorScale = province.jsondata.indicators[0].indicatorInfo.levels[0].scales[0].linear[0].colorScale;
	legend.highScale = province.jsondata.indicators[0].indicatorInfo.levels[0].scales[0].linear[0].highScale;
	legend.lowScale = province.jsondata.indicators[0].indicatorInfo.levels[0].scales[0].linear[0].lowScale;
	legend.scaleDesc = province.jsondata.indicators[0].indicatorInfo.levels[0].scales[0].linear[0].scaleDesc;
	legend.indicatorName = province.jsondata.indicators[0].indicatorInfo.indicatorName;

	if (province.jsondata.metaInfo != undefined) {
		if (province.jsondata.metaInfo.levels != undefined) {
			$.each(province.jsondata.metaInfo.levels, function (index, levelObject) {

				if (levelObject.levelName == 'Province') {

					legend.colorScale = levelObject.scales[0].linear[0].colorScale;
					legend.highScale = levelObject.scales[0].linear[0].highScale;
					legend.lowScale = levelObject.scales[0].linear[0].lowScale;
					legend.scaleDesc = levelObject.scales[0].linear[0].scaleDesc;
				} else {
					console.log("Current level is not province level.");
				}
			});
		}
		legend.indicatorName = province.jsondata.metaInfo.indicatorName;
	}

	iHealthMap.renderLegend(legend);
}

/********************************************** Section:Province Layer Functions *******************************************/

//Loads province layer.
province.loadLayer = function () {
	console.log("======== Loading sub-province layer of country =======");
	console.log(province.fileName);
	
	$.getJSON('data/countries/' + province.fileName, function (result) { //TODO get geoJson
		if (dureUtil.geoJson != undefined) {
			//console.log(result);
			iHealthMap.reloadBaseLayer();
			province.clearMapLayer();
			province.geoJson = result;
			dureUtil.geoJson = result; // TODO """" not implemented
			
			iHealthMap.geoJson = province.geoJson;	
			province.addStyle();
			//loadPieChartCountryLevel(); // TODO
			
			iHealthChart.loadColumnChart('');
		}
	});
};

province.addStyle = function (layerFilter) {
	console.log("============ Styling provinces ===========");
	if(!layerFilter) {
		var layerFilter = {};
		layerFilter.baseKey = 'NAME_1';
		layerFilter.apply = false;
		layerFilter.container = [];
	}
	province.geojsonLayer = L.geoJson(province.geoJson, {
		filter: function(feature) {	return province.filterLayer(feature, layerFilter); },
		style : province.styleOnEachFeature,
		onEachFeature : province.onEachFeature
	});
	province.stateLayers.push(province.geojsonLayer);
	province.currentBounds = iHealthMap.dbClickCrntObj.target.getBounds();
	province.map.fitBounds(province.currentBounds);
	//province.map.setView(province.map.getCenter(), province.map.getZoom() + 1); // TODO 17/2/2015
	province.map.setView(province.map.getCenter(), 6);
	province.geojsonLayer.addTo(province.map);
};


province.filterLayer = function(feature, layerFilter) {
	var returnFilter = true;
	if(layerFilter.apply) {	
		var id = feature.properties[layerFilter.baseKey];
		returnFilter = province.idParser(layerFilter.container, id);
	}
	return returnFilter;	
}

province.idParser = function(container, id) {
		var retCheck = false;
		for(var i in container) {
			if(container.hasOwnProperty(i)) {
				if(container[i][0] === id) {
					retCheck = true;
					break;
				} else {
					if(container[i] === id) {
						retCheck = true;
						break;
					}
				}
			}
		}
		return retCheck;
}

province.styleOnEachFeature = function (feature) {

	var styleObj = province.getColorForProvince(feature.properties);	
	var classNam = 'range-'+ styleObj.scaleColor.replace(new RegExp('#', 'g'), "");
	if(province.scaleRangeCat.apply) {
		province.prepareScaleWiseRegionList(styleObj, feature.properties);
	}
	var style = {};
	return {
		weight : 1,
		opacity : 1,
		color : '#ffffff',
		fillOpacity : 0.7,
		fillColor : styleObj.scaleColor,
		 className: classNam
	};
};

//Seperate province according to their scale value
province.prepareScaleWiseRegionList = function(styleObj, properties) {
	//console.log(properties);
	var scaleRangeName = 'range-'+ styleObj.scaleColor.replace(new RegExp('#', 'g'), "");
	var provinceName = properties.NAME_1;
	var metaContainer = [];
	if(!province.scaleRangeCat.regionList.hasOwnProperty(scaleRangeName)) {
		province.scaleRangeCat.regionList[scaleRangeName] = [];
	} 
	metaContainer.push(provinceName);
	metaContainer.push(styleObj.scaleValue);
	province.scaleRangeCat.regionList[scaleRangeName].push(metaContainer); 
}

// Gets the color for province
province.getColorForProvince = function (e) {

	var color = {};
	// TODO change object properties name province.jsondata.coreData  to province.jsondata.indicators
	province.currentYear = iHealthMap.currentYear; // FIX ME :(
	if (province.jsondata.indicators != undefined) {
		if (province.jsondata.indicators[1] != undefined) {
			
			if (iHealthMap.getIndicatorDataType() == "Standard") {
				if (province.jsondata.indicators[1].indicatorData[0][province.currentYear]) {
					color.checkData = province.jsondata.indicators[1].indicatorData[0][province.currentYear][0][e.ISO];
				}
			} else {
				if (province.jsondata.indicators[1].indicatorDataExtension[0][province.currentYear]) {
					color.checkData = province.jsondata.indicators[1].indicatorDataExtension[0][province.currentYear][0][e.ISO];
				}
			}			
		}
	}

	//console.log(color.checkData);
	if (color.checkData != undefined) {
		color.data = color.checkData[0][0];
		color.iscolor = province.getColorScaleForData(color.data);
		color.scaleValue = color.data;                                                // TODO 12/06/2015 
		color.scaleColor = color.iscolor;
		return color;
	} else {
		color.iscolor = '#b2b2b2';
		color.scaleValue = undefined;				   // TODO 12/06/2015 
		color.scaleColor = '#b2b2b2';
		return color;	
	}
}

//Gets the color according the data-scale and color-scale from provided data .
province.getColorScaleForData = function (data) {
	//console.log('Get color for the layer');
	var scale = {};
	if (data != undefined) { // TODO
		if(iHealthMap.getIndicatorDataType() == "Standard"){
			if (province.jsondata.indicators[0].indicatorInfo != undefined) {
				if (province.jsondata.indicators[0].indicatorInfo.levels != undefined) {
					$.each(province.jsondata.indicators[0].indicatorInfo.levels, function (index, levelObject) {
						if (levelObject.levelName == 'Country') { // TO DO
							scale.lower = levelObject.scales[0].linear[0].lowScale;
							scale.higher = levelObject.scales[0].linear[0].highScale;
							scale.color = levelObject.scales[0].linear[0].colorScale;
						}
					});
				}
			}

			for (var i = 0; i < scale.higher.length; i++) {

				if (data >= scale.lower[i] && data <= scale.higher[i]) {
					scale.regionColor = scale.color[i];
				} else if (data > scale.higher[scale.higher.length - 1]) {
					scale.regionColor = scale.color[i];
				} else if (data < scale.lower[0]) {
					scale.regionColor = scale.color[i];
				}
			}
			
			if (data == -1) {
				scale.regionColor = '#b2b2b2';
			}
		} else {

			for (var i = 0; i < iHealthMap.FilterDataArr.length; i++) {
				
				if (iHealthMap.FilterDataArr[i][0].toLowerCase() == data.toLowerCase()) {
					scale.regionColor = iHealthMap.FilterDataArr[i][1];				
				}
			}			
		}
	}
	
	if (scale.regionColor == undefined) {
		scale.regionColor = '#b2b2b2';
	}

	return scale.regionColor;
}

province.onEachFeature = function (feature, layer) {
	if (iHealthMap.getIndicatorDataType() == "Standard") {
		var mapdata = province.jsondata.indicators[1].indicatorData;	
	} else {
		var mapdata = province.jsondata.indicators[1].indicatorDataExtension;
	}

	var popup_content = buildPopup(mapdata);
	if (popup_content != undefined) {
		layer.bindLabel(popup_content);
	}

	layer.on({
		mouseover : highlightFeature,
		mouseout : resetHighlight
	});

	$(layer).click(function (e) {
		setTimeout(function () {
			changeProvinceInfo();
		}, 300);
		console.log('click on layer');
		//Sets the province id for the clicked layer.
		province.setId(layer.feature.properties.ID);

		//Sets the province name for the clicked layer.
		province.setProvinceName(layer.feature.properties.NAME_1);

	}).dblclick(function (e) {

		if (province.setId(layer.feature.properties.ID_1)) {
			console.log("-------------- Drill downs to province level on dbl click -------");
			//alert('CLick to country level');
			dureOverlays.clearOverlays(); // Clear Overlays if overlays exsist--- By shone
			province.dbClickCrntObj = e;
			dureUtil.getDataOnDrillDown(layer.feature.properties.ID_1);
			// iHealthMap.reloadBaseLayer();
		}
		// Deactivates REGION-LEVEL functionality of slider.
		// province.deActivateSliderControls(); // --- Commented by Shone...
	});

	function changeProvinceInfo() {
		var isocode = layer.feature.properties.ISO;
		showProvinceInfo();
		province.changeChartInfo(isocode);
	}

	function showProvinceInfo() {

		var provinceInfo = {};
		provinceInfo.name = layer.feature.properties.NAME_1;
		// console.log(layer.feature.properties);
		// console.log(provinceInfo.name);
		// provinceInfo.code = layer.feature.properties.ProvinceCode; //Earleier line.
		provinceInfo.code = layer.feature.properties.ISO;
		if (iHealthMap.getIndicatorDataType() == "Standard") {
			provinceInfo.data = province.jsondata.indicators[1].indicatorData[0]; //TODO
		}else{
			provinceInfo.data = province.jsondata.indicators[1].indicatorDataExtension[0]; //TODO
		}
		
		//provinceInfo.data = province.jsondata.coreData[0];
		// provinceInfo.extdata = province.jsondata.indicators[3].indicatorDataExtension[0];
		// console.log(provinceInfo.code);
		if (provinceInfo.data != undefined) {
			if (provinceInfo.data[province.currentYear] != undefined) {
				provinceInfo.provData = provinceInfo.data[province.currentYear][0][provinceInfo.code];
			}
			// console.log(provinceInfo.provData);
			// console.log(provinceInfo.code);
			// console.log(provinceInfo.data);
		}
		if (provinceInfo.provData != undefined && provinceInfo.extdata != undefined) {
			provinceInfo.provExtData = provinceInfo.extdata[province.currentYear][0][provinceInfo.code];
		}
		// if(provinceInfo.provData != '' && provinceInfo.provExtData != ''){
		if (provinceInfo.provData != undefined && provinceInfo.provData != '') {
			provinceInfo.contentCore = buildPopupContent(provinceInfo.provData);
			// provinceInfo.contentExt  =  buildPopupContent(provinceInfo.provExtData);
			//console.log(provinceInfo.contentCore);
		} else {
			provinceInfo.content = "<div> No data available</div>";
		}
		// if(provinceInfo.contentCore != undefined && provinceInfo.contentExt != undefined){
		if (provinceInfo.contentCore != undefined) {
			provinceInfo.popup_content = buildTabsHtml(provinceInfo.contentCore, provinceInfo.contentExt);
		} else {
			provinceInfo.popup_content = provinceInfo.content;
		}

		$('.embPopupBody').html(provinceInfo.popup_content);
		$('.regionInfo').html(province.countryName.toUpperCase() + ' - ' + provinceInfo.name + ' Info');
	}

	function buildPopup(data, indicatorId) {
		var popup = {};

		// popup.content = '<div class="popContainer">'+'<div class = "popupHeader"><b>' + layer.feature.properties.NAME_1 + '</b></div>' ;
		popup.content = '';
		if (data != undefined) {
			if (data[0] != undefined) {
				if (data[0][province.currentYear] != undefined) {
					popup.coredata = data[0][province.currentYear][0][layer.feature.properties.ISO];
				}
			}

			if (popup.coredata != undefined) {
				popup.body = buildHoverPopupHtml(layer.feature.properties.NAME_1, buildPopupContent(popup.coredata));
				// popup.body = "<div class='coreData'><h1>Core Data</h1></div>" + buildPopupContent(popup.coredata);
			} else {
				popup.body = "Data for this region is unavailable.";
			}
			popup.content += popup.body;
		}
		popup.content += '</div>';
		return popup.content;
	}

	function buildPopupContent(popData) {

		var currentView = dureUtil.retrieveFromLocal("currentView");
		var inArray = [1, 24, 25, 16, 18]; //Indicators Id to show %
		//console.log(popData);
		var content = '<table class="table popupTable"><tbody>';

		if (popData != undefined) {
			var attribute = popData[1];
			var value = popData[0];
			for (var i = 0; i < attribute.length; i++) {
				if (value[i] != null) {
				
					content += "<tr data-summary='" + value[i] + "'><td><span>" + attribute[i] + "</span></td>";

					if ($.inArray(currentView.indicatorID, inArray) > -1) {

						if (i == 0) {
							content += "<td> : <span class='badge bg-badge'>" + value[i] + "%</span></td></tr>";
						} else {
							content += "<td> : <span class='badge bg-badge'>" + dureUtil.numberWithSpace(value[i]) + "</span></td></tr>";
						}
					} else {
						if(value[i] == -1) {
							content += "<td> : <span class='badge bg-badge'>NA</span></td></tr>";
						} else {
							content += "<td> : <span class='badge bg-badge'>" + dureUtil.numberWithSpace(value[i]) + "</span></td></tr>";
						}
					}
				}
			}
		}

		content += "</tbody></table>";

		return content;
	}

	function buildTabsHtml(core, ext) {
		if (ext == undefined) {
			ext = 'Data unavailable for region';
		}
		var html = '<div class="nav-tabs-custom">' +
			'<ul class="nav nav-tabs">' +
			'<li class="active"><a href="#tab_1-1" data-toggle="tab">Key data</a></li>' +
			'<li class=""><a href="#tab_2-2" data-toggle="tab">Supporting data</a></li>' +
			'</ul>' +
			'<div class="tab-content">' +
			'<div class="tab-pane active" id="tab_1-1">' + core +
			'</div><!-- /.tab-pane -->' +
			'<div class="tab-pane" id="tab_2-2">' + ext +
			'</div><!-- /.tab-pane -->' +

			'</div><!-- /.tab-content -->' +
			'</div>' + '<div><a href="javascript:void(0)" class="loadChart" data-target="#chart-modal" data-toggle="modal"><i class="fa fa-bar-chart fa-2x"></i></a><span class="iconsholder"></span><a href="javascript:void(0)"  data-toggle="tooltip" data-original-title="Chart Data" class="drillDown"><i class="fa fa-level-down fa-2x"></i></a><div>';
		return html;
	}

	function buildHoverPopupHtml(header, data) {

		var html = '<div class="box box-primary box-solid box-transparent">' +
			'<div class="box-header" data-toggle="tooltip" title="" data-original-title="Header tooltip">' +
			'<h5 class="box-title">' + header + '</h5>' +
			'</div>' +
			'<div class="box-body">'
			+data +
			'</div>' +
			'</div>';

		return html;
	}
	function highlightFeature(e) {
		layer.setStyle({
			weight: 1,
			color: 'white',
			dashArray: '',
			fillOpacity: 1
		});
		if (!L.Browser.ie && !L.Browser.opera) {
			// layer.bringToFront();
		}
		var layerStyle = getLayerStyle(layer);
		iHealthMap.legendControl.highLightScale(layerStyle.className, layerStyle.fillColor, 'bold', '12px');      // When hover on map highlight the legend scale 
	}

	function resetHighlight(e) {
		
		var layerStyle = getLayerStyle(e.target);
		iHealthMap.legendControl.highLightScale(layerStyle.className, '#555', 'normal' ,'12px');
		province.geojsonLayer.resetStyle(e.target);
	}
	function getLayerStyle(layer) {
		var layerStyleObj = {};
		if (layer.options != undefined) {
			layerStyleObj.className = layer.options.className;
			layerStyleObj.fillColor = layer.options.fillColor;
	    } else {
	        var getLeafletId = layer._leaflet_id;
	        var ftrlayer = layer._layers;
	        layerStyleObj.className = ftrlayer[getLeafletId - 1].options.className;
			layerStyleObj.fillColor = ftrlayer[getLeafletId - 1].options.fillColor;
	    }
		return layerStyleObj;
	}
}

//Clears all layers on map.
province.clearMapLayer = function () {
	console.log('Clearing Province layer');

	if (province.geojsonLayer != undefined) {
		province.map.removeLayer(province.geojsonLayer);
		province.geojsonLayer = null;
	}
};

/***************************************** Section: Year Range and Limits **************************************************/

// Set slider Range and Limits
province.setYearRangeAndLimits = function () {
	console.log("==== Line 343 : setting map ranges for province =====");
	console.log(province.rangeOfYears);
	
	if (iHealthMap.getIndicatorDataType() == "Standard") {
		province.rangeOfYears = dureUtil.formatObjects(province.jsondata.indicators[1].indicatorData[0]); //TODO
	} else {
		province.rangeOfYears = dureUtil.formatObjects(province.jsondata.indicators[1].indicatorDataExtension[0]); //TODO
	}
	
	//var currentView = dureUtil.retrieveFromLocal("currentView");
	// console.log("==== Line 345 : Current View Id - " + currentView);
	// console.log(currentView);
	/* if (currentView != undefined) {
		// console.log('Line 347 :WHAT IS INSIDE THERE ' + currentView.indicatorID);
		iHealthMap.minYearValue = province.minYearValue = dureUtil.getMinYearForIndicator(currentView.indicatorID) + 1;
		//console.log('Line 424 : Province min year value : ' + province.minYearValue);
		province.currentYear = iHealthMap.currentYear = iHealthMap.maxYearValue = province.maxYearValue = dureUtil.getMaxYearForIndicator(currentView.indicatorID);

		console.log('Line 473 : Province current year value : ' + province.currentYear);
	} */

	console.log(province.rangeOfYears);
	
	iHealthMap.buildYearSelectHtml(province.rangeOfYears);

	if (province.rangeOfYears.length != 0 && province.rangeOfYears != undefined) {
		
		iHealthMap.minYearValue = province.minYearValue = province.rangeOfYears[0];
		province.currentYear = iHealthMap.currentYear = iHealthMap.maxYearValue = province.maxYearValue = province.rangeOfYears[province.rangeOfYears.length - 1];
		
		// province.currentYearIndex = (province.rangeOfYears.length - 1);
		// province.currentYearIndex = 0;
		province.currentYearIndex = province.rangeOfYears.indexOf("" + province.currentYear);
		iHealthMap.minYearValue = province.minYearValue = province.rangeOfYears[0];
		iHealthMap.maxYearValue = province.maxYearValue = province.rangeOfYears[province.rangeOfYears.length - 1];
	}
	
	console.log('Line 594 : Province current year value : ' + province.currentYear);
	
	/* if (province.minYearValue == undefined || province.maxYearValue == undefined) {

		// console.log('Line 356: Inside if cond for RANGE OF YEARS ===========');

	} */
};

// Functionality for next button
province.slideNext = function () {
	$(document).on('click', '#sliderNextProv', function () {
		console.log("-----------Line 373: Province Next clicked ------");
		province.currentYearIndex++;
		console.log(province.currentYearIndex);
		if (province.currentYearIndex < province.rangeOfYears.length && province.currentYearIndex >= 0) {
			// console.log("-----------Line 373: Province Next clicked Inside if cond------");
			$(this).addClass('sliderNextRed');

			if (iHealthMap.setCurrentyear(province.rangeOfYears[province.currentYearIndex])) {
				$('#slideryear').text('Year ' + province.rangeOfYears[province.currentYearIndex]);
				province.onYearChange(province.currentYearIndex);
			}
		} else {
			province.currentYearIndex--;
		}
	});
};

// Functionality for previous button
province.slidePrev = function () {
	$(document).on('click', '#sliderPrevProv', function () {
		console.log("----------- Province Prev clicked ------");
		province.currentYearIndex--;
		// console.log("Current year index aftr == " + province.currentYearIndex);
		if (province.currentYearIndex < province.rangeOfYears.length && province.currentYearIndex >= 0) {
			$(this).addClass('sliderPrevRed');

			if (iHealthMap.setCurrentyear(province.rangeOfYears[province.currentYearIndex])) {
				$('#slideryear').text('Year ' + province.rangeOfYears[province.currentYearIndex]);
				province.onYearChange(province.currentYearIndex);
			}
		} else {
			province.currentYearIndex++;
		}
	});
};

//Change functionality
province.onYearChange = function (index) {
	dureOverlays.clearOverlays();
	subprovince.clearLayer();
	local.clearMarkers();
	dMap.setLevel('country');
	if (index != undefined) {
		province.currentYear = province.rangeOfYears[index];
	} else {
		province.currentYear = iHealthMap.currentYear;
	}
	province.changeRegionSummaryDataForYear(province.currentYear);
	province.loadLayer();
	if (dureOverlays.OverlayVisible) {
		dureOverlays.clearOverlays();

		dureOverlays.CurrentYearOverlayData = dureOverlays.getOverlayDataForPeriod(iHealthMap.getCurrentyear(), dureOverlays.CurrentOption.label);
		// console.log(dureOverlays.CurrentOption.label);
		console.log(dureOverlays.CurrentOption);
		console.log(dureOverlays.CurrentYearOverlayData);
		if (dureOverlays.currentOverlayStyle == 'Radial') {

			dureOverlays.showRadialChartForYear(dureOverlays.CurrentOption, dureOverlays.CurrentYearOverlayData);
			$(dureOverlays.overlayList).eq(dureOverlays.selectedIndexVal).prop('selected', true);
		} else if (dureOverlays.currentOverlayStyle == 'Bubble') {
			console.log("Inside bubble data...");
			dureOverlays.showBubbleChartForYear(dureOverlays.CurrentOption, dureOverlays.CurrentYearOverlayData);
			$(dureOverlays.overlayList).eq(dureOverlays.selectedIndexVal).prop('selected', true);
		} else if (dureOverlays.currentOverlayStyle == 'Chart') {

			dureOverlays.showBarChartForYear(dureOverlays.CurrentOption, dureOverlays.CurrentYearOverlayData);
			$(dureOverlays.overlayList).eq(dureOverlays.selectedIndexVal).prop('selected', true);
		}
	}

	$('#year-modal').modal('hide');
}

/***************************************** Section: Drill down to Subprovince *********************************************/

// Drills down into the country provinces/states.
province.drilldownToProvince = function (state) {
	console.log(state);
	dMap.setLevel('province');
	subprovince.initialize(state);
};

/******************************** Section: Clears/Resets Map and Layers For province *************************************/

// Removes the geoJson Layer present on Map.
province.clearLayer = function () {
	console.log('Clearing layer');
	//console.log(province.geojsonLayer);
	if (province.geojsonLayer != undefined) {
		if (province.geojsonLayer !== null) {
			province.map.removeLayer(province.geojsonLayer);
		}
	}
	province.geojsonLayer = null;
};

// Clears map data and map controls.
province.clearMap = function () {
	province.clearLayer();
	iHealthMap.removeLegendControl();
	iHealthMap.removeSliderControl();
	iHealthMap.removeEmbedPopupControl();
};

province.onResettingMap = function () {
 console.log("================== Reset Action From Province =====================");
 //iHealthMap.clearLayer();
 province.clearMapLayer();
 subprovince.clearMapLayer();

 dureOverlays.clearOverlays();
 dureOverlays.OverlayVisible = false;
 province.clearMap();
 province.removelabelBox();
 dMap.setLevel('world');
 //province.setYearRangeAndLimits();
 //province.loadLayer();
 //province.changeRegionSummaryDataForYear(province.currentYear);
 iHealthMap.renderLegend(iHealthMap.legendControlData);
 iHealthMap.renderMapControls(province.jsondata);
 province.map.setView(new L.LatLng(iHealthMap._lat, iHealthMap._long), 2);
 iHealthMap.map.panTo(new L.LatLng(iHealthMap._lat, iHealthMap._long));
 iHealthMap.loadLayer();
 iHealthMap.mapFullscreenZoom = iHealthMap._defaultZoom;
 dureUtil.currentFormattedJSONData = dureUtil.currentFormattedJSONDataTemp;
 if(dureOverlays.setData(dureUtil.currentFormattedJSONData)){
		dureOverlays.initialize();
  }
  if(dureUtil.indicatorId == 170 || dureUtil.indicatorId == 168) {
	   removeControlBarOverlay();
		renderBarOverlay();
	}else{
	 removeControlBarOverlay();
	 }
  loadPieChart(); //TODO
 //iHealthMap.deActivateSliderControls();
}

/* Label box */
province.createlabelBox = function(val) {
  
   //province.removelabelBox();
    province.highlightLabel = L.control({position: 'topright'});
        province.highlightLabel.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'country-label'); // create a div with a class "info"
        this._div.innerHTML = val;
        return this._div;
    };
	
     province.highlightLabel.addTo(iHealthMap.map);
}
province.removelabelBox = function() {
	if(province.highlightLabel != null) {
        iHealthMap.map.removeControl(province.highlightLabel);     
    }
}
  
/********************************************* Section: Map independent Info *******************************************/

// Sets province name for click/tap on the map.
province.setProvinceName = function (name) {
	console.log("Setting the province name" + province.name);
	province.name = name;
};

// Returns the province name for country selected from map.
province.getName = function () {
	return province.name;
};

// Sets province name for click/tap on the map.
province.setId = function (id) {
	province.id = id;
	return province.id;
};

// Returns the province name for country selected from map.
province.getId = function () {
	return province.id;
};

// Changes the chart info data on the popup chart.
province.changeChartInfo = function (code) {
	if (dureUtil.prepareChartObjects(province.jsondata, 'region', code)) {
		console.log("Chart changed for province");
	}
};

// Changes Region summary data on change of year.
province.changeRegionSummaryDataForYear = function (year) {
	var data;
	console.log("###====== Change Province Summary data ======###");
	//console.log(province.jsondata);
	if (year != undefined) {
		
		console.log(year);
		// data = province.jsondata.summaryData[0][year][0].data;
		data = dureUtil.currentFormattedJSONData.extractedObjects.summaryData[0][year][0].data;

		if (data != undefined) {
			console.log("Changing data for province");
			dureUtil.changeRegionSummaryData(data);
		}
	}
};

province.getCurrentYear = function () {
	return province.currentYear;
};