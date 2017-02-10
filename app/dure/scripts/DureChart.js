var iHealthChart = {};

iHealthChart.init = function(type) {
	//iHealthChart.chart ={};
	//iHealthChart.chartType = "column"; // Commented by shone for JH project.
    iHealthChart.chartType = type;
    iHealthChart.chartTitle = "";
    iHealthChart.chartData = "bar";
    iHealthChart.chartStyle = "";
	iHealthChart.country = "";
	iHealthChart.json = null;
	iHealthChart.provinceJson = null;

	if(iHealthChart.setChartData()){
		// Loads chart below the map container thus displaying summary.
		iHealthChart.loadChart(type);
	}
};

iHealthChart.loadChart = function(type){
	if(type == 'pie'){
		iHealthChart.loadPieChart();
	}else{
		iHealthChart.loadCombinationChart();
	}
};


/*********************************************  SECTION: SET CHART DATA ***************************************************/
// Sets the chart data.
iHealthChart.setChartData = function(){
	console.log("~~~ Setting charts data ~~~");
	iHealthChart.json = iHealthChart.getDataFromProvider();
	//console.log(iHealthChart.json);
	return true;
};

// Gets the chart data from provider.
iHealthChart.getDataFromProvider = function(){
	var key = 'regionSummaryData_'+dureUtil.appId+'_'+dureUtil.targetId+'_'+dureUtil.regionId;
	//console.log(dureUtil.retrieveFromLocal(key));
	return dureUtil.retrieveFromLocal(key);
};

/*********************************************  SECTION: PIE CHART **********************************************************/
// Loads the Pie chart.
iHealthChart.loadPieChart = function() {
	//console.log("Inside pie chart");
    $('.highchartContainer').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1, //null,
            plotShadow: false
        },
        title: {
            text: iHealthChart.getPieChartTitle()
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
		exporting: {
			enabled: false
		},
		credits: {
			enabled: false
		},
		series: [{
			type: iHealthChart.chartType,
			name: "Percentage of countries",
			data: iHealthChart.getPieChartDataset()
		}]
    });
};

iHealthChart.getPieChartTitle = function(){
	var titleData = {};
	titleData = iHealthChart.getDataFromProvider();
	return titleData.title;
};

iHealthChart.getPieChartDataset = function(){
	var i=0, pieChart = {};
	pieChart = iHealthChart.getDataFromProvider();
	pieChart.name = [];
	pieChart.result = [];

	for(var k in pieChart.dataset){
		pieChart.result.push(iHealthChart.formatPieChartDatasetObj(k,pieChart.dataset[k]));
	}
	return pieChart.result;
};

iHealthChart.formatPieChartDatasetObj = function(key,value){
	var prepareObj = {};
	prepareObj.name = key;
	prepareObj.y = value;
	return prepareObj;
};
iHealthChart.getLevel = function() {
 return dureUtil.getDataLevel() == "country" ? 'Province': dureUtil.getDataLevel() == "province"  ? 'District' : dureUtil.getDataLevel() == "world" ? 'countries': '';
}


