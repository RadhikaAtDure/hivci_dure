dureTsTrack.initialize = function(){

	var serviceUrl = dureConfig.AppBaseURLContext+'dataapi/updatelocationdata/gettrackingdata';
	console.log(serviceUrl);
	dureService.getTsTrackingInfo(serviceUrl);	
	
	if(dureUser.checkUserLoginStatus()){
		
		dureTsTrack.enableUserLoggedInLinks();
	}
};


dureTsTrack.setData = function(data){
	
	dureTsTrack.data = data;
	console.log(data);
};


dureTsTrack.getData = function(){
	
	
	return dureTsTrack.data;
};

dureTsTrack.buildTopicDropDown = function(tsTrackData){
	var tsTopics = [];
	
	$.each(tsTrackData[0] ,function(isocode,trackDataArr){
		
		$.each(trackDataArr,function(index,eachTrackRecord){
			
			
			if($.inArray(eachTrackRecord[1][1],tsTopics) == -1){
				
				tsTopics.push(eachTrackRecord[1][1]);
			}
			
		});	
		
	});
	
	// console.log(tsTopics);
	
	var options = "<option value='0' >All Topics</option>"
	
	$.each(tsTopics,function(index,topicVal){
		
		options += "<option value='"+topicVal+"' >"+topicVal+"</option>";
	});
	
	$(".topicSelect").append(options);
}

