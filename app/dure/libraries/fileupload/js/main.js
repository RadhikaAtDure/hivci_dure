/*
 * jQuery File Upload Plugin JS Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global $, window */

// $(function () {
    // 'use strict';

var dureFile = {};

dureFile.initialize = function(){
	
	if(!$(".file_cat").hasClass('itp')){
		
		var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/getDocumentType?callback=dureFile.callback_GetFileTypes';
		console.log(serviceUrl);
		var filetypes = dureService.getFileTypes(serviceUrl);		
	}	
	dureFile.upload();		
}

dureFile.upload = function(){
	
	var countryId = dureComUtil.countryID;
	var uploadUrl = dureFile.uploadPathSegment();
	var countryName = dureComUtil.countryName;	
	var file_cat_type = $.trim($('.file_cat option:selected').text());
	
	// Change file category.
	$(".file_cat").on('change',function(){
		
		file_cat_type = $.trim($('.file_cat').val());
		
		if(file_cat_type == 0){
			
			console.log("<-------- GLOBALLLL ------>")
			$(".currentCountry").hide();
			countryId = 0;
			file_cat_type = countryName = $.trim($('.file_cat option:selected').text());
			 
			
		}else if(file_cat_type == 'Global ITP'){
			
			console.log("ITP GLOBALLLL ------>")
			$(".currentCountry").hide();
			countryId = 0;
			file_cat_type = countryName = $.trim(file_cat_type);
			
		}
		else{
			
			$(".currentCountry").show();
			countryId = dureComUtil.countryID;
			countryName = dureComUtil.countryName;
			file_cat_type = $.trim($('.file_cat option:selected').text());
		}
	});	
	
    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload({
        // Uncomment the following to send cross-domain cookies:
        //xhrFields: {withCredentials: true},	
        url: uploadUrl,	
		formData:{country:countryName}
		
    }).bind('fileuploaddone', function (e, data) {
		
		console.log(data);
		
		var uploadJson = {};		
		uploadJson.documentdata = [];
		var uploadPath = dureFile.uploadPathSegment()+countryName+'/'+decodeURIComponent(data.files[0].name);
		var filedata = {};	

		filedata.locationid = countryId;
		filedata.document_type = file_cat_type;
		filedata.document_name = data.files[0].name;
		filedata.document_path = uploadPath;
		
		dureFile.prevDetails = [];
		
		dureFile.prevDetails.push(data.files[0].name);
		dureFile.prevDetails.push(uploadPath);
		dureFile.prevDetails.push(file_cat_type);
		if(countryId == 0){
			
			dureFile.prevDetails.push(0);
		}else{
			
			dureFile.prevDetails.push(2);
		}
		
		
		
		uploadJson.documentdata.push(filedata);		

		console.log(uploadJson);
		console.log(dureFile.prevDetails);
		
		var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/uploadDocument';
		var filetypes = dureService.addFileInfo(serviceUrl,JSON.stringify(uploadJson),dureFile.callback_FileUploadInfoSuccess);
				
		
	}).bind('fileuploadsubmit', function (e, data) {
		
		data.formData = {country:countryName};
	});
}

dureFile.callback_GetFileTypes = function(resp){
	
	var fileOptionTag = "";
	$.each(resp,function(key,value){
		
		fileOptionTag += "<option value="+value[1]+">"+value[0]+"</option>";
		
	});
	
	$(".file_cat").append(fileOptionTag);
}
// });

dureFile.callback_FileUploadInfoSuccess = function(resp){
	
	dureDocuments.documentArr.push(dureFile.prevDetails);
	
	if($.trim($('.file_cat').val()) == 'Global ITP'){
		
		swal({
			  title:"FileUpload", 
			  html:"Your <b> "+$.trim($('.file_cat').val()).toUpperCase()+" </b> file has been uploaded to server successfully. ",
			  type: "success"
		});
		
		
	}else if($('.file_cat').val() == 0){
		
		swal({
			  title:"FileUpload", 
			  html:"Your <b> "+$.trim($('.file_cat').val()).toUpperCase()+" </b> file has been uploaded to server successfully. ",
			  type: "success"
		});		
		
	}else{
		
		swal({
			  title:"FileUpload", 
			  html:"Your <b> "+$.trim($('.file_cat option:selected').text())+" </b> file for <b> "+dureComUtil.countryName+" </b> has been uploaded to server successfully. ",
			  type: "success"
		});
		
	}
	// console.log("Success .... .... .... ");	
	// console.log(resp);	
	
};

