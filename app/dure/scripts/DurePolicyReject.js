var durePolicyReject = {};
var userinfo = localStorage.getItem("userJson");


durePolicyReject.initialize = function(countryId){	


	durePolicyReject.AppBaseURLContext = dureConfig.AppBaseURLContext;
	durePolicyReject.appId = 62;
	durePolicyReject.langId = 1;dureComUtil.countryID
	durePolicyReject.geoJson = {};
	durePolicyReject.countryList = [];
	
	durePolicyReject.formData = {};
	durePolicyReject.getPolicyDataQuestions(countryId);
	
};

durePolicyReject.getPolicyDataQuestions = function(countryId){
	
	 var userinfo = localStorage.getItem("userJson");
	 var countryId = dureComUtil.getCountryId();
	 
	 if(userinfo != null){
		 
		var userInfoJSON = JSON.parse(userinfo);
		var userid = userInfoJSON.userid;
		 
	 }else{
		 
		 var userid = 0;		 
	 }
	  
	 var serviceUrl = durePolicyReject.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid='+countryId+'&userid='+userid+'&status=Rejected&callback=durePolicyReject.callback_PolicyData';
	 console.log(serviceUrl);
	 
	 dureService.getPolicyQuestions(serviceUrl); 
};

durePolicyReject.callback_PolicyData = function(resp){
	
		console.log("<--------------------- Policy data  ----------------------->");
		console.log(resp);
		
		var country = dureComUtil.getCountryProperty();
		var countryName = country.name;
		var countryId = country.country_id;
		
		$('#policyHeaderName').html("Policy Questions Rejected - "+country.name);
		
		var questionGrps = resp.locationProfile.groups;
		
		var approvalArr = [], editHtmlObj = {};
		
		$.each(questionGrps,function(index,groupObj){
				
			$.each(groupObj.data,function(subGrpIndex,subGrpObj){				
				
				// var subgrp = {};
				
				$.each(subGrpObj.year,function(yearIndex,yearObj){
					
					$.each(yearObj,function(year,quesArr){
						
						// subgrp[year] = [];
						
						var questionArr = [];
						$.each(quesArr ,function(indexQues,quesObj){
							
							$.each(quesObj.subquestion,function(subQueIndex,subQueObj){
							
									var subQueData = [];
									// var editHtmlObj = {};
									var question = '';
									var options = '';
									
									if(subQueObj.hasOwnProperty('answer1') && subQueObj['answer1'] != null){
										
										subQueData.push(subQueObj.subquestionid);
										subQueData.push(groupObj.groupname);
										question = '<div class="policyQuestion col-md-12">'+quesObj.question+'</div><div class="policySubQuestion col-md-11">'+subQueObj.subquestion+'</div>'

										
										
										subQueData.push(question);
										subQueData.push(subQueObj['answer1'][0]);
										subQueData.push('<button class="btn btn-sm btn-primary editBtn" id="Rejected'+subQueObj.rowid+'" data-flag="Rejected" data-subrid="'+subQueObj.rowid+'" data-value="'+subQueObj['answer1'][0]+'" data-subqid="'+subQueObj.subquestionid+'" style="margin-right:10px;"><i class="fa fa-pencil-square-o"></i> Edit</button>');
										
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
											options += '<select name="'+countryName+'-'+subQueObj.subquestionid+'" class="form-control editRejElemnt"'+subQueObj.subquestionid+'>';	
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

										var button = '<div class="col-md-12 policySubQuestion" > <button class="btn btn-sm btn-primary resubmitBtn" data-flag="Draft" data-subrid="'+subQueObj.rowid+'" data-subqid="'+subQueObj.subquestionid+'" style="margin-right:10px;"><i class="fa fa-pencil-square-o"></i> Resubmit</button></div>';
										
										editHtmlObj[subQueObj.status + subQueObj.subquestionid] = question + options + button;
										
										// editHtmlArr.push(editHtmlObj);
										approvalArr.push(subQueData);									
									}									
							
							});
							
						});		
					
					});	
				});
				
				
			});		
			
		});
	
		durePolicyReject.displayTable(approvalArr);
		
		$(document).on('click','.approveBtn,.rejectBtn, .editBtn',function(){
			
			var subquestionid = $(this).attr('data-subqid')
			var statusText = $(this).attr('data-flag')
			
			
			if(editHtmlObj.hasOwnProperty(statusText+subquestionid)){
				
				
				$('#policyRejectSections').html(editHtmlObj[statusText+subquestionid]);				
				$("#rejectPolicyModal").modal(true);				
			}
		});
			
			
		$(document).on('click','.resubmitBtn',function(){
			
			var serviceUrl = durePolicyReject.AppBaseURLContext+"dataapi/target/all/updateQuestion";
			var subrid = $(this).attr('data-subrid');
			
			var currentYear = 2014;
			var updatedData = {};
			var responseJson = {};
			var userdata = dureUser.getUserInfo();			

			responseJson['userid'] = userdata.userid;

			responseJson['countryid'] = countryId;
			responseJson['subquestiondata'] = [];			
			
			updatedData['subquestionid'] = $(this).attr('data-subqid');
			updatedData['rowid'] = $(this).attr('data-subrid');
			durePolicyReject.rowid = $(this).attr('data-subrid');
			updatedData['value'] = $('[name ='+ countryName+'-'+$(this).attr('data-subqid')+' ]').val();
			updatedData['status'] = $(this).attr('data-flag');
			
			responseJson['subquestiondata'].push(updatedData);
			console.log(responseJson);			
		});		
};

// ----------------------------------------------------- Success Functions --------------------------------------------

durePolicyReject.updatePolicySuccess = function(resp){
	
	var dataObj = {};
	
	$("#Rejected"+durePolicyReject.rowid).parents('tr').remove();
	$("#rejectPolicyModal").modal('hide');
	swal("Resubmission", "Your rejected response has been resubmitted.", "success");
	  
	var currentPageUrl = window.location.href;
	var pos = currentPageUrl.lastIndexOf('/');
	var urlContext = currentPageUrl.substring(0,pos)+'/'
	var sendMailUrl = urlContext+'sendemail.php';  
	  
	dataObj['emailto'] = 'samir@duretechnologies.com';
	dataObj['emailfrom '] = 'shone@duretechnologies.com';
	dataObj['subject'] = 'Resubmission of rejected response of policy question.';	  
	dataObj['emailBody'] = 'User has resubmitted response for the policy question and needs your approval. ';
	dataObj['sendOnlyMail'] = true;
	  
	console.log(sendMailUrl);
	console.log(dataObj);
	  
	dureService.sendMail(sendMailUrl,dataObj,durePolicy.sendMailSuccess);	  
}

durePolicyReject.sendMailSuccess = function(resp){
	  
	  console.log("Email sent successfully to users.");
	  console.log(resp);
  
 }

// --------------------------------------------------  Table ----------------------------------------------------------------

durePolicyReject.displayTable = function(approvalArr){
	
	durePolicyReject.tableObj = $('#policyTable').dataTable({
										"data": approvalArr,
										"responsive": true,
										"iDisplayLength": 20,
										"lengthMenu": [ 10,25,50,100],
										"sScrollY": "360px"
								});		
	
};