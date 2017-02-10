var durePopup = {};
var chartMetaData = [];

// All properties and methods initialized.
durePopup.getData = function(countryId) {

	var username = 'admin';
	var password = 'IHEALTH@9028';
	
	var queryString = 'appid='+dureUtil.appId+'&langid='+dureUtil.langId+'&locationid='+countryId+'&levelid=2&callback=durePopup.show';	
	
	var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/target/all/dashBoardData/?'+queryString;
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
		error: function (request, textStatus, errorThrown) {
			////console.log(request.responseText);
			////console.log(textStatus);
			////console.log(errorThrown);
		}
	});
};

durePopup.show = function(resp) {

	//console.log("============================== Pop-up data call back ================================");
	//console.log(resp);
	
	chartMetaData = [];
	var countryName = resp.locationProfile.locationname;
	var countryISO = resp.locationProfile.isocode;
	var popupSections;
	
	// Create tab sections on modal popup
	//durePopup.createSections(resp.locationProfile.sections);
	popupSections = durePopup.createSections(resp.locationProfile.sections, countryISO);
	
	//console.log(popupSections);
	
	$('#countryProfileSections').html(popupSections);
	
	var countryDropdownURL = Base64.encode('countryid='+durePopup.getCountryIDFromISO(countryISO));
	var countryProfileLink = '<a target="_blank" href="dashboard.html?'+ countryDropdownURL +'">Country Profile</a>'
	$('#country-profile-button').html(countryProfileLink);
	$('#countryProfileHeaderName').html('<span class="f32"><span class="flag ' + countryISO.toLowerCase() +'"></span></span>&nbsp&nbsp' + countryName);
	$('#myCascadeModalHeaderName').html('<span class="f32"><span class="flag ' + countryISO.toLowerCase() +'"></span></span>&nbsp&nbsp' + countryName + ' Cascade');
	
	dureBechmark.prepareChartTabs();
	durePopup.prepareChartTabs();
	
	
	//console.log("Show country pop-up");
	
	$("#countryProfileModal").modal({show: true});
	//$('#dropdown0-tab').trigger('click');
};

