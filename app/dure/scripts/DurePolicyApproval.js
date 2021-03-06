var durePolicyApproval = {};

durePolicyApproval.initialize = function(countryId){

	durePolicyApproval.AppBaseURLContext = dureConfig.AppBaseURLContext;
	durePolicyApproval.appId = 62;
	durePolicyApproval.langId = 1;
	durePolicyApproval.geoJson = {};
	durePolicyApproval.countryList = [];
	
	durePolicyApproval.formData = {};
	durePolicyApproval.getPolicyDataQuestions(countryId);
	
};

durePolicyApproval.getPolicyDataQuestions = function(countryId){
	
	 var userinfo = localStorage.getItem("userJson");
	 var country_id = dureComUtil.getCountryId();
	 
	 if(userinfo != null){
		 
		var userInfoJSON = JSON.parse(userinfo);
		var userid = userInfoJSON.userid;
		 
	 }else{
		 
		 var userid = 0;		 
	 }
	  
	var serviceUrl = durePolicyApproval.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid='+country_id+'&userid='+userid+'&status=Draft&callback=durePolicyApproval.callback_PolicyData';
	dureService.getPolicyQuestions(serviceUrl);
 
};

durePolicyApproval.callback_PolicyData = function(resp){
	
		console.log("<--------------------- Policy data  ----------------------->");
		console.log(resp);		
		durePolicyApproval.policyRespData = resp;

		var country = dureComUtil.getCountryProperty();
		var countryName = country.name;
		var countryId = country.country_id;
		
		$('#policyHeaderName').html("Policy Questions Approval - "+countryName);
		
		var questionGrps = resp.locationProfile.groups;
		
		var approvalArr = [], editHtmlObj = {};
		
		$.each(questionGrps,function(index,groupObj){
				
			$.each(groupObj.data,function(subGrpIndex,subGrpObj){				
				
				var subgrp = {};
				
				$.each(subGrpObj.year,function(yearIndex,yearObj){
					
					$.each(yearObj,function(year,quesArr){
						
						subgrp[year] = [];
						
						var questionArr = [];
						$.each(quesArr ,function(indexQues,quesObj){
							
							$.each(quesObj.subquestion,function(subQueIndex,subQueObj){
								
									var subQueData = [];
									var question = '';
									var options = '';
									
									if(subQueObj.hasOwnProperty('answer1') && subQueObj['answer1'] != null){
										
										subQueData.push(subQueObj.subquestionid);
										subQueData.push(groupObj.groupname);
										
										question = '<div class="policyQuestion col-md-12">'+quesObj.question+'</div><div class="policySubQuestion col-md-11">'+subQueObj.subquestion+'</div>'
										subQueData.push(question);
										
										subQueData.push(subQueObj['answer1'][0]);
										subQueData.push('<div class="btn-group"><button class="btn btn-sm btn-primary editBtn" data-flag="Draft" data-subrid="'+subQueObj.rowid+'" data-value="'+subQueObj['answer1'][0]+'" data-subqid="'+subQueObj.subquestionid+'"><i class="fa fa-pencil-square-o"></i> Edit</button><button class="btn btn-sm btn-success approveBtn" data-flag="Approved" data-subrid="'+subQueObj.rowid+'" data-value="'+subQueObj['answer1'][0]+'" data-subqid="'+subQueObj.subquestionid+'"><i class="fa fa-thumbs-o-up"></i> Approve</button><button class="btn btn-sm btn-danger rejectBtn" data-flag="Rejected" data-subrid="'+subQueObj.rowid+'" data-value="'+subQueObj['answer1'][0]+'" data-subqid="'+subQueObj.subquestionid+'" ><i class="fa fa-thumbs-o-down"></i> Reject</button></div>');
										
										var cols = 3;	
										if(subQueObj.valuetype.length%3 == 0 || subQueObj.valuetype.length%3 == 1){
											
											cols = 3;
										}else{
											
											cols = 6;								
										}										
										
										if(subQueObj.valuetype[0] == 'table'){
											options += '<div class="col-md-4">'+subQueObj.subquestion+'</div>';
											options += '<div class="col-md-4"><input type="text"/></div>';
											options += '<div class="col-md-4"><input type="text"/></div>';	
											
										}else if(subQueObj.valuetype[0] == 'drop down'){
											

											
											options += '<div class="col-md-12 policySubQuestion">';
											options += '<select name="'+countryName+'-'+subQueObj.subquestionid+'" class="form-control">';	
											for(var i=0;i < subQueObj.valuetype.length;i++){	

											var selected = '';
											
											if(subQueObj.optionvalue[i] == subQueObj.answer1)	{
												selected = "selected";
											}									
																
												options += '<option value="'+subQueObj.optionvalue[i]+'" '+selected+'> ' + subQueObj.optionvalue[i]+"</option>";	
											}
											options += '</select>';
											options += '</div>';
											
										}else if(subQueObj.valuetype[0] == 'checkbox'){
											for(var i=0;i < subQueObj.valuetype.length;i++){
												
												var checked = '';
												if(subQueObj.hasOwnProperty('answer1') && subQueObj['answer1'] != null){
													
													if(subQueObj['answer1'][0].trim() == subQueObj.optionvalue[i].trim()){
														checked = 'checked';
													}
												}
												
												options += '<div class="col-md-12" >';														
												options += '<input name="'+countryName+'-'+subQueObj.subquestionid+'" type="'+subQueObj.valuetype[i]+'" '+checked+' value="'+subQueObj.optionvalue[i]+'"/> ' + subQueObj.optionvalue[i];								
												options += '</div>';
											}
										
										}else if(subQueObj.valuetype[0] == 'text'){
																						
												if(subQueObj.hasOwnProperty('answer1') && subQueObj['answer1'] == null){
													
													subQueObj.optionvalue[0] = "";
													subQueObj['answer1'] = "";
												}
											
												options += '<div class="col-md-12" >';														
												options += '<input name="'+countryName+'-'+subQueObj.subquestionid+'" type="'+subQueObj.valuetype[0]+'" value="'+subQueObj.answer1+'" class="form-control"/> ';								
												options += '</div>';										
											
										
										}else if(subQueObj.valuetype[0] == 'radio'){										

											for(var i=0;i < subQueObj.valuetype.length;i++){
												
												var checked = '';
												if(subQueObj.hasOwnProperty('answer1') && subQueObj['answer1'] != null){
													
													if(subQueObj['answer1'][0].trim() == subQueObj.optionvalue[i].trim()){
														checked = 'checked';
													}
												}
												
												options += '<div class="col-md-12" >';														
												options += '<input name="'+countryName+'-'+subQueObj.subquestionid+'" type="'+subQueObj.valuetype[i]+'" '+checked+' value="'+subQueObj.optionvalue[i]+'"/> ' + subQueObj.optionvalue[i];								
												options += '</div>';
											}								
											
										}

										var button = '<div class="col-md-12 policySubQuestion" > <button class="btn btn-sm btn-success approveBtn editApproveBtn" data-flag="Approved" data-subrid="'+subQueObj.rowid+'" data-subqid="'+subQueObj.subquestionid+'" style="margin-right:10px;"><i class="fa fa fa-thumbs-o-up"></i> Approve</button></div>';
										
										editHtmlObj[subQueObj.status + subQueObj.subquestionid] = question + options + button;

										approvalArr.push(subQueData);									
									}								
							
							});
							
						});		
					
					});	
				});
				
				
			});		
			
		});
		
		durePolicyApproval.displayTable(approvalArr);
		
		
		$(document).on('click','.approveBtn,.rejectBtn',function(){

			var currentYear = 2014;
			var updatedData = {};
			var responseJson = {};
			var userdata = dureUser.getUserInfo();
			
			durePolicyApproval.currentJqObj = $(this);
			
			responseJson['userid'] = userdata.userid;
			responseJson['countryid'] = dureComUtil.countryID;
			responseJson['subquestiondata'] = [];
			
			
			updatedData['subquestionid'] = $(this).attr('data-subqid');
			updatedData['rowid'] = $(this).attr('data-subrid');
			
			if($(this).hasClass('editApproveBtn')){
				
				updatedData['value'] = $('[name ='+ countryName+'-'+$(this).attr('data-subqid')+' ]').val();
			}else{
				
				updatedData['value'] = $(this).attr('data-value');
				
			}
			
			
			updatedData['status'] = $(this).attr('data-flag');
			durePolicyApproval.statusFlag = $(this).attr('data-flag');
			
			responseJson['subquestiondata'].push(updatedData);

			console.log(responseJson);	
	
			 
			 var serviceUrl = durePolicyApproval.AppBaseURLContext+"dataapi/target/all/updateQuestion";
			 dureService.updatePolicyResponse(serviceUrl,JSON.stringify(responseJson),durePolicyApproval.updatePolicySuccess);
			
		});	
		
		$(document).on('click','.editBtn',function(){
			
			var subquestionid = $(this).attr('data-subqid');
			var statusText = $(this).attr('data-flag');		
			durePolicyApproval.currEditBtnObj = $(this);
			
			if(editHtmlObj.hasOwnProperty(statusText+subquestionid)){				
				
				$('#policyApproveSections').html(editHtmlObj[statusText+subquestionid]);				
				$("#policy-modal").modal(true);				
			}
			
		});
		
};

