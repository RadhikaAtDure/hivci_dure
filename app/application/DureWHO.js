var dureKenya = {};


// Region Set view

var regionViewObj = {

    "AFR":{lat:"1.5818302639606454", lng:"15.380859374999998", zoom:"3",name:"African Region"},
    "AMR":{lat:"10.833305983642491", lng:"12.480468749999998", zoom:"2",name:"Americas Region"},
    "EMR":{lat:"20.46818922264095", lng:"42.626953125", zoom:"3",name:"Eastern Mediterranean Region"},
    "EUR":{lat:"42.68243539838623", lng:"68.291015625", zoom:"3",name:"European Region"},
    //"SEAR":{lat:"13.410994034321702", lng:"105.732421875", zoom:"3",name:"South Eastern Asian Region"}, 
    "SEAR":{lat:"13.410994034321702", lng:"105.8642578125", zoom:"4",name:"South Eastern Asian Region"}, 
    "WPR":{lat:"12.382928338487408", lng:"93.251953125", zoom:"3",name:"Western Pacific Region"}
    
};

$(document).ready(function(){

	$('#ihmap').css('min-height','450px');
	$('.regionSummary_1').removeClass( "bg-aqua bg-green bg-yellow" ).addClass('bg-red');
	$('.regionSummary_2').removeClass( "bg-aqua bg-green bg-yellow" ).addClass('bg-black');
	$('.regionSummary_3').removeClass( "bg-aqua bg-green bg-yellow" ).addClass('bg-green');
	// $('.regionSummary_2').hide();
	// $('.regionSummary_3').hide();
	//iHealthMap.reloadBaseLayer();
});
// Full Screen Change the map zoom level

/*$(document).bind("fullscreenchange", function() {
 setTimeout(function(){
 $(document).fullScreen() ? iHealthMap.map.setView(new L.LatLng(iHealthMap._lat, iHealthMap._long), 2) : iHealthMap.map.setView(new L.LatLng(iHealthMap._lat, iHealthMap._long), 2);
  }, 550);        //  map tiles render properly

});
*/

// Custom change for WHO-HM (use local data for charts)

var nationalObj = {};
var trackerObj = {};
	trackerObj.crntSelIndVal = '';
	trackerObj.crntSelIndData = '';
	trackerObj.crntSelChartData = '';
nationalObj.cascadeData = null;
nationalObj.incomeClassfData = null;
nationalObj.chartInfo = new ChartMetaData();


nationalObj.getCascadeData = function() {                           
   $.getJSON('tempdata/data/cascade.json', function(data) {
        if (data != undefined) {
            nationalObj.cascadeData = (data);             // cascade data
        }
    });
}
nationalObj.getIncomeClassfData = function() {
	$.getJSON('tempdata/data/income_classification.json', function(data) {
		nationalObj.incomeClassfData = data;
	});	
}

nationalObj.getWHORegionData = function() {
	$.getJSON('tempdata/data/region.json', function(data) {
		nationalObj.whoRegionData = data;
	});

}

//nationalObj.getCascadeData();             // get the cascade data
nationalObj.getIncomeClassfData();
nationalObj.getWHORegionData();

function ChartMetaData() {
    var chartMetaData = {};
    this.setData = function(index, pathURL, chartContainer, title, seriesName, toolTipValue, yTitleText) {
		chartMetaData.active = index;
        chartMetaData.pathURL = pathURL;
        chartMetaData.chartContainer = chartContainer;
        chartMetaData.title = title;
        chartMetaData.seriesName = seriesName;
        chartMetaData.toolTipValue = toolTipValue;
        chartMetaData.yTitleText = yTitleText;
    }
    this.getData = function() {
        return chartMetaData;
    }
}

