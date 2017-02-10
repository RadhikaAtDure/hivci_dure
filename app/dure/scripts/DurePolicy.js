$(document).ajaxStart(function(){
		//$("#ihmap").addClass('block-component');
	$('#policySections').block({
        message: '<h5>Loading...</h5>',
        css: {
           border: 'none',
           padding: '15px',
           backgroundColor: '#000',
           '-webkit-border-radius': '10px',
           '-moz-border-radius': '10px',
           opacity: .5,
           color: '#fff'
        }
	});
}).ajaxStop(function(){
	$('#policySections').unblock();
});


durePolicy.initialize = function(){
	durePolicy.AppBaseURLContext = dureConfig.AppBaseURLContext;
	durePolicy.appId = 62;
	durePolicy.langId = 1;
	durePolicy.groupId = 0;
	durePolicy.countryISO2Code;
	durePolicy.geoJson = {};
	durePolicy.countryList = [];
	durePolicy.formData = {};
	durePolicy.getPolicyDataQuestions(dureComUtil.countryID);
	durePolicy.enableLinks();
};

durePolicy.getParameterByName = function(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}



durePolicy.getPolicyDataQuestions = function(){

	console.log("This is s policy get data questions.....");
	console.log(dureComUtil.countryID);

	var userinfo = localStorage.getItem("userJson");

	 if(userinfo != null){

		var userInfoJSON = JSON.parse(userinfo);
		var userid = userInfoJSON.userid;

	 }else{

		 var userid = 0;
	 }



	if(userInfoJSON != null ){

		// For Regional Admin
		if(userInfoJSON.roles[0] == 7){

			var serviceUrl = durePolicy.AppBaseURLContext + 'dataapi/target/all/policyData?groupid='+durePolicy.groupId+'&userid='+userid+'&status=Publish&callback=durePolicy.callback_PolicyData';
		}else{
			// For Other Users
			var serviceUrl = durePolicy.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid='+dureComUtil.countryID+'&userid='+userid+'&status=Publish&callback=durePolicy.callback_PolicyData';
		}

	}else{

		// For Public users
		var serviceUrl = durePolicy.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid='+dureComUtil.countryID+'&userid='+userid+'&status=Publish&callback=durePolicy.callback_PolicyData';
	}

	 console.log(serviceUrl);
	 dureService.getPolicyQuestions(serviceUrl);
};