/*********************************************  SECTION: COMBINATION CHART **************************************************/
// Get data for combination chart .
iHealthChart.loadCombinationChart = function() {

		/* var currentView = dureUtil.retrieveFromLocal("currentView");
		var inArray = [1, 24, 25, 16, 18]; //Indicators Id to show %
		var titleText;

		if($.inArray(currentView.indicatorID, inArray) > -1){
			titleText = "Percentage";
		}
		else{
			titleText = "Number";
		} */

	iHealthChart.chart = new Highcharts.Chart({

		chart: {
			renderTo: 'chartContainer'
	    },
	    credits:{
			enabled:false
		},
        title: {
			text: $('.targetTitleOnChart').text()
        },
        yAxis: [{ // Primary yAxis
			labels: {
				style: {
					color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: $('.targetTitleOnChart').text(),
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }
        }
/* 		,{ // Secondary yAxis
            title: {
                text: 'Percentage',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} %',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        } */ ],
        xAxis: {
			categories: iHealthChart.getRangeOfYears()
        },
        series: [{
			type: 'column',
            name: iHealthChart.getSummaryData(0,'name'),
            data: iHealthChart.getSummaryData(0,'data'),
            color: "#3C8DBC",
			pointWidth: 40
        }
		/*, {
            type: 'column',
            name: iHealthChart.getSummaryData(1,'name'),
            data: iHealthChart.getSummaryData(1,'data'),
            color: Highcharts.getOptions().colors[1]
        }
		/*, {
            type: 'spline',
            yAxis: 1,
            name: 'ART Coverage',
            data: [3, 2.67, 3, 6.33, 3.33],
            marker: {
                lineWidth: 2,
                lineColor: Highcharts.getOptions().colors[1],
                fillColor: 'white'
            }

        }
		*/
		]
    });

	iHealthChart.chart.redraw();
};

// Get data for combination chart .
iHealthChart.loadCombinationChartForProvince = function() {

	console.log("Loading combination chart... ");

	/* var currentView = dureUtil.retrieveFromLocal("currentView");
	var inArray = [1, 24, 25, 16, 18]; //Indicators Id to show %
	var titleText;

	if($.inArray(currentView.indicatorID, inArray) > -1){
		titleText = "Percentage";
	}
	else{
		titleText = "Number";
	} */

	//$('#chart-on-modal-title').html($('.targetTitleOnChart').text()); // 18/03/2015

	//console.log(iHealthChart.provinceJson);
    iHealthChart.chart = new Highcharts.Chart({
	    chart: {
	        renderTo: 'provinceChart'
	    },
	    credits:{
			enabled:false
		},
        title: {
            text: $('.targetTitleOnChart').text()
        },
        yAxis: [{
			// Primary yAxis
            labels: {
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                text: $('.targetTitleOnChart').text(),
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }
        }],
        xAxis: {
            categories: iHealthChart.provinceJson.rangeOfYears
        },
        series: [{
            type: 'column',
            name: iHealthChart.getProvinceData(0,'name'),
            data: iHealthChart.getProvinceData(0,'data'),
            color: "#3C8DBC",
			pointWidth: 40
        }]
    });

	iHealthChart.chart.redraw();
};

iHealthChart.comparisonChart = function(){

    iHealthChart.chart = new Highcharts.Chart({

	    chart: {
	        renderTo: 'provinceCompChart'
	    },
	    credits:{
			enabled:false
		},
        title: {
            text: $('.targetTitleOnChart').text()
        },
		exporting:{
			enabled: true,
			sourceWidth: 960,
			sourceHeight: 400,
			chartOptions: {
				xAxis: [{
					categories: iHealthChart.provinceJson.comparisonData.listOfRegions,
					min: 0,                           // Added for fix
					minRange: iHealthChart.provinceJson.comparisonData.listOfRegions.length-1,    // Added for fix
					max: iHealthChart.provinceJson.comparisonData.listOfRegions.length-1
				}],
				scrollbar:{
					enabled: false
				}
			}
		},
        yAxis: [{
			// Primary yAxis
            labels: {
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            title: {
                name: iHealthChart.getLevel(),//"Province",//"Country/Province",
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }
        }],
		scrollbar: {
            enabled: true
        },
        xAxis: {
            categories: iHealthChart.provinceJson.comparisonData.listOfRegions,
			labels: {
                rotation: -45,
                style: {
                    fontSize: '9px',
                    fontFamily: 'Verdana, sans-serif',
                    fontWeight:'bold'
                }
            },
           max: iHealthChart.provinceJson.comparisonData.comparisonDataForRegion.length  < 34 ? iHealthChart.provinceJson.comparisonData.comparisonDataForRegion.length - 1 : 34
        },
        series: [{
            type: 'column',
			//name: $('.targetTitleOnChart').text(),//"Province",//"Country/Province",
			name: iHealthChart.provinceJson.data[0].generic.name,
            data: iHealthChart.provinceJson.comparisonData.comparisonDataForRegion,
            color: Highcharts.getOptions().colors[0],
			pointWidth: 30
		}]
    });
};

// Loads line chart
iHealthChart.loadLineChart = function() {
    $('.highchartContainer').highcharts({
        title: {
            text: 'Monthly Average Temperature',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: WorldClimate.com',
            x: -20
        },
        xAxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            },
            plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: [{
                name: 'Tokyo',
                data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
            }, {
                name: 'New York',
                data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
            }, {
                name: 'Berlin',
                data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
            }, {
                name: 'London',
                data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
            }]
    });
};

// Just testing for now change it // TODO
function loadPieChart() {
    var data =  prepareDataPie();
      $('.highchartContainer').highcharts({
        chart: {
            type: 'pie',
            events: {
                drilldown: function (e) {
                    var subTitle = e.seriesOptions.id;
                    var count = e.seriesOptions.data.length;
                    var chart = $('.highchartContainer').highcharts();
                    chart.setTitle(null, { text: subTitle + ' - ' + count + ' countries.'});
					chart.yAxis[0].setTitle({ text: subTitle });
                },
                drillup: function(e) {
                    var chart = $('.highchartContainer').highcharts();
                    chart.setTitle(null, { text: ''});
					$('.highcharts-yaxis-title').hide();
                } ,
                load: function(event) {
                     setTimeout(function () {
                        $(document).resize();
                        //$(metaInfo.chartContainer).highcharts().reflow();
                        //$(window).resize();
                     }, 100);
                }
            }
        },
        title: {
            text: data.title
        },

        tooltip: {
            backgroundColor: '#FCFFC5',
            formatter: function () {

                var tooltipHtml = '';
                if(this.series.options.type == 'pie') {
                   tooltipHtml = '<b>' + this.y + ' </b>countries';
                }
                if(this.series.options.type == 'column'){
                    tooltipHtml = '' + this.key +
                   // '<br>' + data.title + ': <b>'+ Highcharts.numberFormat(this.y, 0); + '</b>';
				   '<br>' + data.title + ': <b>'+dureUtil.numberWithSpace(numberWithRound(this.y, 2)); +'</b>';
                }
                return tooltipHtml;
            }
        },
        xAxis: {
            type: 'category',
             labels: {
                rotation: -45,
                style: {
                    fontSize: '7px',
                    fontFamily: 'Verdana, sans-serif',
                    whiteSpace: 'normal',
                    "fontWeight":"bold"
                }
            }
        },

        legend: {
            enabled: false
        },

        plotOptions: {

            pie: {
                dataLabels: {
                    enabled: true
                 }
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Chart',
            colorByPoint: true,
            data: data.series,
            type:'pie'
        }],
        drilldown: {
            series: data.drilldown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: -30
               }
            }
        }
    });

}