// ----------------------------------------------------- Success Functions --------------------------------------------

durePolicyApproval.updatePolicySuccess = function(resp){
	
	var dataObj = {};
	
	if(durePolicyApproval.statusFlag == 'Approved'){
			  
	  swal("Approved", "You have approved user response.", "success");
	  dataObj['emailBody'] = 'Admin has approved user response for the raised policy question. ';
	}else{
		  
	  swal("Rejected", "You have rejected user response.", "success");
	  dataObj['emailBody'] = 'Admin has rejected user response for the raised policy question. ';
	}
	
   if(durePolicyApproval.currentJqObj.hasClass('editApproveBtn')){
	   
	   durePolicyApproval.currEditBtnObj.parents('tr').remove();
	   $("#policy-modal").modal('hide');
	   
   }else{
	   
	   durePolicyApproval.currentJqObj.parents('tr').remove();
   }	
	
	  
	var currentPageUrl = window.location.href;
	var pos = currentPageUrl.lastIndexOf('/');
	var urlContext = currentPageUrl.substring(0,pos)+'/'
	var sendMailUrl = urlContext+'sendemail.php';  
	  
	dataObj['emailto'] = 'samir@duretechnologies.com';
	dataObj['emailfrom'] = 'shone@duretechnologies.com';
	dataObj['subject'] = 'Policy question status for response';	  
	dataObj['sendOnlyMail'] = true;
	  
	console.log(sendMailUrl);
	console.log(dataObj);
	  
	dureService.sendMail(sendMailUrl,dataObj,durePolicyApproval.sendMailSuccess);	  
}

durePolicyApproval.sendMailSuccess = function(resp){
	  
	  console.log("Email sent successfully to users.");
	  console.log(resp);
  
 }
// --------------------------------------------------  Table ----------------------------------------------------------------

durePolicyApproval.displayTable = function(approvalArr){
	
	durePolicyApproval.tableObj = $('#policyTable').dataTable({
			"data": approvalArr,
			"responsive": true,
			"iDisplayLength": 20,
			"lengthMenu": [ 20,50,100,200],
			"sScrollY": "360px"
	});		
};