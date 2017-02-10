var dureDashboard = {};

dureDashboard.initialize = function() {

	 dureDashboard.appId = 62;
	 dureDashboard.langId = 1;
	 dureDashboard.levelid = 2;
	 dureDashboard.geoJson = {};
	 dureDashboard.countryList = [];
	 dureDashboard.userid = '';
	 dureDashboard.sectionId = '';
	 dureDashboard.sectionType = '';
	 dureDashboard.whoRegionData = null;
	 dureDashboard.AppBaseURLContext = dureConfig.AppBaseURLContext;
	 
	 dureDashboard.getData(); //Get dashboard data
	 
	 dureDashboard.printingContainer = $('.dashboardExportable'),
	 dureDashboard.cache_width = dureDashboard.printingContainer.width(),
	 //dureDashboard.a4 = [ 595.28,  841.89];  // for a4 size paper width and height
	 //dureDashboard.a1 = [1683.78, 2383.94];  // for a1 size paper width and height
	 dureDashboard.a3 = [841.89, 1190.55];  // for a3 size paper width and height
	 //dureDashboard.a0 = [2383.94, 3370.39];  // for a0 size paper width and height
	 //dureDashboard.a2 = [1190.55, 1683.78];  // for a0 size paper width and height
}

dureDashboard.getData = function() {
	
	var countryId = dureComUtil.getCountryId();
	var username = 'admin';
	var password = 'IHEALTH@9028';
	
	var queryString = 'appid='+dureDashboard.appId+'&langid='+dureDashboard.langId+'&locationid='+countryId+'&levelid='+dureDashboard.levelid+'&callback=dureDashboard.show';	
	
	var serviceUrl = dureDashboard.AppBaseURLContext + 'dataapi/target/countryprofile/dashBoardData/?'+queryString;
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
			//console.log(request.responseText);
			//console.log(textStatus);
			//console.log(errorThrown);
		}
	});
};

dureDashboard.show = function(resp) {

	console.log("============================== Dashboard data call back ================================");
	//console.log(resp);
	
	if (resp.locationProfile.success == true && resp.locationProfile.locationname != undefined) {
		
		var dashboardData = dureDashboard.getCountrySnapshot(resp.locationProfile.sections);		
		var dashboardTextData = dureDashboard.getDashboardTextData(resp.locationProfile.sections);

                var dashboardCasading = dureDashboard.getCasading(resp.locationProfile.sections);
                
                dureDashboard.createTextSections(dashboardTextData);
                
		if(dashboardCasading[0] == null || dashboardCasading[0] == -1){
			
			 $('#cascadeModalInfections').html('');		}
		else{
			 
			 $('#cascadeModalInfections').html(dureComUtil.numberWithSpace(dashboardCasading[0]))			
		}
		
		$.each(dashboardData, function(ind, val) {
		
			//console.log(ind);
			//console.log(val);

			$('#dashboard-label-'+ ind).html(val[2]);
			$('#dashboard-val-'+ ind).html(dureComUtil.numberWithSpace(val[0]));
		
			if (val[2] == "PLHIV") {
				var plhivVal = val[0] == 'N/A' ? '' : dureComUtil.numberWithSpace(val[0]);				
				$('#cascadeModalPLHIV').html(plhivVal);
				
			} else if (val[2] == "People ON ART") {
				
				var artVal = val[0] == 'N/A' ? '' : dureComUtil.numberWithSpace(val[0]);				
				$('#cascadeModalCurrentlyOnART').html(artVal);			
				
			} else if (val[2] == "HIV Related Deaths") {
			
				var deathsVal = val[0] == 'N/A' ? '' : dureComUtil.numberWithSpace(val[0]);				
				$('#cascadeModalAIDSDeaths').html(deathsVal);
			}
		});

		/*$('#cascadeModalDomesticViolence').text('N/A');
		$('#cascadeModalPreventionByKeyPopulation').text('N/A');
		$('#cascadeModalKnowing').text('N/A');
		$('#cascadeModalLinkageToCare').text('N/A');
		$('#cascadeModalArtRetention').text('N/A');
		$('#cascadeModalViralSuppression').text('N/A');
		$('#cascadeModalInfections').text('N/A');*/
		$('#cascadeModalDomesticViolence').text('');
		$('#cascadeModalPreventionByKeyPopulation').text('');
		$('#cascadeModalKnowing').text('');
		$('#cascadeModalLinkageToCare').text('');
		$('#cascadeModalArtRetention').text('');
		$('#cascadeModalViralSuppression').text('');
		//$('#cascadeModalInfections').text('');
		
	} else {
		dureDashboard.showDialog('Data not available.','error');
	}
};