dureTsTrack.formatData = function(){
	
	var tsTrackData = dureTsTrack.getData();
	var userInfo = dureUser.getUserInfo();
	dureTsTrack.buildTopicDropDown(tsTrackData);
	
	var formattedTsTrackData = [];	
	var dataForExport = [];	
	var colsForExport = [];
	console.log(tsTrackData);
	
	var exportCols = [];
	var avoidColsInExport = ['countryid','lastmodified','userid','username','ID'];
	exportCols.push('Country');
	for(var index in tsTrackData[0]['AGO'][0][0]){
		
		
		var value = tsTrackData[0]['AGO'][0][0][index];
		// console.log(value);
		if( $.inArray(value,avoidColsInExport) == -1){
			
			exportCols.push(value);			
			
		}
	}
	
	colsForExport.push(exportCols);
	var prevTopic = '';
	var incr = 1;
	
	if(dureUser.checkUserLoginStatus()){
		
			var updateBtnHtml = '<button class="btn btn-sm btn-default updateTsTrackData" data-widget="collapse">Update</button>';
			$('#tstrack-modal').find('.box-tools').prepend(updateBtnHtml);			
	}


   // Delete button for Document in Modal box

	if(dureUser.checkUserLoginStatus() && userInfo.userid == 136) {
			
		var dataID = $("#tstrack-modal").attr("data-id");
		var deleteDocument = '<button class="btn btn-sm btn-danger deleteTsRecBtn" >Delete</button>&nbsp;&nbsp;'

		$('#tstrack-modal').find('.box-tools').prepend(deleteDocument);			
	}
	
	$.each(tsTrackData[0],function(isocode,countryArr){
		
		var topicObj = {};
		$.each(countryArr,function(countryIndex,eachRecord){
			
			var formattedData = [];
			var formattedDataForExport = [];
			var countryName = dureComUtil.getCountryNamefromIso(isocode);
			
			if(topicObj.hasOwnProperty(eachRecord[1][1])){
				
				incr = topicObj[eachRecord[1][1]]+1;
				
			}else{
				
				incr = 1;
			}
			
			prevTopic = eachRecord[1][1];
			topicObj[prevTopic] = incr;
			formattedData.push(topicObj[prevTopic]);			
			
			formattedData.push(countryName);
			formattedDataForExport.push(countryName);
			
			formattedData.push(eachRecord[1][0]);
			
			formattedData.push(eachRecord[1][1]);
			
			formattedData.push(eachRecord[1][3]);
			formattedData.push(eachRecord[1][4]);
			formattedData.push(eachRecord[1][5]);
			$.each(eachRecord[1],function(recordKey,recordVal){
				
				if(recordVal != null && $.inArray(eachRecord[0][recordKey],avoidColsInExport) == -1){
					
					formattedDataForExport.push(recordVal);
				}else if(eachRecord[0][recordKey] != 'countryid' && eachRecord[0][recordKey] != 'ID'){
					
					formattedDataForExport.push('');
				}				
			});
			
			var str = '';
			str = eachRecord[1][10]+', '+eachRecord[1][12]
			formattedData.push(str);
			
			if(dureUser.checkUserLoginStatus() && userInfo.userid == 136){
			
				var actionHtml = "<a href='javascript:void(0)' class='btn btn-sm btn-info detailBtn' data-iso='"+isocode+"-"+countryIndex+"' style='margin-right:5px;'><i class='fa fa-eye' aria-hidden='true'></i> View Details</a>";
				 //remove delete button from table and add in modal box
				  //"<a href='javascript:void(0)' class='btn btn-sm btn-danger deleteTsRecBtn' data-id='"+eachRecord[1][8]+"'><i class='fa fa-times-circle' aria-hidden='true'></i> Delete</a>"
			}else{
				
				var actionHtml = "<a href='javascript:void(0)' class='btn btn-sm btn-info detailBtn' data-iso='"+isocode+"-"+countryIndex+"' style='margin-right:5px;'><i class='fa fa-eye' aria-hidden='true'></i> View Details</a>";
			}
			
			
			formattedData.push(actionHtml);
			formattedTsTrackData.push(formattedData);
			dataForExport.push(formattedDataForExport);	
		});
				
	});

	$(document).on("click",".detailBtn",function(){
		
		var isocodeStr = $(this).attr('data-iso');
		var isocode = isocodeStr.split("-").shift();
		var recordIndex = isocodeStr.split("-").pop();
		var countryName = dureComUtil.getCountryNamefromIso(isocode);
		var countryData = tsTrackData[0][isocode][recordIndex];
		console.log(countryData);
		var detailHtml = '';
		
		
		$("#tstrack-modal").attr("data-countryId",countryData[1][9]);
		$("#tstrack-modal").attr("data-ID",countryData[1][8]);
		$("#tstrack-modal").attr("data-topic",countryData[1][1]);
		
		$.each(countryData[0],function(headerIndex,headerValue){

			if(headerValue != 'Topic' && headerValue != 'ID' && headerValue != 'countryid' && headerValue != 'username'&& headerValue != 'userid'){
				
	
				detailHtml += '<div class="box box-solid box-primary">';
				
				if(dureUser.checkUserLoginStatus()){
												
					var editData = '<button class="btn btn-primary btn-sm editTsTrackData" data-panel="editPanel-'+headerIndex+'" data-widget="collapse" ><i class="fa fa-pencil-square-o"></i></button>';
				}else{
					
					var editData = "";
				}
				
				
				var headerVal = headerValue == "lastmodified" ? "Last Modified" : headerValue;
				detailHtml += '<div class="box-header">'+
									'<h3 class="box-title"><i class="fa fa-file-text-o"></i>  '+headerVal+'</h3>'+
									'<div class="box-tools pull-right">'+editData+
										'<button class="btn btn-primary btn-sm" data-widget="collapse"><i class="fa fa-minus"></i></button>'+
									'</div>'+											
								'</div>';
				if(countryData[1][headerIndex] == null){
					
					countryData[1][headerIndex] = "";
				}
				detailHtml += '<div class="box-body" style="padding:15px;">'+ countryData[1][headerIndex]+
									
								  '</div>';
				
				detailHtml += '</div>';
			}
		});
		
		detailHtml += '<div class="box-footer col-md-offset-6" style="padding:15px;">';
		

		
		detailHtml += '</div>';
		
		$("#trackingToolSection").html(detailHtml);
		
		$('.modal-title').html("TS Tracking Tool - "+countryName);
		
		$("#tstrack-modal").modal(true);
		
		$(document).on("click",".closeBtn",function(){
			
			$("#tstrack-modal").modal("hide");
		});
		
	});
	
	$(document).on('click','.deleteTsRecBtn',function(){

	
		var serviceUrl = dureConfig.AppBaseURLContext+'dataapi/updatelocationdata/updatetrackingdata';
		var deleteJson = {};
		var userInfo = dureUser.getUserInfo();
		
		deleteJson["ID"] = $("#tstrack-modal").attr("data-id"); // get id from modal box //$(this).attr("data-id");
		deleteJson["Action"] = 'delete';
		console.log(deleteJson);

		swal({
		  title: "Record Delete",
		  html: " Are you sure you want to delete this record?",
		  type: "warning",
		  showCancelButton: true,
		  closeOnConfirm: false,
		  confirmButtonClass: "btn btn-danger",
		  confirmButtonText: "Yes, delete it!",
		  closeOnConfirm: false
		},
		function(){

			dureService.deleteTsRecord(serviceUrl,JSON.stringify(deleteJson),dureTsTrack.callback_RecordDeleteSuccess);
		 
		});
		
	});

	dureTsTrack.loadTableData(formattedTsTrackData);
	dureTsTrack.exportTableData(dataForExport,colsForExport);
	dureTsTrack.editPopupData();
};