durePopup.createSections = function(sections, countryISO) {
	
	var wholeSection;
	var sectionTabs = '<ul class="nav nav-tabs" role="tablist" id="myTab">';
	var sectionTabPane = '<div class="tab-content padding_0_0 margin_bottom_0 border_0">';	
	
	$.each(sections, function(key, val){
		
		//console.log(key);
		//console.log(val);
		
		var activeTab = '';
		if (val.sectionname == 'Country Snapshot') {
			activeTab = 'active';
		}
		
		var tabControl = dureUtil.removeSpaces(val.sectionname.toLowerCase());
		
		if(val.sectionType == 'indicatorData') {
			// If section type is indicator data create tab-panes for chart
			
			sectionTabs += '<li role="presentation" class="dropdown '+activeTab+'"><a href="#" id="'+ tabControl +'" class="dropdown-toggle"  aria-controls="'+ tabControl +'-contents" data-toggle="dropdown">'+ val.sectionname +'<span class="caret"></span></a>';
			
			sectionTabs += '<ul class="dropdown-menu" role="menu" aria-labelledby="'+ tabControl +'" id="'+ tabControl +'-contents">';
						
			$.each(val[val.sectionname], function(k, v) {
	
				var chartSingle = {};				
				var chartContainer = dureUtil.removeSpaces(v.indicatorname.toLowerCase()) +"ChartContainer";
				if((val[val.sectionname].length - 1) > k ) { // dont show last drop menu item 
					sectionTabs += '<li><a href="#dropdown'+ k +'" tabindex="-1" role="tab" id="dropdown'+ k +'-tab" data-toggle="tab" aria-controls="dropdown'+ k +'" class="paddingtop-12">'+ v.indicatorname +'</a></li>';
					sectionTabPane += '<div role="tabpanel" class="tab-pane fade '+activeTab+'" id="dropdown'+ k +'" aria-labelledBy="dropdown'+ k +'-tab"><div id="'+ chartContainer +'">'+ v.indicatorname +'</div></div>';	
				}			
				
				
				// Create chart meta data array				
		
				chartSingle.active = k;
				chartSingle.chartData = v.data;
				chartSingle.chartContainer = chartContainer;
				chartSingle.title = v.indicatorname;
				chartSingle.seriesName = v.indicatorname;
				chartSingle.toolTipValue = v.indicatorname;
				chartSingle.yTitleText = v.indicatorname;
				
				chartMetaData.push(chartSingle);

			});
			
			//sectionTabs += '<li><a href="#" tabindex="-1" id="dropdownCascade" class="paddingtop-12">Cascade</a></li>';
				
			//sectionTabPane += '<div role="tabpanel" class="tab-pane fade" id="dropdownCascade" aria-labelledBy="dropdownCascade-tab"><div id="cascadeChartContainer">Cascade</div></div>';
			
			sectionTabs += '</ul>';
			sectionTabs += '</li>';

			if(key == 0){

				sectionTabs += '<li role="presentation" class="dropdown"><a href="#" id="benchmarking" class="dropdown-toggle"  aria-controls="benchmarking-contents" data-toggle="dropdown">Benchmarking<span class="caret"></span></a>';
			
				sectionTabs += '<ul class="dropdown-menu" role="menu" aria-labelledby="benchmarking" id="benchmarking-contents">';
				
				sectionTabs += '<li><a href="#benchmark-dropdown1" tabindex="-1" role="tab" id="benchmark-dropdown1-tab" data-country-code="168-'+ countryISO +'" data-toggle="tab" aria-controls="benchmark-dropdown1" class="benchmark-tab paddingtop-12">HIV Prevalence</a></li>';
				sectionTabs += '<li><a href="#benchmark-dropdown2" tabindex="-1" role="tab" id="benchmark-dropdown2-tab" data-country-code="169-'+ countryISO +'" data-toggle="tab" aria-controls="benchmark-dropdown2" class="benchmark-tab paddingtop-12">PLHIV</a></li>';
				sectionTabs += '<li><a href="#benchmark-dropdown3" tabindex="-1" role="tab" id="benchmark-dropdown3-tab"data-country-code="170-'+ countryISO +'" data-toggle="tab" aria-controls="benchmark-dropdown3" class="benchmark-tab paddingtop-12">People on ART</a></li>';
				sectionTabs += '<li><a href="#benchmark-dropdown4" tabindex="-1" role="tab" id="benchmark-dropdown4-tab" data-country-code="171-'+ countryISO +'" data-toggle="tab" aria-controls="benchmark-dropdown4" class="benchmark-tab paddingtop-12">HIV Related Deaths</a></li>';
				sectionTabs += '</ul>';
				sectionTabs += '</li>';	
							
				sectionTabPane += '<div role="tabpanel" class="tab-pane fade" id="benchmark-dropdown1" aria-labelledBy="benchmark-dropdown1-tab"><div id="benchmark-HIVprevalence">HIV Prevalence</div></div>';
				sectionTabPane += '<div role="tabpanel" class="tab-pane fade" id="benchmark-dropdown2" aria-labelledBy="benchmark-dropdown2-tab"><div id="benchmark-PLHIV">PLHIV</div></div>';
				sectionTabPane += '<div role="tabpanel" class="tab-pane fade" id="benchmark-dropdown3" aria-labelledBy="benchmark-dropdown3-tab"><div id="benchmark-PeopleonART">People on ART</div></div>';
				sectionTabPane += '<div role="tabpanel" class="tab-pane fade" id="benchmark-dropdown4" aria-labelledBy="benchmark-dropdown4-tab"><div id="benchmark-HIVRelatedDeaths">HIV Related Deaths</div></div>';
				
			}
			
		} else if (val.sectionname == 'Documents') {
			sectionTabs += '<li role="presentation" class="'+activeTab+'"><a href="#'+ tabControl +'" aria-controls="'+ tabControl +'" role="tab" data-toggle="tab">'+ val.sectionname +'</a></li>';
			
			sectionTabPane += '<div role="tabpanel" class="tab-pane '+activeTab+'" id="'+ tabControl +'">';
			
			sectionTabPane += '<div class="panel-group" id="accordion">';			
			
			////console.log(val.data);
			
			var nestedLinksArray = {};
			
			$.each(val.data, function(k, v) {
			
				if(!nestedLinksArray.hasOwnProperty(v[2])) {
					nestedLinksArray[v[2]] = [];
				}
				var labelLink = [];
				var labelHref = [];

				labelLink.push(v[0]);
				labelLink.push(v[1]);			
				nestedLinksArray[v[2]].push(labelLink);			
			});
						
			////console.log(nestedLinksArray);
			var menuNumber = 1;
			$.each(nestedLinksArray, function(ind, obj) {
				
				//sectionTabPane += '<div class="panel">';	
				////console.log(ind);
				////console.log(obj);
				
				sectionTabPane += '<div class="panel-heading" data-toggle="collapse" data-parent="#accordion" href="#collapse'+ menuNumber +'">';				
				sectionTabPane += '<h4 class="panel-title">';
				sectionTabPane += '<i class="fa fa-plus"></i>&nbsp;&nbsp;<a>'+ ind +'</a>';
				sectionTabPane += '</h4>';
				sectionTabPane += '</div>';
				sectionTabPane += '<div id="collapse'+ menuNumber +'" class="panel-collapse collapse">';
				sectionTabPane += '<div class="panel-body">';
				
				$.each(obj, function(i, o) {
				
					var icon = durePopup.getIconFileType(o[1]);
				
					sectionTabPane += '<i class="'+ icon +'"></i>&nbsp;&nbsp;<a href="'+ o[1] +'" target="_blank">'+ o[0] +'</a><br>';
				
				});	
				sectionTabPane += '</div>';
				sectionTabPane += '</div>';
				
				//sectionTabPane += '</div>';	
				menuNumber++;
			});
			
			sectionTabPane += '</div>';
			sectionTabPane += '</div>';
		} else {
	
            var panelBody = '';
			sectionTabs += '<li role="presentation" class="'+activeTab+'"><a href="#'+ tabControl +'" aria-controls="'+ tabControl +'" role="tab" data-toggle="tab">'+ val.sectionname +'</a></li>';
			
			sectionTabPane += '<div role="tabpanel" class="tab-pane '+activeTab+'" id="'+ tabControl +'">';
            
            if (val.sectionType == 'text') {
            
                sectionTabPane += '<ul class="list-group other-docs">';
                $.each(val.data, function(k, v) {
                    
                    sectionTabPane += '<li class="list-group-item"><a href="#">'+ v[0] +'</a></li>';                    
                });
                sectionTabPane += '</ul>';
                
            } else if (val.sectionType == 'document') {
                
                panelBody += '<div class="row"><div class="col-md-12">'
                //console.log(val.data);
                var header = '';
                var panelHeaderArr = [];
                var panelBodyArr = [];
                var panelContent = {};
                var i=0;
                var prevPty = '';
				
				// Object is used for Hard-coding to fetch icons and bgcolor in the info-box of the Socio-econmic Panel Section.
				var iconObj = {
						 "Total Population <br> (In Millions)(2014)" : ["fa fa-users","bg-aqua"],
					     "GDP" : ["fa fa-usd","bg-aqua"],
					     "HDI" : ["fa fa-users","bg-aqua"],
					     "Health Expenditure, Total <br> (% of GDP) (2013)" : ["fa fa-area-chart","bg-red"],
					     "Human Development Index Value (2013)" : ["icon-i-genetics","bg-green"],
					     "Health Expenditure per capita <br>(current US$) (2013)" : ["icon-i-billing","bg-yellow"],
					     "Life Expectancy at birth (2010-15)" : ["icon-i-cardiology","bg-blue"],
					     "Maternal Mortality <br>(per 100 000 live births) (2013)" : ["icon-i-labor-delivery","bg-light-blue"],
					     "HIV Prevalence %" : ["fa fa-plus-square","bg-red"],
					     "NO.OF NEW INFECTIONS" : ["fa fa-plus-square","bg-red"],
					     "CUMULATIVE HIV CASES" : ["fa fa-briefcase","bg-red"],
					     "NEW HIV CASES" : ["fa fa-briefcase","bg-red"],
					     "DEATHS" : ["fa fa-plus-square","bg-red"],
					     "HIV Related Deaths" :["icon-Aids-death","bg-red"],
					     "People ON ART" :["icon-Currently-in-ART","bg-red"],
					     "ART Policies" : ["icon-Prevention-by-key-population","bg-red"],
					     "PLHIV" : ["icon-All-People_1","bg-red"],
					     "Incidence" : ["icon-New-infections","bg-red"]
				}
				
				 var counter = 0;
                
                $.each(val.data,function(index,dataValueArr){
                
                    counter++;
					
					if(iconObj.hasOwnProperty(dataValueArr[2])){
						//console.log(dataValueArr[2]);	
						var iconClass = iconObj[dataValueArr[2]][0];
						var iconBgColor = iconObj[dataValueArr[2]][1];
					}else{
						
						var iconClass = "fa fa-users";
						var iconBgColor = "bg-aqua";
					}
                    
                    if(panelContent.hasOwnProperty(dataValueArr[4])){

						dataValueArr[0] = dataValueArr[0] == "N/A" ? dataValueArr[0] : dureUtil.numberWithSpace(dataValueArr[0]);
                        panelContent[dataValueArr[4]] += '<div class="col-md-4 col-sm-6 col-xs-12">'+
                                      '<div class="info-box">'+
                                        '<span class="info-box-icon '+iconBgColor+' "><i class="'+iconClass+'"></i></span>'+
                                        '<div class="info-box-content">'+
                                          '<span class="info-box-text">'+dataValueArr[2]+'</span>'+
                                          '<span class="info-box-number">'+dataValueArr[0]+'</span>'+
                                        '</div>'+
                                      '</div>'+
                                    '</div>';
                        i = 1;
                        prevPty = dataValueArr[4];
                        
                    }else{
						
                        if(i > 0){
                            panelContent[prevPty] += '</div>';
                        }
                        
                        panelContent[dataValueArr[4]] ={}
                        panelContent[dataValueArr[4]] = '';
                        
                        panelContent[dataValueArr[4]] = '<div class="row"><div class="col-md-4 col-sm-6 col-xs-12">'+
                                                          '<div class="info-box">'+
                                                            '<span class="info-box-icon '+iconBgColor+' "><i class="fa fa-users"></i></span>'+
                                                            '<div class="info-box-content">'+
                                                              '<span class="info-box-text">'+dataValueArr[2]+'</span>'+
                                                              '<span class="info-box-number">'+dataValueArr[0]+'</span>'+
                                                            '</div>'+
                                                          '</div>'+
                                                        '</div>';
                    }
                });
                panelContent[prevPty] += '</div>';
//                //console.log(panelContent);

                sectionTabPane += '<div class="box-group" id="accordion1" style="overflow: hidden;">'
                sectionTabPane+= durePopup.buildBoxHtml(panelContent);
                sectionTabPane += '</div>';           
            }			
			sectionTabPane += '</div>'; 
		}			
	});
	
	sectionTabs += '</ul>';
	sectionTabPane += '</div>';
	
	wholeSection = sectionTabs + sectionTabPane;
	
	return wholeSection;
};