function metaInfoPieChart(colorCode) {
    var returnInfo = {};
    returnInfo.name = 'No data available';
    var color = '#' + colorCode.substring(colorCode.lastIndexOf('-') + 1, colorCode.length);

	if(iHealthMap.getIndicatorDataType() == "Standard"){

		var metaInfo = dureUtil.indicatorMetaInfo.indicatorInfo.levels[0].scales[0].linear[0];
		var colorScale = metaInfo.colorScale;

		for(var i = 0; i < colorScale.length; i++){
			if(color == colorScale[i]) {
				returnInfo.name = metaInfo.scaleDesc[i];
				break;
			}
		}
	} else {

		for (var i = 0; i < iHealthMap.FilterDataArr.length; i++) {

			if (color == iHealthMap.FilterDataArr[i][1]) {
				returnInfo.name = iHealthMap.FilterDataArr[i][0];
				break;
			}
		}
	}

    return returnInfo;
}

function prepareDataPie() {
    var returnChartData = {};
     returnChartData.series = [];
     returnChartData.drilldown = []
     returnChartData.title = dureUtil.indicatorMetaInfo.indicatorInfo.levels[0].scales[0].linear[0].indicatorName;
    $.each(dureUtil.scaleRangeCat.regionList, function(index, val) {
        var innerData = {};
        var drillData = {};
        var meta = metaInfoPieChart(index);
        innerData.name = meta.name;
        innerData.y = val.length;
        innerData.color = '#' + index.substring(index.lastIndexOf('-') + 1, index.length);
        innerData.drilldown = meta.name;
        drillData.id = meta.name;
        drillData.type = 'column';
        drillData.data = [];
        for(var i =0; i < val.length; i++){
             var innerDrillData = [];
			  if(val[i][1] == ""){
				 val[i][1] =null;
				}
             innerDrillData.push(val[i][0]);
             innerDrillData.push(val[i][1]);
             drillData.data.push(innerDrillData);

        }
        drillData.dataLabels = {enabled:false};
        returnChartData.series.push(innerData);
		if(iHealthMap.getIndicatorDataType() == "Standard"){
			returnChartData.drilldown.push(drillData);
		}
    });
    //console.log(returnChartData);
    return returnChartData;
}