nationalObj.triggerChart = function(that) {
	
	var countryName = that.target.feature.properties.name;
    var countryID2 = that.target.feature.properties.iso_a2;
	var countryID3 = that.target.feature.properties.iso_a2;

	var pathURL = 'tempdata/updated-data/chart-data/HIV_Prevalence.json';
    var chartContainer = 'chartcontainerhivpre';
	nationalObj.chartInfo.setData(1, pathURL, chartContainer, 'HIV Prevalence', 'HIV Prevalence', 'HIV Prevalence');

	var metaInfo = nationalObj.chartInfo.getData();
	var pathURL = metaInfo.pathURL; //+ '/' + countryID3 + '.json';
	//NProgress.start();
	$.getJSON(pathURL, function(data) {
	  if (data != undefined) {	 
	  	var parsedData = getChartFormatedData(data, countryID3);
	    trackerObj.crntSelChartData = parsedData;

		$( "#dropdown1-tab, #dropdown2-tab, #dropdown3-tab, #dropdown4-tab ").unbind( "click" );
		$('#dropdown' + metaInfo.active + '-tab').trigger('click').promise().done(function () {
			var chartMetaData = new ChartMetaData();
			$('#dropdown1-tab').on('click', function(){
				var URL = 'tempdata/updated-data/chart-data/HIV_Prevalence.json';
				var chartContainer = 'chartcontainerhivpre';
				chartMetaData.setData(1, URL, chartContainer, 'HIV Prevalence', 'HIV Prevalence', 'HIV Prevalence');
				var chartInfo = chartMetaData.getData();
				var pathURL = chartInfo.pathURL;// + '/' + countryID3 + '.json';
				$.getJSON(pathURL, function(data) {
					if(data != undefined) {
						var parsedData = getChartFormatedData(data, countryID3);
					    trackerObj.crntSelChartData = parsedData;
					    nationalObj.showChart(chartInfo);
					}
				}).error();
			});
			$('#dropdown2-tab').on('click', function(){
				var URL = 'tempdata/updated-data/chart-data/PLHIV.json';
				var chartContainer = 'chartcontainerplhiv';
				chartMetaData.setData(2, URL, chartContainer, 'PLHIV', 'PLHIV', 'PLHIV');
				var chartInfo = chartMetaData.getData();
				var pathURL = chartInfo.pathURL;// + '/' + countryID3 + '.json';
				$.getJSON(pathURL, function(data) {
					if(data != undefined) {
						var parsedData = getChartFormatedData(data, countryID3);
					    trackerObj.crntSelChartData = parsedData;
					    nationalObj.showChart(chartInfo);
					}
				}).error();
			});
			$('#dropdown3-tab').on('click', function(){
				var URL = 'tempdata/updated-data/chart-data/People_on_ART.json';
				var chartContainer = 'chartcontainerart';
				chartMetaData.setData(3, URL, chartContainer, 'People on ART', 'People on ART', 'People on ART');
				var chartInfo = chartMetaData.getData();
				var pathURL = chartInfo.pathURL;// + '/' + countryID3 + '.json';
				$.getJSON(pathURL, function(data) {
					if(data != undefined) {
						var parsedData = getChartFormatedData(data, countryID3);
					    trackerObj.crntSelChartData = parsedData;
					    nationalObj.showChart(chartInfo);
					}
				}).error();
			});
			$('#dropdown4-tab').on('click', function(){
				var URL = 'tempdata/updated-data/chart-data/HIV_Related_Deaths.json';
				var chartContainer = 'chartcontainerdeath';
				chartMetaData.setData(4, URL, chartContainer, 'HIV Related Deaths', 'No. of Deaths', 'No. of Deaths');
				var chartInfo = chartMetaData.getData();
				var pathURL = chartInfo.pathURL;// + '/' + countryID3 + '.json';
				$.getJSON(pathURL, function(data) {
					if(data != undefined) {
						console.log("load data");
						var parsedData = getChartFormatedData(data, countryID3);
					    trackerObj.crntSelChartData = parsedData;
					    nationalObj.showChart(chartInfo);

					}
				}).error();
			});		
		});
		$('#headername').html('<span class="f32"><span class="flag ' + countryID2.toLowerCase() +'"></span></span>&nbsp&nbsp' + countryName);
		nationalObj.showChart(metaInfo);
		console.log("show chart");
		$("#myModal").modal({show: true});
		//$('#myTab a:first').tab('show') // Select first tab
	//	$('#dropdown1-tab').trigger('click');
		$('.modalcascade').empty();
		nationalObj.displayCascade(countryID3);
	  }
	}).error();
}