durePopup.getIconFileType = function(fileUrl) {
	
	var str = fileUrl;
	var result = str.replace(/\.([^.]+)$/, ':$1').split(':');
	////console.log(result);
	var type = result[2];
	type = type.trim();
	
	var fileIcon;
	
	switch(type) {	
		case 'doc':
			fileIcon = 'fa fa-file-word-o icon-blue';
		break;
		
		case 'docx':
			fileIcon = 'fa fa-file-word-o icon-blue';
		break;
		
		case 'pdf':
			fileIcon = 'fa fa-file-pdf-o icon-red';
		break;
		
		case 'xls':
			fileIcon = 'fa fa-file-excel-o icon-green';		
		break;
		
		case 'xlsx':
			fileIcon = 'fa fa-file-excel-o icon-green';		
		break;
		
		default: 
			fileIcon = 'fa fa-file-o';
		break;	
	}
	
	return fileIcon;
};

/************************************* CHART SECTION *****************************************/

durePopup.prepareChartTabs = function() {

	var cascadeArray = [];

	$.each(chartMetaData, function(index, value) {

		$('#dropdown'+ index +'-tab').on('click', function() {
			
			durePopup.showChart(value);
		});
		
		var cascadeObject = {};
		
		cascadeObject.title = value.title;
		cascadeObject.value = value.chartData[2014][0];
		
		cascadeArray.push(cascadeObject);
	});
	
	$('#dropdownCascade').on('click', function() {

		$("#myCascadeModal").modal({show: true});
	});
	
	$('#cascadeModalPLHIV').text(durePopup.getValidateAndFormatVal(cascadeArray[1].value));
	$('#cascadeModalDomesticViolence').text('');
	$('#cascadeModalPreventionByKeyPopulation').text('');
	$('#cascadeModalKnowing').text('');
	$('#cascadeModalLinkageToCare').text('');
	$('#cascadeModalCurrentlyOnART').text(durePopup.getValidateAndFormatVal(cascadeArray[2].value));
	$('#cascadeModalArtRetention').text('');
	$('#cascadeModalViralSuppression').text('');
	$('#cascadeModalAIDSDeaths').text(durePopup.getValidateAndFormatVal(cascadeArray[3].value));
	$('#cascadeModalInfections').text(durePopup.getValidateAndFormatVal(cascadeArray[5].value));
	
	//var cascadeTable = '<table class="table"> <thead><tr><th>People with HIV</th><th>Domestic finance (USD)</th><th>Prevention by key population</th><th>Knowing HIV status</th><th>Currently on ART</th><th>Linkage to care</th><th>ART retention</th><th>Viral suppression</th><th>HIV deaths</th><th>New infection</th></tr></thead> <tbody class="modalcascade"><tr> <td>'+ cascadeArray[1].value +'</td> <td>N/A</td> <td>N/A</td> <td>N/A</td> <td>'+ cascadeArray[2].value +'</td> <td>N/A</td> <td></td> <td>N/A</td> <td>'+ cascadeArray[3].value +'</td> <td>N/A</td> </tr></tbody></table>';
	
	
	//$('#cascadeChartContainer').html(cascadeTable);
}