durePolicy.callback_PolicyData = function(resp){

	console.log("<--------------------- Policy data  ----------------------->");
	console.log(resp);

	if(resp.locationProfile.success == true){

		durePolicy.policyRespData = resp;

		// For logged in users ...
		var userinfo = localStorage.getItem("userJson");
		var userInfoJSON = JSON.parse(userinfo);

		console.log(dureComUtil.countryID);

		var countryIso = dureComUtil.getCountryIsoFromID(dureComUtil.countryID);
		var countryName =dureComUtil.getCountryNamefromIso(countryIso);

		var policyTabHtml = '<div class="nav-tabs-custom"><ul class="nav nav-tabs" role="tablist">';

		var questionGrps = resp.locationProfile.groups;
		var active = 1;
		var activeClass = '';
		var groups;
		// To fetch current year.
		var currYear = 'October 2016'; // ----> Year Hardcoded for first Tab .

		// Regional Admin / Managers
		if(resp.locationProfile.hasOwnProperty('groupnames')){

			groups = resp.locationProfile.groupnames;
			$.each(groups,function(groupid,groupname){

				var flag = false;
				if(groupid == durePolicy.groupId){
					activeClass = 'active';
					flag = true;
				}else{
					activeClass = '';
				}

				if(active < 5){


					policyTabHtml += '<li role="presentation" class="'+activeClass+'"><a href="#tabpane-'+groupid+'" class="tablink" role="tab" id="tabpanelink-'+groupid+'" data-toggle="tab" aria-controls="tabpane-'+groupid+'">'+groupname+'</a></li>'
					if(active == 4){

						policyTabHtml += '<li role="presentation" class="dropdown '+activeClass+'">'+
									'<a href="#" id="otherGroups" class="dropdown-toggle" aria-controls="otherGroups-contents"  data-toggle="dropdown">Other Groups<span class="caret"></span></a>'+
									'<ul class="dropdown-menu" aria-labelledby="otherGroups" id="otherGroups-contents">';

					}

				}else{

					policyTabHtml += '<li class="'+activeClass+'"><a href="#tabpane-'+groupid+'" class="tablink" role="tab" id="tabpanelink-'+groupid+'" tabindex="-1"  data-toggle="tab" aria-controls="tabpane-'+groupid+'">'+groupname+'</a></li>';

				}
				active++;
			});

		}else{

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

		}

		policyTabHtml += '</ul></li>';
		policyTabHtml += '</ul>';

		policyTabHtml += '<div class="row" style="margin-top:10px; margin-right:0px;"><div class="form-group  pull-right"><label style="margin-top: 7px;"class="col-sm-2 control-label">Year:  </label><div class="col-sm-10"><select class="form-control yearFilter" >';
		policyTabHtml += '<option> Select year </option>';
		policyTabHtml += '<option selected="selected" value="'+currYear+'">'+currYear+'</option>';
		policyTabHtml += '</select>';
		policyTabHtml += '</div></div>';

		policyTabHtml += '<div class="form-group pull-right"  style="display:none"><label class="col-sm-2 control-label">Group Filter: </label><div class="col-sm-10 pull-right"><select class="form-control subGroupFilter">';
		policyTabHtml += '<option> Select Sub Group </option>';

		policyTabHtml += '</select>';
		policyTabHtml += '</div></div></div>';


		policyTabHtml += '<div class="tab-content">';

		var tabCount = 1;
		var tabActive = '';

		$.each(questionGrps,function(index,groupObj){

			// var formGrp = {};
			durePolicy.formData['form'+groupObj.groupid] = [];

			if(tabCount == 1) {
				tabActive = 'active';
			}else{
				tabActive = '';
			}

			policyTabHtml += '<div role="tabpanel" aria-labelledby = "tabpanelink-'+groupObj.groupid+'" class="tab-pane policyTabPanel '+tabActive+'" id="tabpane-'+groupObj.groupid+'" data-tabpane ="tabpane-'+groupObj.groupid+'" >';

			// policyTabHtml += '<div class="box-group" id="accordion">';

			policyTabHtml += '<form id="form'+groupObj.groupid+'" class="formOne">';

			$.each(groupObj.data,function(subGrpIndex,subGrpObj){

					var subgrp = {};

					$.each(subGrpObj.year,function(yearIndex,yearObj){

						$.each(yearObj,function(year,quesArr){

							subgrp[year] = [];

							if(tabCount == 1){
								currYear = year;
							}else{}

							var questionArr = [];

							$.each(quesArr ,function(indexQues,quesObj){

								var firstAccIn = "in";
								// var className = "collapsed";
								var className = "";
								var flag = false;

								policyTabHtml += '<div class="panel box box-primary">';
								policyTabHtml += '<div class="with-border"><!--Start of Question -->';
								policyTabHtml += '<h4 class="box-title"><a data-toggle="collapse" data-parent="#accordion" href="#collapse'+groupObj.groupid+indexQues+'" aria-expanded="'+flag+'" class="'+className+'">'+quesObj.question+'</a></h4>';
								policyTabHtml += '</div> <!--End of Question -->';
								policyTabHtml += '<div id="collapse'+groupObj.groupid+indexQues+'" class="panelOffset-2 panel-collapse collapse '+firstAccIn+'" aria-expanded="'+flag+'"> <!--Start of Question -->';
								$.each(quesObj.subquestion,function(subQueIndex,subQueObj){

									var subQueData = {}, answerObj = {}, answer, rowId = [];

									subQueData['subquestionid'] = subQueObj.subquestionid;

									// For regional managers/admin ....
									if(subQueObj.hasOwnProperty('countries')){

										// console.log(subQueObj.countries);
										for(var i in subQueObj.countries){
											if(i == dureComUtil.countryID){

												answerObj = subQueObj.countries[i];
												rowId = subQueObj.countries[i].rowid;
												break;
											}

										}

										if(answerObj.hasOwnProperty('answer1') && answerObj['answer1'] != null){

											subQueData['subquestionval'] = answerObj.answer1[0];
										}else{

											subQueData['subquestionval'] = answerObj.answer1;
										}

									}else{

										// For non regional admin...
										if(subQueObj.hasOwnProperty('answer1') && subQueObj['answer1'] != null){

											subQueData['subquestionval'] = subQueObj.answer1[0];
										}else{

											subQueData['subquestionval'] = subQueObj.answer1;
										}

									}

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

									}else if(subQueObj.valuetype[0] == 'dropdown'){

										policyTabHtml += '<div class="col-md-6">';
										policyTabHtml += '<select name="'+countryName+'-'+subQueObj.subquestionid+'" class="form-control">';
										for(var i=0;i < subQueObj.optionvalue.length;i++){

										var selected = '';

										if(subQueData['subquestionval'] != undefined){

											if(subQueObj.optionvalue[i].toLowerCase() == subQueData['subquestionval'].toLowerCase()){
												selected = "selected";
											}
										}

											policyTabHtml += '<option value="'+subQueObj.optionvalue[i]+'" '+selected+'> ' + subQueObj.optionvalue[i]+"</option>";
										}
										policyTabHtml += '</select>';
										policyTabHtml += '</div>';

									}else if(subQueObj.valuetype[0] == 'checkbox'){
										for(var i=0;i < subQueObj.optionvalue.length;i++){

											var checked = '';
											if(subQueData['subquestionval'] != null){

												if(subQueData['subquestionval'].toLowerCase().trim() == subQueObj.optionvalue[i].toLowerCase().trim()){
													checked = 'checked';
												}
											}else{

												if(subQueData['subquestionval'] == subQueObj.optionvalue[i].toLowerCase().trim()){
													checked = 'checked';
												}
											}

											policyTabHtml += '<div class="col-md-12" >';
											policyTabHtml += '<input name="'+countryName+'-'+subQueObj.subquestionid+'" type="'+subQueObj.valuetype[0]+'" '+checked+' value="'+subQueObj.optionvalue[i]+'"/> ' + subQueObj.optionvalue[i];
											policyTabHtml += '</div>';
										}

									}else if(subQueObj.valuetype[0] == 'text'){

											if(subQueData['subquestionval'] == null){

												subQueObj.optionvalue[0] = "";
												subQueData['subquestionval'] = "";
											}else{


											}

											policyTabHtml += '<div class="col-md-6" >';
											policyTabHtml += '<input name="'+countryName+'-'+subQueObj.subquestionid+'" type="'+subQueObj.valuetype[0]+'" value="'+subQueData['subquestionval']+'" class="form-control"/> ';
											policyTabHtml += '</div>';


									}else if(subQueObj.valuetype[0] == 'radio'){

										for(var i=0;i < subQueObj.optionvalue.length;i++){

											var checked = '';
											if(subQueData['subquestionval'] != null){

												if(subQueData['subquestionval'].trim() == subQueObj.optionvalue[i].trim()){
													checked = 'checked';
												}
											}

											policyTabHtml += '<div class="col-md-'+cols+'" >';
											policyTabHtml += '<input name="'+countryName+'-'+subQueObj.subquestionid+'" type="'+subQueObj.valuetype[0]+'" '+checked+' value="'+subQueObj.optionvalue[i]+'"/> ' + subQueObj.optionvalue[i];
											policyTabHtml += '</div>';
										}

									}

									policyTabHtml += '</div>';

									questionArr.push(subQueData);
								});

								policyTabHtml += '</div></div>';
							});

							subgrp[year].push(questionArr);
						});

					});

					durePolicy.formData['form'+groupObj.groupid].push(subgrp);
			});

			if(userinfo != null){

				if(userInfoJSON.roles[0] == 7){

					/* ---- For multi-select country process -----*/
					// policyTabHtml += "<div class='col-md-offset-5'><a href='javascript:void(0)' class='btn btn-primary regResp' data-formid = 'form"+groupObj.groupid+"'>Select Country and Submit Response</a></div>";

					/* ---- For next-prev country process -----*/

					var countryArrList = userInfoJSON.countryIdList

					var countryIdIndex = countryArrList.indexOf(parseInt(dureComUtil.countryID));
					console.log("Country ID Index ---- ");
					console.log(countryIdIndex);

					if(countryIdIndex == 0){

						var prevUrlQueryStr = ''
						var nextUrlQueryStr = '?'+Base64.encode('countryid='+countryArrList[countryIdIndex+1])

					}else if(countryIdIndex == countryArrList.length-1){

						var prevUrlQueryStr = '?'+Base64.encode('countryid='+countryArrList[countryIdIndex-1]);
						var nextUrlQueryStr = '';

					}else{

						var prevUrlQueryStr = '?'+Base64.encode('countryid='+countryArrList[countryIdIndex-1]);
						var nextUrlQueryStr = '?'+Base64.encode('countryid='+countryArrList[countryIdIndex+1]);
					}

					policyTabHtml += "<div class='btn-group col-md-offset-4'>";
					policyTabHtml += "<a href='/app/policy.html"+prevUrlQueryStr+"' class='btn btn-primary'> < Prev Country </a>";
					policyTabHtml += "<a href='javascript:void(0)' class='btn btn-primary submitResp' data-formid = 'form"+groupObj.groupid+"'> Submit Response for "+countryName+"</a>";
					policyTabHtml += "<a href='/app/policy.html"+nextUrlQueryStr+"' class='btn btn-primary'> Next Country > </a>";
					policyTabHtml += "</div>";


				}else{

					policyTabHtml += "<div class='col-md-offset-5'><a href='javascript:void(0)' class='btn btn-primary  submitResp' data-formid = 'form"+groupObj.groupid+"'>Submit Response</a></div>";
				}
			}

			policyTabHtml += '</form>';

			// policyTabHtml += '</div><!-- End of Accordian -->';
			policyTabHtml += '</div>';
			tabCount++;

		});

		policyTabHtml += '</div>';  // Closing of tabContent.
		policyTabHtml += '</div>'; // Closing of class="nav-tabs-custom".

		$(document).on('click','.tablink',function(event){
			event.stopImmediatePropagation();

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

						if(grpId == groupObj.groupid && grpId != 2 && grpId != 0){

							$.each(yearObj,function(year,quesArray){

								var selected = '';

								if(year == currYear){

									selected = 'selected';

								}
							year = 'October 2016';
								yearOpt += '<option value="tabpane-'+grpId+'-'+subGrpObject.subgroupid+'" selected="'+selected+'" data-grpVal="'+grpId+'">'+year+'</option>'
							});
						}else if(grpId == groupObj.groupid && grpId == 0){

							console.log("Group iD:- 0000");
							console.log(groupObj.groupid);
							currYear = 'October 2016';
								yearOpt += '<option value="tabpane-'+grpId+'-'+subGrpObject.subgroupid+'" selected="selected" data-grpVal="'+grpId+'">'+currYear+'</option>';

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

			// For Regional Managers ...
			if(userInfoJSON != null){

				if(userInfoJSON.roles[0] == 7){

					console.log("Tablink clicked for regional.");
					console.log($(this).attr('id'));
					durePolicy.groupId = parseInt($(this).attr('id').split("-").pop());
					console.log("Group Id selected -");
					console.log(durePolicy.groupId);

					durePolicy.getPolicyDataQuestions();

				}
			}
		});


		$(document).on('click','.submitResp',function(){

			var formId = $(this).attr('data-formid');
			var currentYear = 2014;
			var formData = $('#'+formId).serializeArray();

			var userdata = dureUser.getUserInfo();

			var responseJson = {};

			responseJson['userid'] = userdata.userid;

			if(userInfoJSON != null){

				// For Regional Admin
				if(userInfoJSON.roles[0] == 7){


					/* ------- Enable below commented lines for multi-select countries submisssion --------*/

/* 					if($("[name='countrySelect']:checked").val() == 2){

						var countryArr = $('.countryDrop').val();
					}else{

						var countryArr = userInfoJSON.countryIdList
					} */

					/* ----  For next-prev country process added below lines ----- */
					var countryArr = [];
					countryArr.push(dureComUtil.countryID);
					// console.log(countryArr);


					responseJson['countries'] = [];

					$.each(countryArr,function(index,countryId){

						$.each(formData,function(index,formObj){

							var defaultData = durePolicy.formData[formId][0][currentYear][0];
							var updatedData = {};
							var subquestionId = formObj.name.split('-').pop();

							for(var index in defaultData){

								if(defaultData[index].subquestionid == subquestionId  &&  formObj.value != defaultData[index].subquestionval){

									// console.log("Inside the form data check");
									// console.log(formObj.value);
									// console.log(defaultData[index].subquestionval);

									updatedData['subquestionid'] = subquestionId;
									updatedData['value'] = formObj.value;
									updatedData['countryid'] = countryId;
									updatedData['status'] = 'Approved';

									if($.isArray(defaultData[index].rowid)){

										updatedData['rowid'] = defaultData[index].rowid[0];

									}else{

										updatedData['rowid'] = defaultData[index].rowid;
									}


									responseJson['countries'].push(updatedData);

									break;
								}

							}

						});

					});

					console.log(durePolicy.formData);
					console.log(responseJson);
					console.log(formData);

				}else{

					responseJson['countryid'] = dureComUtil.countryID;
					responseJson['subquestiondata'] = [];

					console.log(durePolicy.formData);
					console.log(formData);

					$.each(formData,function(index,formObj){

						var defaultData = durePolicy.formData[formId][0][currentYear][0];
						var updatedData = {};
						var subquestionId = formObj.name.split('-').pop();

						for(var index in defaultData){

							if(defaultData[index].subquestionid == subquestionId  &&  formObj.value != defaultData[index].subquestionval){

								console.log("Inside the form data check");
								console.log(formObj.value);
								console.log(defaultData[index].subquestionval);

								updatedData['subquestionid'] = defaultData[index].subquestionid;
								updatedData['value'] = formObj.value;

								responseJson['subquestiondata'].push(updatedData);
								break;
							}

						}
					});
				}
			}

			// console.log(responseJson)
			// console.log(JSON.stringify(responseJson));
			// console.log(formData);

			var serviceUrl = durePolicy.AppBaseURLContext+"dataapi/target/all/updateQuestion";
			dureService.updatePolicyResponse(serviceUrl,JSON.stringify(responseJson),durePolicy.updatePolicySuccess);

		});

		$(document).on('click','.regResp',function(){

			var regionalCountries = dureComUtil.countryListStr.substr(0,dureComUtil.countryListStr.lastIndexOf(','));

			// For COUNTRY DROPDOWN
			var selectOpt = dureControl.selectCountryDropDownOptions();

			var selectDrop = "<select id='tokenize' multiple='multiple' class='countryDrop tokenize-sample' style='width: 35%;'>"+selectOpt+"</select>"
			var previewContent = '<div class="col-md-12" style="margin-top:15px;" ><input name="countrySelect" value="1" type="radio" checked/><span>Selects all corresponding regional countries to apply this question</span> <button type="button" class="btn btn-xs impactCountry btn-info" data-toggle="popover" title="High Impact Countries" data-content="<div>'+regionalCountries+'</div>">Regional Countries</button></div>';
			previewContent += '<div class="col-md-12" style="margin-top:15px;" ><input name="countrySelect" value="2" type="radio"/><span>Selects particular countries to apply this question</span></div>';
			previewContent += '<div id="countrySelect" class="col-md-12" style="display:none;margin-top:15px;" >'+selectDrop+'</div>';
			previewContent	+= "<div class='col-md-offset-4'><a href='javascript:void(0)' class='btn btn-primary submitResp' data-formid = 'form"+durePolicy.groupId +"'>Submit Response</a></div>"

			$("#selectRegionalCountry").html(previewContent);

			var popover_template = '<div class="popover box-primary" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>';
			$('body').popover({ selector: '.impactCountry', html:true, template: popover_template, trigger: 'hover click', placement: 'auto', delay: {show: 50, hide: 400}})

			$('#tokenize').tokenize({'placeholder':'Search countries'});
			$("[name='countrySelect']").click(function(){

				if($("[name='countrySelect']:checked").val() == 2){

					$("#countrySelect").show();
				}else{
					$("#countrySelect").hide();
				}
			});

			$("#selectRegCountry").modal('show');

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
	}else{

		console.log("Alert: Data is in draft mode or there is no data for the given paramters. ")
	}

	if(durePolicy.getParameterByName('tabpane')) {
		var tabId = durePolicy.getParameterByName('tabpane');
		if(tabId == 0) {
			 var lastLiHref = $("#policySections ul li").last().find('a').attr('href');
			 $('a[href="'+ lastLiHref +'"]').tab('show');
		} else {
				$('a[href="#tabpane-' + tabId + '"]').tab('show');
		}

	}
  console.log($("#policySections li.active").find('a').html());
  
  if($("#policySections li.active").find('a').html() == 'Other Groups<span class="caret"></span>') {
    $("#selectedTab-name").html($("#otherGroups-contents li.active").find('a').html());
  } else {
    $("#selectedTab-name").html($("#policySections li.active").find('a').html());
  }

  
	$("#policySections li a").on('click',function() {
			$("#selectedTab-name").html($(this).html());
  });

};

durePolicy.updatePolicySuccess = function(resp){


	  swal("Response Submitted", "Your response has been submitted.", "success");

	  var currentPageUrl = window.location.href;
	  var pos = currentPageUrl.lastIndexOf('/');
	  var urlContext = currentPageUrl.substring(0,pos)+'/'
	  var sendMailUrl = urlContext+'sendemail.php';

	  var dataObj = {};

	  dataObj['emailto'] = 'samir@duretechnologies.com';
	  dataObj['emailfrom'] = 'roshan@duretechnologies.com';
	  dataObj['subject'] = 'Policy question for Approval';
	  dataObj['emailBody'] = 'User has submitted a response(s) for the policy question(s) and is waiting for your approval. ';
	  dataObj['sendOnlyMail'] = true;

	  console.log(sendMailUrl);
	  console.log(dataObj);
	  $("#selectRegCountry").modal('hide');
	  dureService.sendMail(sendMailUrl,dataObj,durePolicy.sendMailSuccess);
}

durePolicy.sendMailSuccess = function(resp){

	  console.log("Email sent successfully to users.");
	  console.log(resp);

}

durePolicy.enableLinks = function(){

	var userInfoJSON = dureUser.getUserInfo();
	if(userInfoJSON != null){

		// if(userInfoJSON.roles[0] == 7 || userInfoJSON.roles[0] == 6){
		if(userInfoJSON.roles[0] == 6){

			$('.dashboardLink').after('<a href="./addQuestion.html" class="btn btn-default" title="Add Policy Questions" style="margin-top: 6px; margin-right: 5px; float: right;">'+
				'<i class="fa fa-plus"></i> Add Policy Question'+
			'</a><a href="./policyApproval.html" class="btn btn-default apprBtn" title="Approve responses" style="margin-top: 6px; margin-right: 5px; float: right;">'+
					'<i class="fa fa-check-square-o"></i> Approve responses'+
				'</a>');

		}else if(userInfoJSON.roles[0] != 7 && userInfoJSON.roles[0] != 6){

			$('.dashboardLink').after('<a href="/app/addQuestion.html" class="btn btn-default" title="Rejected responses" style="margin-top: 6px; margin-right: 5px; float: right;">'+
				'<i class="fa fa-plus"></i> Add Policy Question'+
			'</a><a href="/app/policyReject.html" class="btn btn-default rejBtn" title="Rejected responses" style="margin-top: 6px; margin-right: 5px; float: right;">'+
				'<i class="fa fa-close"></i> Rejected responses'+
			'</a>');
		}
	}
}
