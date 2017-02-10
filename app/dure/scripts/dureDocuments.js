
dureDocuments.initialize = function() {

	dureDocuments.countryName;
	dureDocuments.countryISOCode;
	dureDocuments.countryISO2Code;
	dureDocuments.geoJson = {};
	dureDocuments.regionCode = null;
	dureDocuments.regionTitle = null;
	dureDocuments.countriesFromSelectedRegion = {};
	dureDocuments.whoRegionData = null;
	dureDocuments.countryList = [];

	dureDocuments.appId = 62;
	dureDocuments.langId = 1;
	dureDocuments.levelid = 2;
	dureDocuments.userid = '';
	dureDocuments.sectionId = '';
	dureDocuments.sectionType = '';
	dureDocuments.folderName = '';
	dureDocuments.folderValue = 2;
	dureDocuments.AppBaseURLContext = dureConfig.AppBaseURLContext;
	
	dureComUtil.collapsibleButtonForPanel();
	dureDocuments.getDocumentsData();
	
	dureDocuments.createFolder();
	
}

// Displays dialog box to show message 
dureDocuments.showDialog = function(message,type){
	
	if(type == 'info'){		
		jNotify(message,{TimeShown:3000});
	}else if(type == 'error'){
		jError(message,{TimeShown:3000});
	}else if(type == 'success'){
		jSuccess(message,{TimeShown:3000});
	}
};

/**************************************************** WHO get documents list functionality ************************************************/