durePopup.getValidateAndFormatVal = function(val) {

	return val == "N/A" ? '' : val == -1 ?  '' : dureUtil.numberWithSpace(val);
}

durePopup.showChart = function(metaInfo) {
	
	var crntSelChartData = durePopup.getChartFormatedData(metaInfo.chartData);
	
	var setCategoriesValue = crntSelChartData.data.categoriesValue;
    var setDataValue = crntSelChartData.data.dataValue;
	
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

	setTimeout(function(){
		$('#'+ metaInfo.chartContainer).highcharts().setSize($('#'+ metaInfo.chartContainer).width(),$('#'+ metaInfo.chartContainer).height()); 
	}, 200);
}

durePopup.getChartFormatedData = function(data) {
	
	var returnData = {
		"data": {
			"categoriesValue": [],
			"dataValue": []
		}
	};
		
	if(data) {
	
		$.each(data, function(k,v) {
				returnData.data.categoriesValue.push(Number(k));
				if(v[0] && v[0] > 0) {
					returnData.data.dataValue.push(v[0]);
				} else{
					returnData.data.dataValue.push(null);
				}
		});
	}
	
	return returnData;
}


durePopup.buildBoxHtml = function(panelContentObj) {
    
    var html = '';
    var className = 'collapsed';
    var firstIn = 1;
    var flag = false;
    var collapse = '';
    $.each(panelContentObj,function(header,body) {
             
        if(firstIn > 1){
            collapse = 'in';
            flag = true; 
            className = "";
        }
             
        html += "<div class='panel box box-solid box-primary'>"+
                  "<div class='box-header countryProfileheader' style='margin-top: 10px;'>"+
                    "<h5 class='box-title'>"+
                      "<a  data-toggle='collapse' data-parent='#accordion1' href=#collapsItem"+firstIn+" class="+className+">"+
                        "<i class='fa fa-plus'></i>  "+
                        header+
                      "</a>"+
                    "</h5>"+
                  "</div>"+
                  "<div id=collapsItem"+firstIn+" class= 'panel-collapse collapse "+collapse+"'>"+
                    "<div class='box-body'>"+body+"</div>"+        
                  "</div>"+
                "</div>";
        
                
        firstIn++;     
    });

	html += "<div class='panel box box-solid box-primary'>"+
		  "<div class='box-header countryProfileheader' style='margin-top: 10px;'>"+
			"<h5 class='box-title'>"+
			  "<a data-toggle='collapse' data-parent='#accordion1' href='#collapsItem'>"+
				"<i class='fa fa-plus'></i> Cascade</a>"+
			"</h5>"+
		  "</div>"+
		  "<div id='collapsItem' class='panel-collapse collapse'>"+
			"<div class='box-body'>"+
				'<div class="row text-center paddingmarginleft">'+
					'<div class="col-md-2 maindiv1">'+						
						'<p class="margin0px"><strong>Know your</strong><span class="pull-right marginrightminus15"><i class="fa fa-arrow-right fa-3x redtext"></i></span></p>'+
						'<p><strong>epidemic</strong></p>'+
						'<p class="firstdivdescr">Epidemic pattern by key population,age,sex and geography</p>'+			
					'</div>'+					
					'<div class="col-md-2 maindiv2">'+						
						'<p class="margintop10px"><strong>Inputs</strong><span class="pull-right secondredarrow"><i class="fa fa-arrow-right fa-3x redtext"></i></span></p>'+
						'<p class="seconddivdescr">Health system inputs and financing</p>'+
					'</div>'+
					'<div class="col-md-5 thirdmaindiv">'+
						'<p class="margintop10px"><strong>Outputs & outcomes</strong><span class="pull-right secondredarrow"><i class="fa fa-arrow-right fa-3x redtext"></i></span></p>'+
						'<p class="redtext">HIV care cascade</p>'+
						'<p><img src="img/HIV care cascade.jpg" class="img img-responsive"/></p>'+
						'<div class="row">'+
							'<div class="col-md-3">'+
								'<p class="fontsize12px">Prevention</p>'+
							'</div>'+
							'<div class="col-md-2 text-left marginleftminus20px">'+
								'<p class="fontsize12px">HIV testing service</p>'+
							'</div>'+
							'<div class="col-md-2">'+
								'<p class="fontsize12px">Linkage to care</p>'+
							'</div>'+
							'<div class="col-md-1 marginleft10px">'+
								'<p class="fontsize12px">ART</p>'+
							'</div>'+
							'<div class="col-md-4 text-center marginleft10px">'+
								'<p class="fontsize12px">Viral suppression</p>'+
							'</div>'+
						'</div>'+
					'</div>'+
					'<div class="col-md-2 maindiv4">'+						
						'<p class="margintop10px"><strong>Evaluate impact</strong></p>'+
						'<p class="fontsize12mb10px margintop80px">Reduced incidence and deaths,equity</p>'+
						'<p class="fontsize12px">Assess outcomes at all stages of the cascade</p>'+
					'</div>'+			
				'</div>'+
				'<div class="row text-left paddingmarginleft">'+
							'<div class="col-md-2 text-center padding5px">'+					
								'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
								'<p class="fontsize12mb10px"><strong>1.People</strong></p>'+
								'<p class="fontsize12mb10px"><strong>with HIV</strong></p>'+
								'<p class="fontsize12px"><strong>&nbsp;</strong></p>'+
								'<p class="fontsize12px"><span class="badge numbersbadge" id="cascadeModalPLHIV">96,836,480</span></p>'+
							'</div>'+
							'<div class="col-md-2 text-center padding5px">'+								
								'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
								'<p class="fontsize12mb10px"><strong>2.Domestic</strong></p>'+
								'<p class="fontsize12mb10px"><strong>Finance</strong></p>'+
								'<p class="fontsize12px"><strong>&nbsp;</strong></p>'+
								'<p class="fontsize12px"><span class="badge numbersbadge" id="cascadeModalDomesticViolence">96,836,480</span></p>'+
							'</div>'+
							'<div class="col-md-5 marginleft10px padding5px">'+																
								'<div class="row paddingrightzero">'+
									'<div class="col-md-3 text-left marginleftminus10px">'+
										'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
										'<p class="fontsize12px"><strong>3.Prevention by key populations</strong></p>'+
										'<p class="fontsize12px marginleftminus10px"><span id="cascadeModalPreventionByKeyPopulation" class="badge numbersbadge">96,836,480</span></p>'+										
									'</div>'+
									'<div class="col-md-2 text-left marginleftminus10px">'+
										'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
										'<p class="fontsize12mb10px"><strong>4.Knowing</strong></p>'+
										'<p class="fontsize12px"><strong>HIV status</strong></p>'+
										'<p class="fontsize12px marginleftminus10px"><span id="cascadeModalKnowing" class="badge  numbersbadge">96,836,480</span></p>'+
									'</div>'+
									'<div class="col-md-2 text-left marginleft10px">'+
										'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
										'<p class="fontsize12px"><strong>5.Linkage to care</strong></p>'+
										'<p class="fontsize12px"><span id="cascadeModalLinkageToCare" class="badge numbersbadge">96,836,480</span></p>'+
									'</div>'+
									'<div class="col-md-2 text-right marginleft10px">'+
										'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
										'<p class="fontsize12px"><strong>6.Currently on ART</strong></p>'+
										'<p class="fontsize12px marginleft10px"><span id="cascadeModalCurrentlyOnART" class="badge  numbersbadge">96,836,480</span></p>'+
										'<p class="fontsize12px margintop20px"><strong>7.ART retention</strong></p>'+
										'<p class="fontsize12px"><span id="cascadeModalArtRetention" class="badge numbersbadge">96,836,480</span></p>'+
									'</div>'+
									'<div class="col-md-2 text-right marginleft30px">'+
										'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
										'<p class="fontsize12mb10px text-right"><strong>8.Viral suppression</strong></p>'+
										'<p class="fontsize12px"><strong>&nbsp;</strong></p>'+
										'<p class="fontsize12px"><span id="cascadeModalViralSuppression" class="badge numbersbadge">96,836,480</span></p>'+
									'</div>'+
								'</div>'+
							'</div>'+
							'<div class="col-md-2 text-center padding5px marginleft20px">'+							
								'<p class="margintopminus26px text-center"><strong><i class="fa fa-long-arrow-down fa-2x"></i></strong></p>'+
								'<p class="fontsize12mb10px" class="text-center"><strong>9.AIDS deaths</strong></p>'+
								'<p class="fontsize12px"><strong>&nbsp;</strong></p>'+
								'<p class="fontsize12mb10px"><strong>&nbsp;</strong></p>'+
								'<p class="fontsize12px text-center"><span id="cascadeModalAIDSDeaths" class="badge numbersbadge">96,836,480</span></p>'+																
								'<p class="text-center fontsize12mb10px margintop18px"><strong>10.New</strong></p>'+
								'<p class="fontsize12px text-center"><strong>infections (15-49 years) per 1000 uninfected population</strong></p>'+
								'<p class="fontsize12px"><span id="cascadeModalInfections" class="badge numbersbadge">1000</span></p>'+
							'</div>'+				
						'</div>'+
			"</div>"+        
		  "</div>"+
		"</div>";
	
	return html;
};