dureTsTrack.loadTableData = function(trackDataArr){
	
	dureTsTrack.tableObj = $('#tsTrackTable').DataTable( {
							"initComplete" : function () {
												// this.api().columns([0,1]).every( function () {
													
													var column = this.api().column(1);
													var select = $('.countrySelect').on( 'change', function () {

																	var val = $(".countrySelect").val();
																	console.log(val);
																	if(val != 0){

																		 val = $.fn.dataTable.util.escapeRegex($(".countrySelect").val());
																		 console.log(val);
																	}else{
																		
																		val = '';
																	}																	
																	
																	console.log(val);
																	column
																		.search( val ? '^'+val+'$' : '', true, false )
																		.draw();

																});
																
													var column2 = this.api().column(3);
													var select2 = $('.topicSelect').on( 'change', function () {
														
																	var val = $(".topicSelect").val();
																	if(val != 0){
																		
																		val = '';
																		console.log($(".topicSelect option:selected").text());
																		console.log($(".topicSelect").val());
																		 // val = $.fn.dataTable.util.escapeRegex($(".topicSelect option:selected").text());

																		 val = $.fn.dataTable.util.escapeRegex($(".topicSelect").val());
																	}else{
																		
																		val = '';
																	}																	
																	
																	console.log(val);
																	column2
																		.search( val ? '^'+val+'$' : '', true, false )
																		.draw();

																});

											},
							"data": trackDataArr,
							"responsive": true,
							"iDisplayLength": 200,
							"lengthMenu": [ 20,50,100,200],
							"sScrollY": "525px",
							"order": [[ 7, "desc" ]]
						});
						
		$('.resetFilterBtn').click(function(){
			
			$('.topicSelect').val("0");
			$('.topicSelect').trigger('change').val("0");
			
			$('.countrySelect').val("0");
			$('.countrySelect').trigger('change').val("0");
			
		});
		

};

dureTsTrack.exportTableData = function(dataForExport,colsForExport){
		
	$("#exportTable").click(function(){
			
			var filteredData = [];
			var countryVal = $('.countrySelect').val();
			var topicVal   = $('.topicSelect').val();
			
			if(countryVal == 0 && topicVal == 0){
				
				filteredData = dataForExport;
			}else if(countryVal != 0 && topicVal == 0){
				
				$.each(dataForExport,function(index,exportArr){
					
					if(exportArr[0] == countryVal){
						
						filteredData.push(exportArr);
					}
				});
			}else if(countryVal == 0 && topicVal != 0){
				
				$.each(dataForExport,function(index,exportArr){
					
					if(exportArr[2] == topicVal){
						
						filteredData.push(exportArr);
					}
				});
			}else{
				
				$.each(dataForExport,function(index,exportArr){
					
					if(exportArr[0] == countryVal && exportArr[2] == topicVal){
						
						filteredData.push(exportArr);
					}
				});
			}
			
			$('#tsTrackTable').tableExport({type:'excel',escape:true, tableJsonData:filteredData,tableName:'Tracking Tool', tableColumn:colsForExport[0]});						
			
		});	
};

dureTsTrack.editPopupData = function(){
	
	console.log("Edit Ts Track Data .. .. .. ");
	
	CKEDITOR.replace('textSectionEditor',{
		 height: 380
	});		
	
	$(document).on('click','.editTsTrackData',function() {

		var editText = $(this).parents('.box-header').siblings().text();
		var panelId = $(this).attr('data-panel');
		console.log(panelId);
		$("#tstrack-edit-modal").attr('data-panelref',panelId);
		
		CKEDITOR.instances['textSectionEditor'].setData(editText);
		$('.edit_trackingData').text($(this).parents('.box-header').text());
		$("#tstrack-edit-modal").modal({show: true});						
	});	
	
	$(document).on('click','.updateBtn',function() {
	
		var editorValue = CKEDITOR.instances['textSectionEditor'].getData();
		var editorPanId = $("#tstrack-edit-modal").attr('data-panelref');		
		$("[data-panel='"+editorPanId+"']").parents('.box-header').siblings().html(editorValue);
		$("#tstrack-edit-modal").modal('hide');
	});
	
	$(document).on('click','.updateTsTrackData',function() {
		
		var updateJson = {};
		var userInfo = dureUser.getUserInfo();
		var serviceUrl = dureConfig.AppBaseURLContext+'dataapi/updatelocationdata/updatetrackingdata';
		var jqArr = $("#trackingToolSection").find(".box-primary");
		console.log(jqArr);
		
		$.each(jqArr,function(index,jqObj){
			
			var key = $(jqObj).find(".box-title").text().trim();
			var value = $(jqObj).find(".box-body").text().trim();
			
			updateJson[key] = value;
		});
		
		updateJson["Countryid"] = $("#tstrack-modal").attr("data-countryid");
		updateJson["ID"] = $("#tstrack-modal").attr("data-id");
		updateJson["Topic"] = $("#tstrack-modal").attr("data-topic");
		updateJson["Userid"] = userInfo.userid;
		updateJson["Action"] = 'update';
		
		dureService.updateTsTrackingInfo(serviceUrl,JSON.stringify(updateJson),dureTsTrack.editTsTrackSuccess);
		console.log(updateJson);		
	});	
};