// Country Level Chart (category based chart)  // TODO
function loadPieChartCountryLevel() {
    var data =  prepareDataPieCountryLevel();
    var levelName = iHealthChart.getLevel();
      $('.highchartContainer').highcharts({
        chart: {
            type: 'pie',
            events: {
                drilldown: function (e) {
                    var subTitle = e.seriesOptions.id;
                    var count = e.seriesOptions.data.length;
                    var chart = $('.highchartContainer').highcharts();
                    chart.setTitle(null, { text: subTitle + ' - ' + count + ' ' + levelName});
					chart.yAxis[0].setTitle({ text: subTitle });
                },
                drillup: function(e) {
                    var chart = $('.highchartContainer').highcharts();
                    chart.setTitle(null, { text: ''});
					$('.highcharts-yaxis-title').hide();
                } ,
                load: function(event) {
                     setTimeout(function () {
                        $(document).resize();
                        //$(metaInfo.chartContainer).highcharts().reflow();
                        //$(window).resize();
                     }, 100);
                }
            }
        },
        title: {
            text: data.title
        },

        tooltip: {
            backgroundColor: '#FCFFC5',
            formatter: function () {

                var tooltipHtml = '';
                if(this.series.options.type == 'pie') {
                   tooltipHtml = '<b>' + this.y + ' </b>'+ levelName;
                }
                if(this.series.options.type == 'column'){
                    tooltipHtml = '' + this.key +
                    '<br>' + data.title + ': <b>'+ Highcharts.numberFormat(this.y, 0); + '</b>';
                }
                return tooltipHtml;
            }
        },
        xAxis: {
            type: 'category',
             labels: {
                rotation: -45
               /* style: {
                    fontSize: '7px',
                    fontFamily: 'Verdana, sans-serif',
                    whiteSpace: 'normal',
                    "fontWeight":"bold"
                }*/
            }
        },

        legend: {
            enabled: false
        },

        plotOptions: {

            pie: {
                dataLabels: {
                    enabled: true
                 }
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Chart',
            colorByPoint: true,
            data: data.series,
            type:'pie'
        }],
        drilldown: {
            series: data.drilldown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: -30
               }
            }
        }
    });

}

function metaInfoPieChartCountryLevel(colorCode) {
    var returnInfo = {};
    returnInfo.name = 'No data available';
    var color = '#' + colorCode.substring(colorCode.lastIndexOf('-') + 1, colorCode.length);

	if(iHealthMap.getIndicatorDataType() == "Standard"){

		var metaInfo = province.jsondata.indicators[0].indicatorInfo.levels[0].scales[0].linear[0];
		var colorScale = metaInfo.colorScale;
		for(var i = 0; i < colorScale.length; i++){
			if(color == colorScale[i]) {
				returnInfo.name = metaInfo.scaleDesc[i];
				break;
			}
		}
	} else {

		for (var i = 0; i < iHealthMap.FilterDataArr.length; i++) {

			if (color == iHealthMap.FilterDataArr[i][1]) {
				returnInfo.name = iHealthMap.FilterDataArr[i][0];
				break;
			}
		}
	}

    return returnInfo;
}

function prepareDataPieCountryLevel() {
    var returnChartData = {};
     returnChartData.series = [];
     returnChartData.drilldown = []
     returnChartData.title = dureUtil.indicatorMetaInfo.indicatorInfo.levels[0].scales[0].linear[0].indicatorName;
    $.each(province.scaleRangeCat.regionList, function(index, val) {
        var innerData = {};
        var drillData = {};
        var meta = metaInfoPieChartCountryLevel(index);
        innerData.name = meta.name;
        innerData.y = val.length;
        innerData.color = '#' + index.substring(index.lastIndexOf('-') + 1, index.length);
        innerData.drilldown = meta.name;
        drillData.id = meta.name;
        drillData.type = 'column';
        drillData.data = [];
        for(var i =0; i < val.length; i++){
             var innerDrillData = [];
             innerDrillData.push(val[i][0]);
             innerDrillData.push(val[i][1]);
             drillData.data.push(innerDrillData);

        }
        drillData.dataLabels = {enabled:false};
        returnChartData.series.push(innerData);
        if(iHealthMap.getIndicatorDataType() == "Standard"){
			returnChartData.drilldown.push(drillData);
		}
    });
    //console.log(returnChartData);
    return returnChartData;
}