durePopup.getDataForPopup = function(countryIso,countryId){

    var modalHtmlBody = '<div class="col-md-6"><div class="box box-widget widget-user-2"><div class="widget-user-header bg-aqua-active"><h3 class="widget-user-username">';
    var modalHeaderName = '';
    var impDataKeys = ['Department','emails','Institution','mobile','tels','webSite','firstName','city'];
    var prevCode = '';
    var firstNameCount = 0;
    var firstNameStr = '';
    modalHeaderName = dureUtil.getCountryNamefromIso(countryIso);
    $.each(contactData.data,function(code,contObj){
        
        $.each(contObj,function(key,val){

            if(contObj.country_ISO == countryIso){

                            
                if($.inArray(key,impDataKeys) > -1){
                   
                  if( val != null){ 
                      
                      if(key == 'firstName'){  
                          
                          if(firstNameCount > 0){
                              firstNameStr = '</ul></div></div></div><div class="col-md-6"><div class="box box-widget widget-user-2"><div class="widget-user-header bg-aqua-active"><h3 class="widget-user-username">';
                          }
                          modalHtmlBody += firstNameStr+contObj.firstName +' '+ contObj.familyName+'</h3><div class="pull-right box-tools">'+
                '<button type="button" class="btn btn-info emailBtn" data-widget="remove" data-toggle="tooltip" title="" data-original-title="Remove">'+
                  'Email</button></div> '+'</div><div class="box-footer no-padding"><ul class="nav nav-stacked">';
                          
                          firstNameCount++;
                      }else{    
					  
						if(key == 'emails'){
							
							modalHtmlBody +='<li data-email_attr="'+val+'"><a href="#">'+dureUtil.capitalizeFirstLetter(key)+'<span class="pull-right">'+
                            val+'</span></a></li>';    
						}else{
							
							modalHtmlBody +='<li ><a href="#">'+dureUtil.capitalizeFirstLetter(key)+'<span class="pull-right">'+
                            val+'</span></a></li>';    
						}
                          

                      }
                  }
                }          
                   
            }
            
        });   
    });

    
    modalHtmlBody += '</ul></div></div>';
	
	if(modalHtmlBody.search('<h3 class="widget-user-username"></ul>') > -1){
        modalHtmlBody = 'No contact data available';
    }
    
    $('#countryContactHeaderName').html(modalHeaderName+' Contact Info');
	if($('.questionBtn').length == 0){ 
	  $('#countryContactHeaderName').after('<div class="pull-right box-tools"><button type="button" class="btn btn-default questionBtn" data-widget="remove" data-toggle="tooltip" title="" data-original-title="Remove">Ask a Question?</button></div>');
	 }
 
    $('#countryContactSections').html(modalHtmlBody);
    $("#countryContactModal").modal({show: true});
	
	 $('.emailBtn,.questionBtn').click(function(){ 
	  if($(this).hasClass('questionBtn')){
		var emailObj = $('.emailBtn').parents('.widget-user-header').siblings().find('li[data-email_attr]');
		var emailIds = '';
		$.each(emailObj,function(index,htmlObj){
		 emailIds = emailIds+ $(htmlObj).attr('data-email_attr')+',';
		});
	  }else{
		var emailIds = $(this).parents('.widget-user-header').siblings().find('li[data-email_attr]').attr('data-email_attr');
	  }
	  emailIds = emailIds.replace(/,$/, "");
	  $("input[name='emailto']").val(emailIds);
	  $("input[name='emailto']").attr('disabled',true);
	  $("#emailContactModal").modal({show: true});
	 });
	
	$('#sendEmail').click(function(){	

		
		var name = $("input[name='name']").val();
		var toemail = $("input[name='emailto']" ).val();
		var fromemail = $("input[name='emailfrom']" ).val();
		var subject = $("input[name='subject']" ).val();
		var emailBody = $("textarea[name='emailBody']" ).val();

		$.ajax({
			type:'POST',
			url:'http://hivci.org/app/sendemail.php',
			dataType: 'json',
			data: {emailto:toemail,emailfrom:fromemail,name:name,subject:subject,emailBody:emailBody,countryId:countryId},
			success:function(resp){				
				//console.log(resp);
				if(resp.status == true){
					$("input[name='name']").val('');
					$("input[name='emailto']").val('');
					$("input[name='emailfrom']").val('');
					$("input[name='subject']").val('');
					$("input[name='emailBody']").val('');
					$("#emailContactModal").modal('hide');
					dureApp.showDialog(resp.message,'success');
				}
			}
		});	
	});
};