dureTsTrack.editTsTrackSuccess = function(resp){
	
	$("#tstrack-modal").modal('hide');
	
	// swal("TS tracking tool", " Your TS tracking tool record has been updated.", "success");
	
	window.location.reload();
	
};

dureTsTrack.enableUserLoggedInLinks = function(){
	
	var navLinks = '<a href="javascript:void(0)" class="btn btn-default addTsTopic" title="Add Tracking Tool Record" style="font-weight: bold;margin-top: 6px; margin-right: 5px; float: right;">Add Tracking Tool Record</a>';
	$("#login").after(navLinks);	
	
	$('.addTsTopic').click(function(){

		var segmentPart = location.pathname.substr(0,location.pathname.search("app"));
		$('.trackingToolAside').load(segmentPart+'app/addtstopics.html');
	});
};


dureTsTrack.loadAddTsRecordView = function(){
	
	
	var tsTrackData = dureTsTrack.getData();
	dureTsTrack.buildTopicDropDown(tsTrackData);
	var selectOpt = dureControl.selectCountryDropDownOptions("NUMBER");
	
	$('#tokenize').append(selectOpt);
	if($('[name="optionsTopicRadios"]:checked').val() == 0){
		
		$('#newTopicpName').parents('.form-group').hide();
	}
	
	$('[name="optionsTopicRadios"]').click(function(){
		
		if($('[name="optionsTopicRadios"]:checked').val() == 0){
			
			$('#newTopicpName').parents('.form-group').hide();
			
			$('#topicSelect').parents('.form-group').show();

			
		}else{
			
			$('#newTopicpName').parents('.form-group').show();
			
			$('#topicSelect').parents('.form-group').hide();						
		}		
	});
	
	$('#tokenize').tokenize({'placeholder':'Search countries' ,displayDropdownOnFocus:true,nbDropdownElements:260});

	dureTsTrack.addNewTsRecord();	
};


dureTsTrack.addNewTsRecord = function(){
	
	$('.recordSubmitBtn').click(function(){
		
		$('.tstrackingForm').submit(false);
		
		var formData = $('.tstrackingForm').serializeArray();
		var userInfo = dureUser.getUserInfo();
		var addJsonObj = {};
		$.each(formData,function(index,formObj){
			
			if(formObj.name != 'optionsTopicRadios' && formObj.name != 'Topic' && formObj.name != 'Countrylist'){				

				addJsonObj[formObj.name] = formObj.value;	
				
			}else if(formObj.name == 'Topic'){
				
				if($('#optionsRadios1:checked').val() == 1){
					
					addJsonObj[formObj.name] =$('#newTopicpName').val();
				}else{
					
					addJsonObj[formObj.name] = $('#topicSelect').val();
				}				
			}else if(formObj.name == 'Countrylist'){
				
				addJsonObj[formObj.name] = $(".countryDrop").val();
			}
		});
		
		console.log(addJsonObj);	
		addJsonObj.Userid = userInfo.userid;
		var serviceUrl = dureConfig.AppBaseURLContext+'dataapi/updatelocationdata/savetrackingdata';
		dureService.addTsTrackingInfo(serviceUrl,JSON.stringify(addJsonObj),dureTsTrack.addTsTrackSuccess);
	});	
};

dureTsTrack.addTsTrackSuccess = function(){
	
	window.location.reload();
	
};

dureTsTrack.callback_RecordDeleteSuccess = function(){
	
	window.location.reload();
}