dureFile.deleteFile = function(){
	
	var documentArr = [];
	var filename = dureComUtil.getCurrentFileName();
	$.each(dureDocuments.documentArr,function(index,array){
		
		var documentObj = {};
		
		if(filename == 'itp.html'){
			
			if(array[2] == 'Global ITP' || array[2] == 'ITP'){
				
				documentObj.fileName = array[0];
				documentObj.folderName = array[2];
				documentObj.levelId = array[3];
			}			
		}else{
			
			documentObj.fileName = array[0];
			documentObj.folderName = array[2];
			documentObj.levelId = array[3];			
			
		}
		
		
		if( documentObj.fileName != undefined){
			documentArr.push(documentObj);
		}
						
	});	
	
	console.log(documentArr);
	
	var tableRows = "<tbody>";
	var prevFolderName = "";
	var folderId = 0;
	$.each(documentArr,function(docIndex,docObj){

		tableRows += "<tr>";
		$.each(docObj,function(key,value){
			
				
				if(key != 'levelId'){
					
					tableRows += "<td class='"+key+"'>"+value+"</td>";		
				}
						
		});
		
		if(prevFolderName != docObj.folderName){
			folderId++;
			prevFolderName = docObj.folderName
		}
		
		tableRows += "<td style='text-align:center;'><a href='javascript:void(0)' id='deleteFile-"+docIndex+"' class='btn btn-danger deleteFile' title='Delete File'>"+
					"<i class='fa fa-file'></i> Delete File"+
					"</a>";
		// tableRows += "<a href='javascript:void(0)' id='deleteFolder-"+docIndex+"' class='btn btn-danger deleteFolder folder-"+folderId+"' title='Delete Folder'>"+
					// "<i class='fa fa-folder'></i> Delete Folder"+
					// "</a>";
		tableRows += "</td>";
		tableRows += "</tr>";	

	});
			
			
	tableRows += "</tbody>";
	$("#deleteFileTable").append(tableRows);
	
	$(".deleteFile").click(function(){
		
		var uploadJson = {};		
		uploadJson.documentdata = [];;
		var filedata = {};	
		var $that = $(this);
		
		
		
		filedata.document_type = $(this).parent().siblings('td').eq(1).text();
		filedata.document_name = $(this).parent().siblings('td').eq(0).text();
		filedata.document_path = "";
		
		
		
		console.log(filedata);
		
		
		swal({
		  title: "Are you sure?",
		  html: "You will not be able to recover <strong>"+filedata.document_name+"</strong> file!",
		  type: "warning",
		  showCancelButton: true,
		  confirmButtonClass: "btn btn-danger",
		  confirmButtonText: "Yes, delete it!",
		  closeOnConfirm: false
		},
		function(){
			
			var levelId = 0;
			$.each(dureDocuments.documentArr,function(docIndex,eachDocArr){
				    console.log(eachDocArr);
					if(eachDocArr[0] == filedata.document_name){
						
						dureDocuments.documentArr.splice(docIndex,1);
						levelId = eachDocArr[3];
					}	
			});
			
			$that.parents('tr').remove();
			
			// var rowId = $that.attr('id');			
			// var deletedIndex = parseInt(rowId.split('-').pop());
			// dureDocuments.documentArr.splice(deletedIndex,1);
			
			if(levelId == 0){
				
				filedata.locationid = 0;
				
			}else{
				
				filedata.locationid = dureComUtil.getCountryId();
			}
			
			
			uploadJson.documentdata.push(filedata);	
			
			var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/updateDocument';
			dureService.deleteFileFolder(serviceUrl,JSON.stringify(uploadJson),dureFile.callback_FileDeleteInfoSuccess);
		 
		});
	});
	
	$(".deleteFolder").click(function(){
		
		var uploadJson = {};		
		uploadJson.documentdata = [];;
		var filedata = {};	
		var $that = $(this);
		
		filedata.locationid = 0;
		filedata.document_type = $(this).parent().siblings('td').eq(1).text();
		filedata.document_name = "0";
		filedata.document_path = "";
		
		uploadJson.documentdata.push(filedata);	
		
		swal({
		  title: "Folder Delete",
		  html: " Are you sure you want to delete <strong> "+filedata.document_type+" </strong> folder? It might contain some files.",
		  type: "warning",
		  showCancelButton: true,
		  closeOnConfirm: false,
		  confirmButtonClass: "btn btn-danger",
		  confirmButtonText: "Yes, delete it!",
		  closeOnConfirm: false
		},
		function(){
			
			var folderUniqClass = $that.attr('class').split(" ").pop();
			
			//Remove all elements from working global array of documents i.e refreshing the array after removal.
			var arrayOfHref = $('.'+folderUniqClass);
			// console.log(arrayOfHref);
			
			var startId = parseInt(arrayOfHref.attr('id').split('-').pop());
			var endId = arrayOfHref.length;
			dureDocuments.documentArr.splice(startId,endId);
			
			// Remove all rows for the folder from table
			$('.'+folderUniqClass).parents('tr').remove();
			
			var serviceUrl = dureConfig.AppBaseURLContext + 'dataapi/updateDocument';
			dureService.deleteFileFolder(serviceUrl,JSON.stringify(uploadJson),dureFile.callback_FileDeleteInfoSuccess);
		 
		});
	});
	
};

// Path segment made dynamic for "docs" folder can be used in localhost / on server. 
dureFile.uploadPathSegment = function(){
	
	var segmentPart = location.pathname.substr(0,location.pathname.search("app"));
	var uploadFolderName = "docs/"
	var uploadFolderUrl = location.origin+segmentPart+uploadFolderName;
	return uploadFolderUrl;
}

dureFile.callback_FileDeleteInfoSuccess = function(){	
	
	swal("Folder deleted","The folder/file has been deleted","success");
}