durePopup.getCountryIDFromISO = function (iso) {
	var id;
	$.each(countryIdMapping, function(ind, val) {
		
		if (ind == iso) {
			id = val.countryId;
			//break;
		}		
	});
    return id;
};

durePopup.getPolicyDataQuestions = function(countryId){
 var username = 'admin';
 var password = 'IHEALTH@9028';
  
 var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid=1&callback=durePopup.callback_PolicyData';
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
  username : username,
  password : password,
 });
 
};

durePopup.callback_PolicyData = function(resp){
	
		//console.log("Policy data --------{----------->");
		//console.log(resp);
		var countryIso = dureUtil.getIsoCode();
		var countryName = dureUtil.getCountryNamefromIso(countryIso);
		
		$('#policyHeaderName').html("Policy Questions - "+countryName);
		
		var policyTabHtml = '<div class="nav-tabs-custom"><ul class="nav nav-tabs" role="tablist">';
		 
		var questionGrps = resp.locationProfile.groups;
		var active = 1;
		var activeClass = '';
		
		$.each(questionGrps,function(index,groupObj){
			var flag = false;
			if(active == 1){
				activeClass = 'active';
				flag = true;
			}else{
				activeClass = '';
			}
			
			if(active < 5){

				
				policyTabHtml += '<li role="presentation" class="'+activeClass+'"><a href="#tabpane-'+groupObj.groupid+'" class="tablink" role="tab" data-toggle="tab" aria-controls="tabpane-'+groupObj.groupid+'">'+groupObj.groupname+'</a></li>'
				if(active == 4){
					
					policyTabHtml += '<li role="presentation" class="dropdown '+activeClass+'">'+
								'<a href="#" id="otherGroups" class="dropdown-toggle" aria-controls="otherGroups-contents"  data-toggle="dropdown">Other Groups<span class="caret"></span></a>'+
								'<ul class="dropdown-menu" aria-labelledby="otherGroups" id="otherGroups-contents">';					
				
				}				
				
			}else{

						policyTabHtml += '<li><a href="#tabpane-'+groupObj.groupid+'" class="tablink" role="tab" id="tabpanelink-'+groupObj.groupid+'" tabindex="-1"  data-toggle="tab" aria-controls="tabpane-'+groupObj.groupid+'">'+groupObj.groupname+'</a></li>';
						
			}

			active++;			
		});
		
		policyTabHtml += '</ul></li>';
		policyTabHtml += '</ul>';
						
		policyTabHtml += '<div class="row" style="margin-top:10px; margin-right:0px;"><div class="col-md-3 pull-right"><select class="form-control yearFilter" >'; 							
		policyTabHtml += '<option> Select year </option>';		
		policyTabHtml += '</select>';
		policyTabHtml += '</div>';	
		policyTabHtml += '<div class="col-md-3 pull-right"><select class="form-control subGroupFilter" style="display:none">'; 							
		policyTabHtml += '<option> Select Sub Group </option>';		
		policyTabHtml += '</select>';
		policyTabHtml += '</div></div>';
				

		policyTabHtml += '<div class="tab-content">';
		
		var tabCount = 1;
		var tabActive = '';
		
		$.each(questionGrps,function(index,groupObj){		

			$.each(groupObj.data,function(subGrpIndex,subGrpObj){			
			
					$.each(subGrpObj.year,function(yearIndex,yearObj){					
				
						$.each(yearObj,function(year,quesArr){
							
							if(tabCount == 1){
								tabActive = 'active';
							}else{
								tabActive = '';
							}
							
							policyTabHtml += '<div role="tabpanel" aria-labelledby = "tabpanelink-'+groupObj.groupid+'" class="tab-pane policyTabPanel '+tabActive+'" id="tabpane-'+groupObj.groupid+'" data-tabpane ="tabpane-'+groupObj.groupid+'-'+subGrpObj.subgroupid+'" >';

							policyTabHtml += '<div class="box-group" id="accordion">';

							$.each(quesArr ,function(indexQues,quesObj){
								
								var firstAccIn = "";
								var className = "collapsed";
								var flag = false;
								if(indexQues == 0){
									//console.log("Inside if ----->")
									firstAccIn = "in";
									className = ""
									flag = true;
								}
								policyTabHtml += '<div class="panel box box-primary">';
								policyTabHtml += '<div class="with-border"><!--Start of Question -->';
								policyTabHtml += '<h4 class="box-title"><a data-toggle="collapse" data-parent="#accordion" href="#collapse'+groupObj.groupid+indexQues+'" aria-expanded="'+flag+'" class="'+className+'">'+quesObj.question+'</a></h4>';
								policyTabHtml += '</div> <!--End of Question -->';
								policyTabHtml += '<div id="collapse'+groupObj.groupid+indexQues+'" class="panel-collapse collapse '+firstAccIn+'" aria-expanded="'+flag+'"> <!--Start of Question -->';
								$.each(quesObj.subquestion,function(subQueIndex,subQueObj){
									
									policyTabHtml += '<label for="">'+subQueObj.subquestion+'</label>';
									policyTabHtml += '<div class="form-group" style="overflow:hidden">';
									
									var cols = 3;	
									if(subQueObj.valuetype.length%3 == 0 || subQueObj.valuetype.length%3 == 1){
										
										cols = 3;
									}else{
										
										cols = 6;								
									}
									
									if(subQueObj.valuetype[0] == 'table'){
										policyTabHtml += '<div class="col-md-4">'+subQueObj.subquestion+'</div>';
										policyTabHtml += '<div class="col-md-4"><input type="text"/></div>';
										policyTabHtml += '<div class="col-md-4"><input type="text"/></div>';	
										
									}else if(subQueObj.valuetype[0] == 'drop down'){
										
										policyTabHtml += '<div class="col-md-6">';
										policyTabHtml += '<select class="form-control">';	
										for(var i=0;i < subQueObj.valuetype.length;i++){									
															
											policyTabHtml += '<option value="'+subQueObj.optionsetmember[i]+'"> ' + subQueObj.optionvalue[i]+"</option>";	
										}
										policyTabHtml += '</select>';
										policyTabHtml += '</div>';
										
									}else if(subQueObj.valuetype[0] == 'checkbox'){
										for(var i=0;i < subQueObj.valuetype.length;i++){
											
											policyTabHtml += '<div class="col-md-12" >';														
											policyTabHtml += '<input name="'+countryName+'['+groupObj.groupid+']['+subQueObj.subquestionid+']" type="'+subQueObj.valuetype[i]+'" value="'+subQueObj.optionsetmember[i]+'"/> ' + subQueObj.optionvalue[i];								
											policyTabHtml += '</div>';
										}
									
									}else{
										
										for(var i=0;i < subQueObj.valuetype.length;i++){
											
											policyTabHtml += '<div class="col-md-'+cols+'" >';														
											policyTabHtml += '<input name="'+countryName+'['+groupObj.groupid+']['+subQueObj.subquestionid+']" type="'+subQueObj.valuetype[i]+'" value="'+subQueObj.optionsetmember[i]+'"/> ' + subQueObj.optionvalue[i];								
											policyTabHtml += '</div>';
										}								
										
									}
									

									
									policyTabHtml += '</div>';
								});
								
								policyTabHtml += '</div></div>';
							});
							
							policyTabHtml += '</div><!-- End of Accordian -->';	
							policyTabHtml += '</div>';	
							tabCount++;					

						});	
										
					});			

			});			
		});		
		
		policyTabHtml += '</div>';  // Closing of tabContent.
		policyTabHtml += '</div>'; // Closing of class="nav-tabs-custom".
		
		$(document).on('click','.tablink',function(){
			
			var subGrpOpt = '';
			var grpIdText = $(this).attr('href');
			var grpId = parseInt(grpIdText.split('-').pop());
			
			var yearOpt = '<option> Select Year </option>';
						
			$.each(questionGrps,function(index,groupObj){
				
				if(groupObj.data.length > 1 && grpId == groupObj.groupid){
					
					$.each(groupObj.data,function(subGrpIndex,subGrpObject){
					
						subGrpOpt += '<option value="tabpane-'+grpId+'-'+subGrpObject.subgroupid+'" data-grpVal="'+grpId+'">'+subGrpObject.subgroupname+'</option>'
					
					
					});										
				}
				
				
				
				$.each(groupObj.data,function(subGrpIndex,subGrpObject){					
					$.each(subGrpObject.year,function(yearIndex,yearObj){
						
						if(grpId == groupObj.groupid && grpId != 2){
						
							$.each(yearObj,function(year,quesArray){	
							
								yearOpt += '<option value="tabpane-'+grpId+'-'+subGrpObject.subgroupid+'" data-grpVal="'+grpId+'">'+year+'</option>'
							});
						}
					});				
				});	
				
				
				
			});	
			
			if(yearOpt != ''){
				
				$('.yearFilter').html(yearOpt);	
			}
			
			if(subGrpOpt != ''){
				
				$('.subGroupFilter').append(subGrpOpt);	
				$('.subGroupFilter').show();
			}else{
				
				$('.subGroupFilter').html('<option> Select Sub Group </option>');	
				$('.subGroupFilter').hide();
			}
			
		});

		$(document).on('change','.subGroupFilter',function(){
			
			var grpFilterVal = $(this).val();	
			$('.policyTabPanel').removeClass('active');	
			$('[data-tabpane="'+grpFilterVal+'"]').addClass('active');	
		});
		
		// $(document).on('change','.yearFilter',function(){
			
			// var grpFilterVal = $(this).val();	
			// $('.policyTabPanel').removeClass('active');	
			// $('[data-tabpane="'+grpFilterVal+'"]').addClass('active');	
		// });
		
		$('#policySections').html(policyTabHtml);
		$("#policyModal").modal({show: true});						
	
};