// District Level Chart (category based chart)  // TODO
function loadPieChartDistrictLevel() {
    var data =  prepareDataPieDistrictLevel();
    var levelName = iHealthChart.getLevel();
      $('.highchartContainer').highcharts({
        chart: {
            type: 'pie',
            events: {
                drilldown: function (e) {
                    var subTitle = e.seriesOptions.id;
                    var count = e.seriesOptions.data.length;
                    var chart = $('.highchartContainer').highcharts();
                    chart.setTitle(null, { text: subTitle + ' - ' + count + ' ' + levelName});
					chart.yAxis[0].setTitle({ text: subTitle });
                },
                drillup: function(e) {
                    var chart = $('.highchartContainer').highcharts();
                    chart.setTitle(null, { text: ''});
					$('.highcharts-yaxis-title').hide();
                } ,
                load: function(event) {
                     setTimeout(function () {
                        $(document).resize();
                        //$(metaInfo.chartContainer).highcharts().reflow();
                        //$(window).resize();
                     }, 100);
                }
            }
        },
        title: {
            text: data.title
        },

        tooltip: {
            backgroundColor: '#FCFFC5',
            formatter: function () {

                var tooltipHtml = '';
                if(this.series.options.type == 'pie') {
                   tooltipHtml = '<b>' + this.y + ' </b>'+ levelName;
                }
                if(this.series.options.type == 'column'){
                    tooltipHtml = '' + this.key +
                    '<br>' + data.title + ': <b>'+ Highcharts.numberFormat(this.y, 0); + '</b>';
                }
                return tooltipHtml;
            }
        },
        xAxis: {
            type: 'category',
             labels: {
                rotation: -45
               /* style: {
                    fontSize: '7px',
                    fontFamily: 'Verdana, sans-serif',
                    whiteSpace: 'normal',
                    "fontWeight":"bold"
                }*/
            }
        },

        legend: {
            enabled: false
        },

        plotOptions: {

            pie: {
                dataLabels: {
                    enabled: true
                 }
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Chart',
            colorByPoint: true,
            data: data.series,
            type:'pie'
        }],
        drilldown: {
            series: data.drilldown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: -30
               }
            }
        }
    });

}

function metaInfoPieChartDistrictLevel(colorCode) {
    var returnInfo = {};
    returnInfo.name = 'No data available';
    var color = '#' + colorCode.substring(colorCode.lastIndexOf('-') + 1, colorCode.length);
    var metaInfo = dureUtil.indicatorMetaInfo.indicatorInfo.levels[0].scales[0].linear[0];
    var colorScale = metaInfo.colorScale;
    for(var i = 0; i < colorScale.length; i++){
        if(color == colorScale[i]) {
            returnInfo.name = metaInfo.scaleDesc[i];
            break;
        }
    }

    return returnInfo;
}
function prepareDataPieDistrictLevel() {
    var returnChartData = {};
     returnChartData.series = [];
     returnChartData.drilldown = []
     returnChartData.title = dureUtil.indicatorMetaInfo.indicatorInfo.levels[0].scales[0].linear[0].indicatorName;
    $.each(subprovince.scaleRangeCat.regionList, function(index, val) {
        var innerData = {};
        var drillData = {};
        var meta = metaInfoPieChartCountryLevel(index);
        innerData.name = meta.name;
        innerData.y = val.length;
        innerData.color = '#' + index.substring(index.lastIndexOf('-') + 1, index.length);
        innerData.drilldown = meta.name;
        drillData.id = meta.name;
        drillData.type = 'column';
        drillData.data = [];
        for(var i =0; i < val.length; i++){
             var innerDrillData = [];
             innerDrillData.push(val[i][0]);
             innerDrillData.push(val[i][1]);
             drillData.data.push(innerDrillData);

        }
        drillData.dataLabels = {enabled:false};
        returnChartData.series.push(innerData);
        if(iHealthMap.getIndicatorDataType() == "Standard"){
			returnChartData.drilldown.push(drillData);
		}
    });
     //console.log(returnChartData);
    return returnChartData;
}