dureDashboard.getCountrySnapshot = function (sections) {
	
	var sectionData;
	
	$.each(sections, function(ind, val) {
		
		if (val.sectionType == "document" && val.sectionid == 3) {
			sectionData = val.data;
		}
	});
	return sectionData;
};

dureDashboard.getCasading = function (sections) {
 
	 var sectionData;
	 
	 $.each(sections, function(ind, val) {
	  //console.log(val);
	  if (val.sectionType == "indicatorData" && val.sectionid == 1 ) {

	   //sectionData = val.data;
	   sectionData = val[val.sectionname][5].data[2014];
	   //console.log(val.data);
	  }
	 });
	 return sectionData;
};

dureDashboard.getDashboardTextData = function (sections) {
	
	var sectionData = [];
	
	$.each(sections, function(ind, val) {
		
		if (val.sectionType == "text") {
			sectionData.push(val);
		}
	});
	return sectionData;
};

// Displays dialog box to show message 
dureDashboard.showDialog = function(message,type){
	
	if(type == 'info'){		
		jNotify(message,{TimeShown:5000});
	}else if(type == 'error'){
		jError(message,{TimeShown:5000});
	}else if(type == 'success'){
		jSuccess(message,{TimeShown:5000});
	}
};

// Create country profile text sections 
dureDashboard.getTextSectionsData = function(countryISOCode) {
	
	$.getJSON('tempdata/country_profile/'+countryISOCode+'.json', function(result) {
		//dureDashboard.textSections = result;
		//console.log(dureDashboard.textSections);
		//dureDashboard.createTextSections(result);

	}).error(function(jqXHR, textStatus, errorThrown) {
	
		if(jqXHR.status == 404){			
			//dureDashboard.showDialog('JSON not available.','error');
		}
		
		//PRINT All WEBPAGE 
		$('.exportWholeWebpage').on('click',function() {			
			dureDashboard.exportNewPDF();
		});
		
		//PRINT INDIVIDUAL SECTION 
		$('.printPDFSection').on('click',function() {

			//console.log($(this).parent('.pdfSection').html());
			//console.log($(this).closest('.pdfSection').html());
			var sectionHTML = $(this).closest('.pdfSection');
			
			//console.log(sectionHTML);
		
			var doc = new jsPDF({
				  unit:'pt',
				  format:'a3'
				}),
				img1;
			
			dureDashboard.getNewCanvas(sectionHTML).then(function(canvas) {
				
				//console.log(canvas);
				img1 = canvas.toDataURL("image/png");	
				doc.addImage(img1, 'PNG', 10, 10);
				doc.save('WHO-Country-Profile-Section.pdf');
			});
			
			dureDashboard.printingContainer.width(dureDashboard.cache_width);
		});		
	});	
};