nationalObj.showChart = function(metaInfo) {
	var setCategoriesValue = trackerObj.crntSelChartData.data.categoriesValue;
    var setDataValue = trackerObj.crntSelChartData.data.dataValue;
    var chartObj = new Highcharts.Chart({
        chart: {
            renderTo: metaInfo.chartContainer,
            type: 'column',
            events: {
                load: function(event) {
                    $('.highcharts-legend-item rect').attr('height', '0').attr('y', '0');
					/* setTimeout(function () {      
						$(document).resize(); 
						//$(metaInfo.chartContainer).highcharts().reflow();
						//$(window).resize();
                     }, 100);*/
                }
            }
        },
        title: {
            text: metaInfo.title
        },
        legend: {
            labelFormatter: function() {
                return '';
            },
            title: {
                text:'' //'<b>Source: JRF and WHO estimates</b>'
            }
        },
        credits: {
      		enabled: false
  		},
        tooltip: {
            formatter: function() {
                return 'Year: <b>' + this.x + '<br></b>' + metaInfo.toolTipValue + ': <b>' + numberWithCommas(numberWithRound(this.y, 2)) + '</b>';
            }
        },
        navigation: {
            menuItemStyle: {
                fontWeight: 'normal',
                background: 'none'
            },
            menuItemHoverStyle: {
                background: 'none',
                color: '#D86422'
            }
        },
        xAxis: {
            categories: setCategoriesValue
        },
        yAxis: {
            title: {
                text: metaInfo.toolTipValue
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        exporting: {
            buttons: {
                contextButton: {
                    text: 'Export'
                }
            }
        },
        series: [{
            data: setDataValue
        }]
    });
   // chart.redraw(); 
    /*console.log(metaInfo.chartContainer);
    console.log(chartObj);*/
    setTimeout(function(){ $('#chartcontainerhivpre').highcharts().setSize($('#chartcontainerhivpre').width(),$('#chartcontainerhivpre').height()); }, 300);
	  //$('#chartcontainerhivpre').highcharts().setSize($('#chartcontainerhivpre').width(),$('#chartcontainerhivpre').height());
}

//  Start Compile Templates
//console.log(Handlebars.compile);


// Heplers 
/* Handlebars.registerHelper('parseVal', function(value) {
	if(!value)
		return 'N/A'
	 return numberWithCommas(numberWithRound(value,0));
}); */

// Display cascade 
nationalObj.displayCascade = function(id) {
	if(nationalObj.cascadeData.data[id]) {	
		var currentContextCascade = nationalObj.cascadeData.data[id];
		var cascadeTemplateHtml = cascadeTemplate(currentContextCascade);
		$('.modalcascade').append(cascadeTemplateHtml);
	}
}



// Income classification filter
function bindIncomeFIlter() {
$('#applyincomefilter').on('click', function() {
	var incomeFilter = {}
    incomeFilter.selIncomeValList = [];
	incomeFilter.selIncomeNameList = [];
	incomeFilter.countryFound = [];
	var getAllIncomeVal = document.getElementsByClassName('income-classification');
	for (var i = 0; i < (getAllIncomeVal.length); i++) {
		if (getAllIncomeVal[i].checked) {
			incomeFilter.selIncomeValList.push(getAllIncomeVal[i].getAttribute('data-incomeclassname'));
			incomeFilter.selIncomeNameList.push(getAllIncomeVal[i].value);
		}	
	}
	if(incomeFilter.selIncomeValList.length > 0) {
		$.each(nationalObj.incomeClassfData.data, function(key, val){
			for(var a = 0; a < incomeFilter.selIncomeValList.length; a++) {
				if(val.incomeClassifaction.match(incomeFilter.selIncomeValList[a])) {
					incomeFilter.countryFound.push(key);
				}
			}
		});
		if(incomeFilter.countryFound.length > 0) {
			iHealthMap.clearLayer();
			var layerFilter = filterLayerContainer('iso_a3', true, incomeFilter.countryFound);
			iHealthMap.addStyle(layerFilter);
			var notificationMessage = incomeFilter.countryFound.length + ' Countries Found <br/>' + incomeFilter.selIncomeNameList.toString();
			//notifications(notificationMessage);
		} else {
			alert('None country found for this selection');
		}
	} else {
		alert('Please select some classification');
	}
	
	$('#resetincomefilter').on('click', function() {
	var getAllIncomeVal = document.getElementsByClassName('income-classification');
	for (var r = 0; r < (getAllIncomeVal.length); r++) {
		 getAllIncomeVal[r].checked = false;
	}
});
});

}

// WHO Region filter
function bindRegionFIlter() {
	$('#applyregionfilter').on('click', function(e) {
		
		var regionFilter = {}
	    regionFilter.selRegValList = [];
		regionFilter.selRegNameList = [];
		regionFilter.countryFound = [];
		var getAllRegionVal = document.getElementsByClassName('whoregion');
		for (var i = 0; i < (getAllRegionVal.length); i++) {
			if (getAllRegionVal[i].checked) {
				regionFilter.selRegValList.push(getAllRegionVal[i].value);
				regionFilter.selRegNameList.push(getAllRegionVal[i].getAttribute('data-regionname'));
			}	
		} 
		if(regionFilter.selRegValList.length > 0) {
			$.each(nationalObj.whoRegionData.data, function(key, val){ 
				for(var a = 0; a < regionFilter.selRegValList.length; a++) {
					if(val.whoRegion.match(regionFilter.selRegValList[a])) {
						regionFilter.countryFound.push(val.isoCode);
					}
				}
			});
			if(regionFilter.countryFound.length > 0) {
				iHealthMap.clearLayer();
				var layerFilter = filterLayerContainer('iso_a3', true, regionFilter.countryFound);
				iHealthMap.addStyle(layerFilter);
				// To set proper view for single selected region list.
                if(regionFilter.selRegValList.length == 1)  {
                    // regionViewObj --- > Defined at the top .
                    var regionProp = regionViewObj[regionFilter.selRegValList[0]];
                    iHealthMap.map.setView( new L.latLng(regionProp.lat, regionProp.lng), regionProp.zoom);
                }else{

                    iHealthMap.map.setView( new L.latLng(iHealthMap._lat, iHealthMap._long), 2);
                }
		//		var notificationMessage = regionFilter.countryFound.length + ' Countries Found <br/>' + regionFilter.selRegNameList.toString();
		//		notifications(notificationMessage);
			} else {
				alert('None country found for this selection');
			}
		} else {
			alert('Please select some classification');
		}
		
	});

	$('#resetregionfilter').on('click', function() {
	var getAllRegionVal = document.getElementsByClassName('whoregion');
	for (var r = 0; r < (getAllRegionVal.length); r++) {
		if (getAllRegionVal[r].checked) {
			getAllRegionVal[r].checked = false
		}	
	}
});
}

// Utility functions 

// Number with Commas
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

// Exact round off 
function numberWithRound(number, places) {
    var multiplier = Math.pow(10, places+2); // get two extra digits
    var fixed = Math.floor(number*multiplier); // convert to integer
    fixed += 44; // round down on anything less than x.xxx56
    fixed = Math.floor(fixed/100); // chop off last 2 digits
    return fixed/Math.pow(10, places);
}

// Print 
function Print(divId, printTitle) {
    var docprint = window.open("about:blank", "_blank"); 
    var oTable = document.getElementById(divId);
    docprint.document.open(); 
    docprint.document.write('<html><head><title>'+ printTitle +'</title>'); 
    docprint.document.write('</head><body><center>');
	//console.log(oTable.parentNode.innerHTML);
    docprint.document.write(oTable.parentNode.innerHTML);
    docprint.document.write('</center></body></html>'); 
    docprint.document.close(); 
    docprint.print();
    docprint.close();

}

function notifications(notificationMessage, callBackList)
{

	var colorHex = callBackList.colorCode.code;
		colorHex = colorHex.replace('range-', '#');
	var notificationTheme = 'notificationTheme';
	 noty({
		text:  notificationMessage + '&nbsp;&nbsp;<span class="" style="color:'+ colorHex +'"><i class="fa fa-square"></i></span>',
		theme: notificationTheme, //  'relax' or 'defaultTheme'
		template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
		closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
		buttons: [
		{addClass: 'btn btn-primary notyButtonstyle glyphicon glyphicon-remove', text: '', onClick: function($noty) {
				$noty.close();
			}
		},
		{addClass: 'btn btn-primary notyButtonstyle glyphicon glyphicon-tasks', text: '', onClick: function($noty) {
				// this = button element
				// $noty = $noty element
				//$noty.close();
				if(callBackList.colorCode.apply) {
					var listing = getFilteredDisplayList(callBackList);
					$('#filteredlisting-display').empty();
					$('#filteredlisting-display').append(listing);
					$("#mapFilterNotificationModal").modal({show: true});
					//noty({text: 'You clicked "Ok" button', type: 'success'});
				}
			}
		}],
		killer : true
	});
}

function getFilteredDisplayList(callBackList) {
	var displayList = '';
	var metaInfoDisplay = '';
	var colorHex = callBackList.colorCode.code;
		colorHex = colorHex.replace('range-', '#');
	var geographicLevel = iHealthChart.getLevel();
	metaInfoDisplay += '<p>' + $('.legend-info').find('h5').html() + ' ( ' + '<span class="" style="color:'+ colorHex +'"><i class="fa fa-square"></i></span>' + '  ' + callBackList.colorCode.scale +  ' )</p>';
	metaInfoDisplay += '<p>' + callBackList.layerList.container.length + ' ' + geographicLevel + ' found </p>' ;
	//metaInfoDisplay += '<p><span class="" style="color:'+ colorHex +'"><i class="fa fa-square"></i></span>' + '  ' + callBackList.colorCode.scale + '</p>';
	$('.diaplayMetaInfo').html(metaInfoDisplay);
	displayList += '<thead><tr><th> Country Name </th> <th>' + $('.legend-info').find('h5').html() + '</th></tr> </thead>';      
	callBackList.layerList.container.sort();
	for(var i = 0; i < callBackList.layerList.container.length; i ++) {
		displayList += '<tr>';
		displayList += '<td>';
		displayList += callBackList.layerList.container[i][0];
		displayList += '</td>';
		displayList += '<td>';
		displayList += callBackList.layerList.container[i][1];
		displayList += '</td>';
		displayList += '</tr>';
	}
	
	return displayList;
}


// Paring the Chartdata 

function getChartFormatedData(data, iso) {
	var returnData = {
			"data": {
				"categoriesValue": [],
				"dataValue": []
			}
		};
	if(data && iso) {
	
		$.each(data.indicators[0].worldIndicatorData[0], function(k,v) {
				returnData.data.categoriesValue.push(Number(k));
				if(v[0][iso] && v[0][iso][0][0] > 0) {
					returnData.data.dataValue.push(v[0][iso][0][0]);
				} else{
					returnData.data.dataValue.push(null);
				}
		});
	}

	return returnData;
}

// (Overlay name: Cascade):displaying the cascade bar overlay chart with 3 indicators data only for 5 countries at HIV prevalence indicator

var controlLayerObjBarOverLay = null;
var barOverLayContainer = [];
var baroverLayNames = 'Cascade';
var overlaychartBarData;

(function getbarOverlayData() {
	$.getJSON('tempdata/updated-data/cascade_overlayData.json', function(result) { 

		overlaychartBarData = result;

	});
})();


function renderBarOverlay() {

var overlayData = overlaychartBarData[iHealthMap.currentYear];
//console.log(overlayData);
var barCategories = ["PLHIV", "people_on_ART", "HIV_related_deaths"];

var fillColorFunctionBars = new L.HSLLuminosityFunction(new L.Point(0,2), new L.Point(barCategories.length - 1,5), {outputHue: 0, outputSaturation: '100%'});
var styleFunction = new L.StylesBuilder(barCategories,{
		displayName: function (index) {
			return barCategories[index] == 'people_on_ART'   ? 'People on ART' :
	          	   barCategories[index] == 'HIV_related_deaths'   ? 'HIV related deaths' :
	           	   barCategories[index] == 'PLHIV'   ? 'PLHIV' :
	           	   							'#FFEDA0';
			return barCategories[index];
		},
		color: '#525252',
		fillColor: function(a){
			var d = barCategories[a];
			return d == 'people_on_ART'   ? '#FCE12C' :
	          	   d == 'HIV_related_deaths'   ? '#000000' :
	           	   d == 'PLHIV'  ? '#BC310C' :
	           	   				'#FFEDA0';
		},

		minHeight:5,
		minValue: 15,
		maxValue: 1500000,//300000000
		maxHeight:20
});

optionsFacilities  = {
		recordsField: null,
		locationMode:L.LocationModes.LATLNG,
		latitudeField:'lat',
		longitudeField:'lng',
		codeField: 'country_name',
		chartOptions: styleFunction.getStyles(),
		layerOptions: {
			fillOpacity: 2,
			opacity: 1,
			//weight: 1,
			//width: 7,
			dropShadow: true,
			gradient: false
		},
	
		tooltipOptions: {
			iconSize: new L.Point(141,75),
			iconAnchor: new L.Point(-5,65)
		},

		onEachRecord: function (layer, record) {
			var record_copy = $.extend(true, [], record);
			var $html = $(L.HTMLUtils.buildTable(record_copy));
			layer.bindPopup($html.wrap('<div/>').parent().html(), {
				maxWidth: 400,
				minWidth: 400
			});
			/*layer.on({

                    mouseover: function(event) {
                    	
                    	console.log(event);
                    }
            })*/
		}
}

var facilitiesObj = new L.BarChartDataLayer(overlayData, optionsFacilities);
barOverLayContainer.push(facilitiesObj);
var overlays = { 'Cascade': facilitiesObj};
controlLayerObjBarOverLay = L.control.layers('',overlays,{position: "topleft"}).addTo(iHealthMap.map);

}

function removeControlBarOverlay() {

	if(controlLayerObjBarOverLay) {
		iHealthMap.map.removeControl(controlLayerObjBarOverLay);
		controlLayerObjBarOverLay = null;
	}
	
	for(var i = 0; i < barOverLayContainer.length; i++) {
			barOverLayContainer[i].clearLayers();
	}
	barOverLayContainer = [];
}