// Get range of years
iHealthChart.getRangeOfYears = function(){
	console.log("Getting range of years for chart.");
	//console.log(iHealthChart.json.rangeOfYears);
	return iHealthChart.json.rangeOfYears;
};

// Get summary data
iHealthChart.getSummaryData = function(index,ptyName){

	if(ptyName == 'data'){
		return iHealthChart.json.data[index].generic.data;
	}else if(ptyName == 'name'){
		return iHealthChart.json.data[index].generic.name;
	}
};

// Get PROVINCE DATA
iHealthChart.getProvinceData = function(index,ptyName){
	//console.log(iHealthChart.provinceJson);
	if(ptyName == 'data'){
		return iHealthChart.provinceJson.data[index].generic.data;
	}else if(ptyName == 'name'){
		return iHealthChart.provinceJson.data[index].generic.name;
	}
};

// Set Province data
iHealthChart.setProvinceData = function(result){
	iHealthChart.provinceJson = result;
}

// Build series object
iHealthChart.buildSeries = function(){
	var series = {};
};

// Updates the chart.
iHealthChart.update = function(result){
	//console.log(iHealthChart.json);
	var chartUpdates = {};
	iHealthChart.chart.xAxis[0].setCategories(result.rangeOfYears);
	for(var i=0;i < result.data.length; i++){
		iHealthChart.chart.series[i].name = result.data[i].generic.name;
		iHealthChart.chart.series[i].setData(result.data[i].generic.data,true);
	}

	chartUpdates.oldText =  $('.targetTitleOnChart').text();
	chartUpdates._index = chartUpdates.oldText.lastIndexOf("-");
	if(chartUpdates._index == -1){
		chartUpdates._index = chartUpdates.oldText.length
	}
	chartUpdates.formatText = chartUpdates.oldText.slice(0, parseInt(chartUpdates._index));
	chartUpdates.newText = chartUpdates.formatText.trim();
	chartUpdates.country = "<span class = 'badge bg-green'>"+iHealthChart.getCountryNameFromMap()+"</span>";
	//console.log("Country Text - " +chartUpdates.country);

	$('.targetTitleOnChart').html(chartUpdates.newText+' - '+chartUpdates.country);

}

// Returns the country name for any map-related interactions by user.
iHealthChart.getCountryNameFromMap = function(){
	return iHealthMap.getCountryName();
}

// Returns the province name for any province map-related interactions by user.
iHealthChart.getProvinceNameFromMap = function(){
	return province.getName();
}

// Returns the district name for any province map-related interactions by user.
iHealthChart.getDistrictNameFromMap = function(){
	return subprovince.getName();
};

iHealthChart.getLocalNameFromMap = function(){
	return local.getName();
};

iHealthChart.getListOfRegions = function(){

	return iHealthChart.json.regionList;
};


/* OverLay Based Chart */