// Get country profile text sections 
dureDashboard.createTextSections = function(textSectionData) {
	
	//console.log(textSectionData);
	var userData = JSON.parse(localStorage.getItem("userJson"));
	var countryId = dureComUtil.getCountryId();
	
	if (textSectionData != undefined) {
		
		var availableSections = [];
		var textMainSection = '';
		
		$.each(textSectionData, function(ind, val) {

			//console.log($.isArray(val.subSectionText));
			//console.log(val.subSectionText);
			
			//if (val.sectionType == "text" && val.data[0].Publish[0] != "") {
				
			// To hide SECTION: WHO CONTACTS added extra AND CONDn. 
			if (val.sectionType == "text" && val.sectionname != "WHO CONTACTS") {

				textMainSection += '<div id="pdfSection-'+ind+'" class="row pdfSection">';
				textMainSection += '<div class="col-md-12">';
				textMainSection += '<div class="box box-solid box-primary">';
				textMainSection += '<div class="box-header">';
				textMainSection += '<h3 class="box-title"><i class="fa fa-file-text"></i> '+val.sectionname+'</h3>';
				textMainSection += '<div class="box-tools pull-right">';
				
				//if (userData != undefined && (userData.roleid == 5 || userData.roleid == 6)) {
				if (userData != undefined && (userData.roles[0] == 5 || userData.roles[0] == 6 || userData.roles[0] == 7)) {
					textMainSection += '<button class="btn btn-primary btn-sm editTextSection"><i class="fa fa-pencil-square-o"></i></button>';	
				}				
				
				textMainSection += '<button class="btn btn-primary btn-sm printPDFSection"><i class="fa fa-file-pdf-o"></i></button>';
				//textMainSection += '<button class="btn btn-primary btn-sm" data-widget="collapse"><i class="fa fa-plus"></i></button>';
				
				textMainSection += '</div></div>';
				textMainSection += '<div class="box-body" style="padding:15px;" section-id="'+val.sectionid+'" section-type="'+val.sectionType+'">';
				textMainSection += '<div class="media">';
				
				if ($.isArray(val.data) == true && val.data.length > 0) {
					
					textMainSection += '<div class="media-body">';
					textMainSection += '<p>'+ val.data[0].Publish[0] +'</p>';
					textMainSection += '</div>';
				} else {
					textMainSection += '<div class="media-body">';
					textMainSection += val.subSectionText;
					textMainSection += '</div>';
				}
				textMainSection += '</div><hr></div></div></div></div>';
				
				availableSections.push(ind);
			}
		});
		
		$('#country-profile-text-section').html(textMainSection);	

		//PRINT All WEBPAGE 
		$('.exportWholeWebpage').on('click',function() {
			
			//console.log(availableSections);
			dureDashboard.exportNewPDF(availableSections);
		});
		
		//PRINT INDIVIDUAL SECTION 
		$('.printPDFSection').on('click',function() {

			//console.log($(this).parent('.pdfSection').html());
			//console.log($(this).closest('.pdfSection').html());
			var sectionHTML = $(this).closest('.pdfSection');
			
			//console.log(sectionHTML);
		
			var doc = new jsPDF({
				  unit:'pt',
				  format:'a3'
				}),
				img1;
			
			dureDashboard.getNewCanvas(sectionHTML).then(function(canvas) {
				
				//console.log(canvas);
				img1 = canvas.toDataURL("image/png");	
				doc.addImage(img1, 'PNG', 10, 10);
				doc.save('WHO-Country-Profile-Section.pdf');
			});
			
			dureDashboard.printingContainer.width(dureDashboard.cache_width);
		});
		
		CKEDITOR.replace('textSectionEditor',{
			 height: 380
		});		
		
		$('.editTextSection').on('click',function() {
			
			var thisSectionTextValue = $(this).closest('.box-header').siblings('.box-body').find('.media-body').html();
			dureDashboard.sectionId = $(this).closest('.box-header').siblings('.box-body').attr('section-id');
			dureDashboard.sectionType = $(this).closest('.box-header').siblings('.box-body').attr('section-type');
			
			//console.log($(this).closest('.box-header').siblings('.box-body').find('.media-body').html());			
			
			//$('#textSectionEditor').html(thisSectionTextValue);
			CKEDITOR.instances['textSectionEditor'].setData(thisSectionTextValue);
			
			$("#countryProfileEditTextModal").modal({show: true});						
		});
		
		$('#update-country-text').on('click',function() {
			
			var editorValue = CKEDITOR.instances['textSectionEditor'].getData();
			var userData = JSON.parse(localStorage.getItem("userJson"));
			var responseJson = {};
			
			if (userData != undefined) {
				
				console.log(editorValue);
			
				responseJson['appid'] = dureDashboard.appId;
				responseJson['userid'] = userData.userid;
				responseJson['locationid'] = countryId;
				responseJson['levelid'] = dureDashboard.levelid;
				responseJson['sectionid'] = dureDashboard.sectionId;
				responseJson['sectiontype'] = dureDashboard.sectionType;
				responseJson['value'] = editorValue;
				
				var serviceUrl = dureDashboard.AppBaseURLContext+'dataapi/target/countryprofile/updatetextdata';

				//console.log(serviceUrl);				
				//console.log(JSON.stringify(responseJson));
				
				$.ajax({
					type:'POST',
					url:serviceUrl,
					data: JSON.stringify(responseJson),
					contentType: 'application/json',
					success:function(resp){								   
						console.log(resp);	
						//$("#countryProfileEditTextModal").modal('hide');
						location.reload(true);						
					},
					error:function(e){
						console.log(resp);
					}
				});
				
			}
		});
	}
};