dureDocuments.getDocumentsData = function() {

	var countryId = dureComUtil.getCountryId();
	var username = 'admin';
	var password = 'IHEALTH@9028';
	
	var queryString = 'appid='+dureDocuments.appId+'&langid='+dureDocuments.langId+'&locationid='+countryId+'&levelid='+dureDocuments.levelid+'&callback=dureDocuments.showDocumentsList';	
	
	var serviceUrl = dureDocuments.AppBaseURLContext + 'dataapi/target/all/dashBoardData/?'+queryString;
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

dureDocuments.showDocumentsList = function(resp) {

	console.log("============================== Documents data call back ================================");
	//console.log(resp);
	
	var navLinks = '';
	
	var currentUrl = window.location.href;
	var lastSegment = currentUrl.split('/').pop();
	var filename = (lastSegment.indexOf('?')  > -1) ? lastSegment.substr(0,lastSegment.indexOf('?')) : lastSegment;
	
	dureDocuments.sectionArr = resp.locationProfile.sections;
	
	// Fetching document section and storing to global variable.
	$.each(dureDocuments.sectionArr,function(sectionIndex,sectionObj){
		
		if(sectionObj.sectionType == 'document'){
			
			dureDocuments.documentArr = sectionObj.data;
			
		}
	});
	
	if(dureUser.checkUserLoginStatus() == true){
		
		// var queryStr = location.search
		// navLinks += '<a href="/who/app/upload_docs.html'+queryStr+'" id="uploadFile" class="btn btn-default" title="Upload Document" style="margin-top: 6px; margin-right: 5px; float: right;">'+
						// '<i class="fa fa-upload"></i>'+
					// '</a>';		
		navLinks += '<a href="javascript:void(0)" id="uploadFile" class="btn btn-default" title="Upload Document" style="margin-top: 6px; margin-right: 5px; float: right;">'+
						'<i class="fa fa-upload"></i>'+
					'</a>';
			
			navLinks += '<a href="javascript:void(0)" id="deleteFile" class="btn btn-default" title="Delete Document" style="margin-top: 6px; margin-right: 5px; float: right;">'+
							'<i class="fa fa-times"></i>'+
						'</a>';
		$('#login').after(navLinks);
		dureDocuments.uploadFragmentLoad();
		
	}else{
		
		$('#uploadFile').remove();
		$('#deleteFile').remove();
	}
	

	if (resp.locationProfile.success == true && resp.locationProfile.locationname != undefined) {
		
	
		$('.region-error-info-box').hide();
		
		var documentList = resp.locationProfile.sections[2].data;		
		var sectionTabPane = '<div class="panel-group" id="accordion">';				
		var nestedLinksArray = {};
		var documentCatValue = {}
		$.each(documentList, function(k, v) {
		
			if(!nestedLinksArray.hasOwnProperty(v[2])) {
				nestedLinksArray[v[2]] = [];
				documentCatValue[v[2]] = v[3]
			}
			var labelLink = [];
			var labelHref = [];

			labelLink.push(v[0]);
			labelLink.push(v[1]);			
			nestedLinksArray[v[2]].push(labelLink);			
		});
					
		//console.log(nestedLinksArray);
		//console.log(documentCatValue);
		
		var menuNumber = 1;
		$.each(nestedLinksArray, function(ind, obj){
			

			// console.log(ind);
			//console.log(obj);
			
			if(filename == 'itp.html'){
				
				if(ind == 'ITP'){
				
					sectionTabPane += '<div class="panel-heading" data-toggle="collapse" data-parent="#accordion" href="#collapse'+ menuNumber +'">';				
					sectionTabPane += '<h4 class="panel-title">';
					sectionTabPane += '<i class="fa fa-plus"></i>&nbsp;&nbsp;<a>'+ ind +'</a>';
					sectionTabPane += '</h4>';
					sectionTabPane += '</div>';
					sectionTabPane += '<div id="collapse'+ menuNumber +'" class="panel-collapse collapse">';
					sectionTabPane += '<div class="panel-body">';
						
					$.each(obj, function(i, o) {
					
						var icon = dureDocuments.getIconFileType(o[1]);			
						sectionTabPane += '<i class="'+ icon +'"></i>&nbsp;&nbsp;<a class="docs-link" href="'+ o[1] +'" target="_blank">'+ o[0] +'</a><br>';
					
					});	
					
					sectionTabPane += '</div>';
					sectionTabPane += '</div>';
							
					menuNumber++;
				}
				
			}else{
				
				if(documentCatValue[ind] != 0 && ind != 'Global ITP' && ind != 'ITP'){
					
					sectionTabPane += '<div class="panel-heading" data-toggle="collapse" data-parent="#accordion" href="#collapse'+ menuNumber +'">';				
					sectionTabPane += '<h4 class="panel-title">';
					sectionTabPane += '<i class="fa fa-plus"></i>&nbsp;&nbsp;<a>'+ ind +'</a>';
					sectionTabPane += '</h4>';
					sectionTabPane += '</div>';
					sectionTabPane += '<div id="collapse'+ menuNumber +'" class="panel-collapse collapse">';
					sectionTabPane += '<div class="panel-body">';
						
					$.each(obj, function(i, o) {
					
						var icon = dureDocuments.getIconFileType(o[1]);			
						sectionTabPane += '<i class="'+ icon +'"></i>&nbsp;&nbsp;<a class="docs-link" href="'+ o[1] +'" target="_blank">'+ o[0] +'</a><br>';
					
					});	
					
					sectionTabPane += '</div>';
					sectionTabPane += '</div>';
							
					menuNumber++;				
					
				}
		
				
			}						
		});
			
		sectionTabPane += '</div>';
		$('#documents-list').html(sectionTabPane);
		
		var sectionTabPaneGlobal = '<div class="panel-group" id="accordion">';
		
		$.each(nestedLinksArray, function(ind, obj){
			

			//console.log(ind);
			//console.log(obj);
			
			if(filename == 'itp.html'){
				
				if(documentCatValue[ind] == 0 &&  ind == 'Global ITP'){
				
					sectionTabPaneGlobal += '<div class="panel-heading" data-toggle="collapse" data-parent="#accordion" href="#collapse'+ menuNumber +'">';				
					sectionTabPaneGlobal += '<h4 class="panel-title">';
					sectionTabPaneGlobal += '<i class="fa fa-plus"></i>&nbsp;&nbsp;<a>'+ ind +'</a>';
					sectionTabPaneGlobal += '</h4>';
					sectionTabPaneGlobal += '</div>';
					sectionTabPaneGlobal += '<div id="collapse'+ menuNumber +'" class="panel-collapse collapse">';
					sectionTabPaneGlobal += '<div class="panel-body">';
						
					$.each(obj, function(i, o) {
					
						var icon = dureDocuments.getIconFileType(o[1]);			
						sectionTabPaneGlobal += '<i class="'+ icon +'"></i>&nbsp;&nbsp;<a class="docs-link" href="'+ o[1] +'" target="_blank">'+ o[0] +'</a><br>';
					
					});	
					
					sectionTabPaneGlobal += '</div>';
					sectionTabPaneGlobal += '</div>';
							
					menuNumber++;
				}
				
			}else{
				
				if(documentCatValue[ind] == 0 && ind != 'Global ITP'){
					
					sectionTabPaneGlobal += '<div class="panel-heading" data-toggle="collapse" data-parent="#accordion" href="#collapse'+ menuNumber +'">';				
					sectionTabPaneGlobal += '<h4 class="panel-title">';
					sectionTabPaneGlobal += '<i class="fa fa-plus"></i>&nbsp;&nbsp;<a>'+ ind +'</a>';
					sectionTabPaneGlobal += '</h4>';
					sectionTabPaneGlobal += '</div>';
					sectionTabPaneGlobal += '<div id="collapse'+ menuNumber +'" class="panel-collapse collapse">';
					sectionTabPaneGlobal += '<div class="panel-body">';
						
					$.each(obj, function(i, o) {
					
						var icon = dureDocuments.getIconFileType(o[1]);			
						sectionTabPaneGlobal += '<i class="'+ icon +'"></i>&nbsp;&nbsp;<a class="docs-link" href="'+ o[1] +'" target="_blank">'+ o[0] +'</a><br>';
					
					});	
					
					sectionTabPaneGlobal += '</div>';
					sectionTabPaneGlobal += '</div>';
							
					menuNumber++;				
					
				}
		
				
			}						
		});
		
		sectionTabPaneGlobal += '</div>';
		$('#global-documents-list').html(sectionTabPaneGlobal);
		
	} else {
		$('.region-title-box').hide();
		$('.region-error-info-box').show();
		
		dureDocuments.showDialog('Data not available.','error');
	}

	// dureComUtil.collapsibleButtonForPanel();	
};

dureDocuments.getIconFileType = function(fileUrl) {
	
	var str = fileUrl;
	var result = str.replace(/\.([^.]+)$/, ':$1').split(':');
	//console.log(result);
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

/**************************************************** WHO Country list functionality ************************************************/

dureDocuments.getCountryIDFromISO = function (iso) {
	var id;
	$.each(countryIdMapping, function(ind, val) {
		
		if (ind == iso) {
			id = val.countryId;
			//break;
		}		
	});
    return id;
};

dureDocuments.getCountryIsoFromID = function (id) {
	var isocode;
	for (var iso in countryIdMapping) {
		
		if (countryIdMapping[iso].countryId == id) {
			isocode = iso;
			break;
		}		
	}
    return isocode;
};

dureDocuments.uploadFragmentLoad = function(){
	
	
	var segmentPart = location.pathname.substr(0,location.pathname.search("app"));
	
	$("#uploadFile").click(function(){
		
		console.log("Before loading -----");
		if($('.uploadFragment').hasClass('docsFragment')){
			
			$(".uploadFragment").load(segmentPart+"app/upload_docs.html");
		}else{
			
			$(".uploadFragment").load(segmentPart+"app/upload_itp.html");
		}		
	});
	
	$("#deleteFile").click(function(){
		
		console.log("Before loading -----");
		if($('.uploadFragment').hasClass('docsFragment')){
			
			$(".uploadFragment").load(segmentPart+"app/delete_docs.html");
		}else{
			
			$(".uploadFragment").load(segmentPart+"app/delete_itp.html");
		}		
	});
	
}

dureDocuments.createFolder = function(){
	
	var countryId = dureComUtil.getCountryId();
	console.log("Country ID");
	//console.log(countryId);
	$(document).on("click",".folderCreation",function(){
		
		$("#folderCreation").modal('show');
	});
	
	$(".folder_cat").on('change',function(){
		
		console.log("Folder cat -------> ");
		var folder_cat_val = $.trim($('.folder_cat').val());
		
		if(folder_cat_val == 'global'){
			
			$(".currentCountry").hide();
			countryId = 0;
			dureDocuments.folderValue = 0;
			
		}else{
			
			$(".currentCountry").show();
			countryId = parseInt(dureComUtil.countryID);
			dureDocuments.folderValue = 2;
		}
	});	
	
	$("#folderNameSubmit").click(function(){	
		console.log("Country ID");
		 //console.log(countryId);
		var folder_name = $("input[name=folderName]").val();
		var folder_cat = $(".folder_cat").val();	
		
		
		var segmentPart = location.pathname.substr(0,location.pathname.search("app")); 
		var uploadPath = location.origin+segmentPart+'/docs/'+folder_name;
		var folderCreateServiceUrl = location.origin+segmentPart+'/app/folder_creation.php';
		
		var folderCreateJson = {};		
		folderCreateJson.documentdata = [];
		
		var responseJson = {};
		var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/uploadDocument';		
		
		responseJson["locationid"] = countryId;
		responseJson["document_type"] = folder_name;
		responseJson["document_name"] = "";
		responseJson["document_path"] = uploadPath;
		//console.log(responseJson)				
		folderCreateJson.documentdata.push(responseJson);
		
		dureDocuments.folderName = folder_name;
		if(folder_cat == 'country'){
			
			dureService.addFileInfo(serviceUrl,JSON.stringify(folderCreateJson),dureDocuments.callback_FolderCreate);
			
		}else{
			
			$.ajax({
			 
			  type:'POST',
			  url:folderCreateServiceUrl,
			  data: {folderName:folder_name},
			  dataType:"json",
			  success:function(resp){
				  
					  if(resp.success == true){

							dureService.addFileInfo(serviceUrl,JSON.stringify(folderCreateJson),dureDocuments.callback_FolderCreate);		
					  }
			  }
				 
			});
		}
		
	});
}

dureDocuments.callback_FolderCreate = function(resp){
	
	$("#folderCreation").modal('hide')	
	$('.file_cat').append("<option value="+dureDocuments.folderValue+">"+dureDocuments.folderName+"</option>");
	swal("Folder Created","Your folder has been created successfully.","success");
	
};