function loadOverLayBaseChart() {
    $('#chartmyTab li:eq(1) a').tab('show') // Select second tab (Overlay chart)
    var data = prepareDataPieOverLay();
    var levelName = iHealthChart.getLevel();
      $('.overlaybase-chartcontainer').highcharts({
        chart: {
            type: 'pie',
            events: {
                drilldown: function (e) {
                    var subTitle = e.seriesOptions.id;
                    var count = e.seriesOptions.data.length;
                    var chart = $('.overlaybase-chartcontainer').highcharts();
                    chart.setTitle(null, { text: subTitle + ' - ' + count + ' ' + levelName});
					chart.yAxis[0].setTitle({ text: subTitle });
                },
                drillup: function(e) {
                    var chart = $('.overlaybase-chartcontainer').highcharts();
                    chart.setTitle(null, { text: ''});
					$('.highcharts-yaxis-title').hide();
                }
            }
        },
        title: {
            text: data.title
        },

        tooltip: {
            backgroundColor: '#FCFFC5',
            formatter: function () {

                var tooltipHtml = '';
                if(this.series.options.type == 'pie') {
                    tooltipHtml = '<b>' + this.y + ' </b>'+ levelName;
                }
                if(this.series.options.type == 'column'){
                    tooltipHtml = '' + this.key +
                    '<br>' + data.title + ': <b>'+ Highcharts.numberFormat(this.y, 0); + '</b>';
                }
                return tooltipHtml;
            }
        },
        xAxis: {
            type: 'category',
             labels: {
                rotation: -45,
                style: {
                    fontSize: '7px',
                    fontFamily: 'Verdana, sans-serif',
                    whiteSpace: 'normal',
                    "fontWeight":"bold"
                }
            }
        },

        legend: {
            enabled: false
        },

        plotOptions: {

            pie: {
                dataLabels: {
                    enabled: true
                 }
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Chart',
            colorByPoint: true,
            data: data.series,
            type:'pie'
        }],
        drilldown: {
            series: data.drilldown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: -30
               }
            }
        }
    });
}


/* OverLay Based Chart for Bubble overlay*/

function loadOverLayBaseChartBubble(options) {
    $('#chartmyTab li:eq(1) a').tab('show') // Select second tab (Overlay chart)
    var data = dureOverlays.parseDataBubbleChart(options);
    var levelName = iHealthChart.getLevel();
      $('.overlaybase-chartcontainer').highcharts({
        chart: {
            type: 'pie',
            events: {
                drilldown: function (e) {
                    var subTitle = e.seriesOptions.id;
                    var count = e.seriesOptions.data.length;
                    var chart = $('.overlaybase-chartcontainer').highcharts();
                    chart.setTitle(null, { text: subTitle + ' - ' + count +  ' ' + levelName});
					chart.yAxis[0].setTitle({ text: subTitle });
                },
                drillup: function(e) {
                    var chart = $('.overlaybase-chartcontainer').highcharts();
                    chart.setTitle(null, { text: ''});
					$('.highcharts-yaxis-title').hide();
					$('.highcharts-axis').hide();
                }
            }
        },
        title: {
            text: data.title
        },

        tooltip: {
            backgroundColor: '#FCFFC5',
            formatter: function () {

                var tooltipHtml = '';
                if(this.series.options.type == 'pie') {
                    tooltipHtml = '<b>' + this.y + ' </b>'+ levelName;
                }
                if(this.series.options.type == 'column'){
                    tooltipHtml = '' + this.key +
                   // '<br>' + data.title + ': <b>'+ Highcharts.numberFormat(this.y, 0); + '</b>';
					 '<br>' + data.title + ': <b>'+dureUtil.numberWithSpace(numberWithRound(this.y, 2)); + '</b>';
                }
                return tooltipHtml;
            }
        },
        xAxis: {
            type: 'category',
             labels: {
                rotation: -45,
                style: {
                  /*  fontSize: '7px',
                    fontFamily: 'Verdana, sans-serif',
                    whiteSpace: 'normal',
                    "fontWeight":"bold"*/
                }
            }
        },

        legend: {
            enabled: false
        },

        plotOptions: {

            pie: {
                dataLabels: {
                    enabled: true
                 }
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Chart',
            colorByPoint: true,
            data: data.series,
            type:'pie'
        }],
        drilldown: {
            series: data.drilldown,
            drillUpButton: {
                relativeTo: 'spacingBox',
                position: {
                    y: 0,
                    x: -30
               }
            }
        }
    });

	setTimeout(function(){ $('.overlaybase-chartcontainer').highcharts().reflow();}, 600);
}


function resetOverLayContainer() {

    $('.overlaybase-chartcontainer').empty();
   /* $('.overlaybase-chartcontainer').css(
        {   "height": "375px",
            "text-align": "center",
            "padding-top": "168px",
        });*/
    $('.overlaybase-chartcontainer').text('Overlay not available or not selected !');
   $('#chartmyTab a:first').tab('show') // Select first tab (Indicator chart)
}