//create pdf
dureDashboard.exportNewPDF = function(availableSections) {
	
	var doc = new jsPDF({
		  unit:'pt',
		  format:'a3'
		}),
		img1;	
	
	dureDashboard.getNewCanvas($(".content-header").append($("#country-profile-graphics-section"))).then(function(canvas) {
		
		//console.log(availableSections);
		//console.log(canvas);
		
		img1 = canvas.toDataURL("image/jpeg", 1.0);		
		doc.addImage(img1, 'JPEG', 10, 10);
	
		//for (i = 0; i < availableSections.length; i++) {
		if (availableSections.length > 0) {
			var counter = 0;
			var interValDataURL = setInterval( function() {
				
				if(counter == availableSections.length - 1) clearInterval(interValDataURL);
					
				var img2;
				
				$('#pdfSection-'+availableSections[counter]).css('background-color', '#fff');
				
				dureDashboard.getNewCanvas($('#pdfSection-'+availableSections[counter])).then(function(canvas) {
				
					//console.log(canvas);
					
					if (canvas != '') {
						//canvas.fillStyle = 'white';
						img2 = canvas.toDataURL("image/jpeg", 0.8);
						//img2 = canvasToImage(canvas, 'white');
						doc.addPage('a3');
						doc.addImage(img2, 'PNG', 10, 10);					
					}
				});
				$('#pdfSection-'+availableSections[counter]).css("background-color", ""); 
				counter++;
			}, 1000);
		
			setTimeout(function(){ doc.save('WHO-Country-Profile.pdf'); dureDashboard.printingContainer.width(dureDashboard.cache_width);}, 15000);
		} else {			
			dureDashboard.printingContainer.width(dureDashboard.cache_width);
			doc.save('WHO-Country-Profile.pdf'); 
		}

		//}
		
	});
	
	function canvasToImage(canvas, backgroundColor)
	{
		//cache height and width        
		var w = canvas.width;
		var h = canvas.height;

		var data;       

		if(backgroundColor)
		{
			//get the current ImageData for the canvas.
			data = context.getImageData(0, 0, w, h);

			//store the current globalCompositeOperation
			var compositeOperation = context.globalCompositeOperation;

			//set to draw behind current content
			context.globalCompositeOperation = "destination-over";

			//set background color
			context.fillStyle = backgroundColor;

			//draw background / rect on entire canvas
			context.fillRect(0,0,w,h);
		}

		//get the image data from the canvas
		var imageData = canvas.toDataURL("image/jpeg", 1.0);

		if(backgroundColor)
		{
			//clear the canvas
			context.clearRect (0,0,w,h);

			//restore it with original / cached ImageData
			context.putImageData(data, 0,0);        

			//reset the globalCompositeOperation to what it was
			context.globalCompositeOperation = compositeOperation;
		}

		//return the Base64 encoded data url string
		return imageData;
	}
	
/* 	$.each(availableSections, function(key, obj) {
		
		console.log(key+' - '+obj);
		
		var img2;
		dureDashboard.getNewCanvas($('#pdfSection-'+obj)).then(function(canvas){
			
			//console.log(canvas);

			img2 = canvas.toDataURL("image/png");
			doc.addPage('a3');
			doc.addImage(img2, 'PNG', 10, 10);
		});
		
		if (i == ) {
			
		}
	}); */

	//doc.save('WHO-Country-Profile.pdf');
	//dureDashboard.printingContainer.width(dureDashboard.cache_width);
}

// create canvas object
dureDashboard.getNewCanvas = function(htmlToCanvas) {
	dureDashboard.printingContainer.width((dureDashboard.a3[0]*1.33333) -80).css('max-width','none');
	
	//var ctx = htmlToCanvas.getContext('2d');
	//ctx.fillStyle = '#FFFFFF';                              // main background set color to white
	//ctx.fillRect(0, 0, htmlToCanvas.width, htmlToCanvas.height);
	
	return html2canvas(htmlToCanvas,{
		imageTimeout:800,
		removeContainer:true
	});
}	