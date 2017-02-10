var dureBechmark = {};

/************************************* CHART SECTION *****************************************/

dureBechmark.prepareChartTabs = function() {

	$('.benchmark-tab').on('click', function() {
		
		var attrVal = $(this).attr('data-country-code');
		
		var attrArray = attrVal.split('-');
		
		var indicatorId = attrArray[0];
		var countryISO = attrArray[1];
		var metaInfo = {};
		
		$.getJSON(dureApp.appPath + 'tempdata/region_comparision/'+ indicatorId +'.json', function(result) {
			
			var countryData = result.data[countryISO];
			//console.log(countryData);
			
			metaInfo.chartContainer = 'benchmark-' + dureUtil.removeSpaces(countryData.indicator_name);
			metaInfo.title = countryData.indicator_name + ' ('+ countryData.world_region_name +')';
			metaInfo.toolTipValue = countryData.numerator_label;
			metaInfo.dataCategories = [];
			metaInfo.dataValues = [];
			
			$.each(result.data, function(key, val){
				//console.log(key);
				
				if (countryData.world_region_code == val.world_region_code) {

					//console.log(val);
					//console.log(toTitleCase(val.country_name));
					metaInfo.dataCategories.push(toTitleCase(val.country_name));
					if (val.numerator == '-1' || val.numerator == -1) {
						metaInfo.dataValues.push(null);
					} else {
						metaInfo.dataValues.push(Number(val.numerator));
					}
				}
			});	
			dureBechmark.showChart(metaInfo);			
			
		}).error(function(jqXHR, textStatus, errorThrown) {
		
			if(jqXHR.status == 404){
				dureApp.showDialog('Province level data not available.','info');
			}
		});
	});
}

dureBechmark.showChart = function(metaInfo) {
	
	var regionalAverage = 0;
	
	var lineWidth = 0;

	if(metaInfo.chartContainer != "benchmark-HIVprevalence") {
		var totalVal = 0;
		metaInfo.dataValues.map(function( value ) {
			if(typeof value == 'number')
			totalVal += value;
		});
		var averageValue = (totalVal / metaInfo.dataValues.length);
		regionalAverage = averageValue;
		lineWidth = 4;
		//metaInfo.dataCategories.push("Region Average");
		//metaInfo.dataValues.push({y:averageValue, color:'#1860a6'});
		
	}
	
	$('#'+metaInfo.chartContainer).highcharts({
		chart: {
			type: 'column'
		},
		title: {
			text: metaInfo.title
			//text: ''
		},
		/*legend: {
            labelFormatter: function() {
                return '';
            },
            title: {
                text:'' //'<b>Source: JRF and WHO estimates</b>'
            }
        },*/
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
			categories: metaInfo.dataCategories
		},
		yAxis: {
            title: {
                text: metaInfo.toolTipValue
            },
            plotLines: [{
                    value: regionalAverage,
                    color: 'red',
                    dashStyle: 'shortdash',
                    width: lineWidth,
                    label: {
                        text: 'Region Average',
							  style: {
							   fontWeight: 'bold',
							   fontSize:'15px'
							  }
							  
											},
							  zIndex: 99999
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
			name: metaInfo.toolTipValue,
            data: metaInfo.dataValues
        }]
	});
	
	setTimeout(function() {
		$('#'+ metaInfo.chartContainer).highcharts().setSize($('#'+ metaInfo.chartContainer).width(),$('#'+ metaInfo.chartContainer).height()); 
	}, 200);
}

function toTitleCase(str)
{
    return str.replace(/\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

}