iHealthChart.loadColumnChart = function(layerType){

 var chartObj = {};
 var currentYear = iHealthMap.getCurrentyear();
 if(dureUtil.currentFormattedJSONData == null){
  dureUtil.currentFormattedJSONData = dureUtil.currentFormattedJSONDataTemp;
 }

	var extractedObj = '';
	var color = '';

 if(layerType == 'Overlay'){

  var container = '.overlaybase-chartcontainer';

  if(dureUtil.getDataLevel() == 'country'){
   extractedObj  = dureUtil.currentFormattedJSONData.extractedObjects.derivedData[0].data[0];
   color = dureUtil.currentFormattedJSONData.extractedObjects.derivedInfo[0].levels[0].scales[0].linear[0].colorScale[0];

  }else if(dureUtil.getDataLevel() == 'province'){
   extractedObj  = dureUtil.currentFormattedJSONData.extractedObjects.districtIndicatorData[0];
   color = dureUtil.currentFormattedJSONData.extractedObjects.metaInfo.levels[1].scales[0].linear[0].colorScale[0];
  }

 }else{

  var container = '.highchartContainer';

  if(dureUtil.getDataLevel()== 'country'){
   extractedObj  = dureUtil.currentFormattedJSONData.extractedObjects.coreData[0];
   color = dureUtil.currentFormattedJSONData.extractedObjects.metaInfo.levels[0].scales[0].linear[0].colorScale[0];

  }else if(dureUtil.getDataLevel()== 'province'){
   extractedObj  = dureUtil.currentFormattedJSONData.extractedObjects.districtIndicatorData[0];
   color = dureUtil.currentFormattedJSONData.extractedObjects.metaInfo.levels[1].scales[0].linear[0].colorScale[0];

  }
 }

 //console.log(extractedObj);


   // Temporary Fix: As years not in sync.
  var years = Object.keys(extractedObj);

    //console.log(years);

  if($.inArray(currentYear,years) == -1){

   currentYear = years[0];
  }
  //End of Fix.


   //console.log(currentYear);

 chartObj.provinceNameArr = iHealthChart.fetchProvinceName(extractedObj);

 chartObj.data = iHealthChart.fetchProvinceDataForYear(extractedObj[currentYear][0]);

  $(container).highcharts({
  chart: {
   type: 'column'
  },
  title: {
   text: chartObj.data.name
  },
  xAxis: {
   categories: chartObj.provinceNameArr,
   crosshair: true
  },
  yAxis: {
   min: 0,
   title: {
    text: 'Number'
   }
  },
  colors:[color],
  tooltip: {
   headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
   pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
    '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
   footerFormat: '</table>',
   shared: true,
   useHTML: true
  },
  plotOptions: {
   column: {
    pointPadding: 0.2,
    borderWidth: 0
   }
  },
  series: [{
   name: chartObj.data.name,
   data: chartObj.data.values

  }]
 });
}

iHealthChart.fetchProvinceName = function(extractedObj){
 var currentYear = iHealthMap.getCurrentyear();
 var regionNameArr = [];
 //console.log(extractedObj)

 // Temporary Fix: As years not in sync.
 var years = Object.keys(extractedObj);

 if($.inArray(currentYear,years) == -1){

  currentYear = years[0];
 }
 //End of Fix.

 if(dureUtil.getDataLevel()== 'country'){

  var geoJsonFeatures = dureUtil.geoJson.features;
  var nameKEY = 'NAME_1';

 }else if(dureUtil.getDataLevel()== 'province'){

  var geoJsonFeatures = subprovince.geoJson.features;
  var nameKEY = 'NAME_2';
  //console.log(subprovince.geoJson);
 }

  //console.log(extractedObj);
 $.each(geoJsonFeatures,function(index,object){

  $.each(extractedObj[currentYear][0],function(iso,dataArr){

   if(iso == object.properties.ISO){

    regionNameArr.push(object.properties[nameKEY]);
   }
  });
 });
 return regionNameArr;
}

iHealthChart.fetchProvinceDataForYear = function(dataForCurrentYear){

 var chartDataObj = {};
 var currentYeardataArr = []

 if(dataForCurrentYear != undefined){

  $.each(dataForCurrentYear,function(iso,dataArray){
   currentYeardataArr.push(dataArray[0][0]);
   chartDataObj.name = dataArray[1][0]
  });
 }
 chartDataObj.values = currentYeardataArr
 return chartDataObj;
}
