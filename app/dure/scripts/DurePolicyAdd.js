
// Initialize function
durePolicyAdd.initialize = function(){

	durePolicyAdd.AppBaseURLContext = dureConfig.AppBaseURLContext;
	durePolicyAdd.appId = 62;
	durePolicyAdd.langId = 1;
	durePolicyAdd.countryISO2Code;
	durePolicyAdd.geoJson = {};
	durePolicyAdd.countryList = [];
	durePolicyAdd.getPolicyDataQuestions();
};

// Get Policy Data
durePolicyAdd.getPolicyDataQuestions = function(){

	console.log("This is s policy get data questions.....");

	var countryId = dureComUtil.getCountryId();
	console.log("Country Id = "+ countryId);

	 var userinfo = localStorage.getItem("userJson");

	 if(userinfo != null){

		var userInfoJSON = JSON.parse(userinfo);
		var userid = userInfoJSON.userid;

	 }else{

		 var userid = 0;
	 }

	 var serviceUrl = durePolicyAdd.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid='+countryId+'&userid='+userid+'&status=Publish&callback=durePolicyAdd.callback_PolicyData';
	 console.log(serviceUrl);

	 dureService.getPolicyQuestions(serviceUrl);
};

// Callback Policy Data
durePolicyAdd.callback_PolicyData = function(resp){

	console.log(resp);

	durePolicyAdd.respData = resp;
	durePolicyAdd.groupArr = [];
	durePolicyAdd.subGroupArr = [];

	var groupOptions = "<option>Select Group</option>";
	var subGroupOptions = "<option>Select SubGroup</option>";

	var userinfo = localStorage.getItem("userJson");

	var questionGrps = resp.locationProfile.groups;

	$.each(questionGrps,function(grpIndex,grpObj){

		var newGrpObj = {"groupid":grpObj.groupid,"groupname":grpObj.groupname};
		durePolicyAdd.groupArr.push(newGrpObj);

		groupOptions += "<option value="+grpObj.groupid+">"+grpObj.groupname+"</option>"

		$.each(grpObj.data,function(subGrpIndex,subGrpObj){

			var newSubGrpObj = 	{"groupid":grpObj.groupid,"subgroupid":subGrpObj.subgroupid,"subgroupname":subGrpObj.subgroupname};
			durePolicyAdd.subGroupArr.push(newSubGrpObj);
		});

	});

	$('[name=oldGroupName]').html(groupOptions);
	$('[name=oldSubGroupName]').html(subGroupOptions);

	$('[name=oldGroupName]').change(function(){

		var subGroupOptions =  "<option>Select SubGroup</option>";
		var selectedVal = $('[name=oldGroupName]').val();

		$.each(durePolicyAdd.subGroupArr,function(subGrpIndex,subGrpObj){

			if(selectedVal == subGrpObj.groupid){

				subGroupOptions += 	"<option value="+subGrpObj.subgroupid+">"+subGrpObj.subgroupname+"</option>";
			}

		});

		$('[name=oldSubGroupName]').html(subGroupOptions);

	});

	// console.log(durePolicyAdd.groupArr);
	// console.log(durePolicyAdd.subGroupArr);

	var ele = $('#questionGrp1').clone();

	console.log($(ele[0]['children'][1]).children());

	durePolicyAdd.addAnotherQuestion();
	durePolicyAdd.createPreview();
};


// Add Policy Questions
durePolicyAdd.addAnotherQuestion = function(){

	$('.addQuestion').click(function(){

		var questionGrpElements = $('.questionGrp').length;

		var questionHtml = $('#questionGrp1').clone();

		$.each(questionHtml.children(),function(key,htmlObj){

			if($(htmlObj).hasClass("form-group")){

				var elementName = $(htmlObj).find(":input").attr("name");
				elementName = elementName.slice(0,-1)
				$(htmlObj).find(":input").attr("name",elementName+(questionGrpElements+1));
				if(elementName == 'subQuestionDef'){

					$(htmlObj).hide();
				}

			}else if($(htmlObj).hasClass("addLabel")){

				$(htmlObj).attr("class","addLabel"+(questionGrpElements+1));
				$(htmlObj).hide();
				$(htmlObj).html("");
			}
		});

		$('.questionGrp').last().after("<div class='box-footer questionGrp' id='questionGrp"+(questionGrpElements+1)+"' >"+questionHtml.html()+"</div>")

		$('[name="subQuestion'+(questionGrpElements+1)+'"]').click(function(){
				console.log("this is clicked")

			if($('[name="subQuestion'+(questionGrpElements+1)+'"]:checked').val() == 1){

				$('[name="subQuestionDef'+(questionGrpElements+1)+'"]').parents('.form-group').show();
			}else{

				$('[name="subQuestionDef'+(questionGrpElements+1)+'"]').parents('.form-group').hide();
			}
		});

		$('.labelDrop').change(function(){

			var lblVal = $(this).val();

			console.log(lblVal);

			var addLabelElements = '';

			for(var i=0;i < lblVal;i++){

				var labelHtml = '<div class="form-group">'+
								  '<label for="inputEmail3" class="col-sm-3 control-label">Define Label</label>'+
								  '<div class="col-sm-6">'+
									'<input name="questionLabel-'+(questionGrpElements+1)+'-'+(i+1)+'" type="text" class="form-control optionValue" placeholder="Add Label">'+
								  '</div>'+
								'</div>';


				addLabelElements += labelHtml;
			}

			console.log(addLabelElements);

			$('.addLabel'+(questionGrpElements+1)).html(addLabelElements);
			$('.addLabel'+(questionGrpElements+1)).show();

		});

	});
}

// Create a preview and then approve.
durePolicyAdd.createPreview = function(){

	$('.previewBtn').click(function(){

		$('.myform').submit(false);

		var previewJson = {};
		var currentYear = 2014; // Current year hardcoded.

		previewJson.addquestion = [];



		var  previewContent = '';
		var formData = $('.myform').serializeArray();

		var questionCount = $('.questionGrp').length;
		var questionGrps = $('.questionGrp');

		var i = 0;

		$.each(questionGrps,function(index,questionGrpObj){

			var questionObj = {};

			// For GROUP NAME
			if($('[name="optionsGroupRadios"]:checked').val() == 0){

				if(i == 0){

					previewContent += '<div class="policyQuestion policyGrpName col-md-12" style="font-size:18px">'+$("[name='oldGroupName'] option:selected").text()+'</div>';
				}
				questionObj['groupid'] = $("[name='oldGroupName']").val();
				questionObj['groupname'] = $("[name='oldGroupName'] option:selected").text();

			}else{

				if(i == 0){

					previewContent += '<div class="policyQuestion policyGrpName col-md-12" style="font-size:18px">'+$("[name='newGroupName']").val()+'</div>';
				}
				questionObj['groupid'] = 0;
				questionObj['groupname'] = $("[name='newGroupName']").val();
			}

			// For SUBGROUP NAME
			if($('[name="optionsGroupRadios"]:checked').val() == 0){

				if($('[name="optionsSubGrpRadios"]:checked').val() == 0){


					console.log("New OldSubGroup Name");
					if(i == 0){
						previewContent += '<div class="subQuestionGrpName policySubGrpName col-md-12">'+$("[name='oldSubGroupName'] option:selected").text()+'</div>';
					}
					questionObj['subgroupid'] = $("[name='oldSubGroupName']").val();
					questionObj['subgroupname'] = $("[name='oldSubGroupName'] option:selected").text();

				}else{

					console.log("New SubGroup Name");
					if(i == 0){

						previewContent += '<div class="subQuestionGrpName policySubGrpName col-md-12" >'+$("[name='newSubGroupName']").val()+'</div>';
					}
					questionObj['subgroupid'] = 0;
					questionObj['subgroupname'] = $("[name='newSubGroupName']").val();

				}

			}else{

				console.log("New SubGroup Name");

				if(i == 0){

					previewContent += '<div class="subQuestionGrpName policySubGrpName col-md-12" >'+$("[name='newSubGroupName']").val()+'</div>';
				}
				questionObj['subgroupid'] = 0;
				questionObj['subgroupname'] = $("[name='newSubGroupName']").val();
			}

			// For QUESTION DEFINATION
			previewContent += '<div class="policyQuestion questionDef col-md-offset-1 col-md-11" >'+$(questionGrpObj).find('.questionDef').val()+'</div>';
			questionObj['question'] = $(questionGrpObj).find('.questionDef').val();

			// For SUB-QUESTION DEFINATION
			if($(questionGrpObj).find(".subQuestion:checked").val() == 1){
				previewContent += '<div class="col-md-offset-1 col-md-11 subQuestionDef" >'+$(questionGrpObj).find('.subQuestionDef').val()+'</div>';
				questionObj['subquestion'] = $(questionGrpObj).find('.subQuestionDef').val();
			}else{

				questionObj['subquestion'] = "";
			}

			// For Answer Type
			var answerType = $(questionGrpObj).find(".answerType").val();
			questionObj['valuetype'] = answerType;

			// For Count
			if(answerType == 'text'){

				var count = 0;

			}else{

				var count = $(questionGrpObj).find(".countType").val();
			}

			questionObj['nooffields'] = count;

			//For YEAR
			questionObj['year'] = currentYear;

			// For INPUT ELEMENTS
			questionObj['optionvalue'] = []

			if(answerType == 'radio' || answerType == 'checkbox'){

				var optionValArr = $(questionGrpObj).find(".optionValue");
				$.each(optionValArr,function(index,inputEleObj){

					var label = $(inputEleObj).val();
					previewContent += '<div class="inputType col-md-offset-1 col-md-11"> <input disabled type="'+answerType+'"/> '+label+' </div>';
					questionObj['optionvalue'].push(label);

				});

			}else if(answerType == 'dropdown'){

				var optionValArr = $(questionGrpObj).find(".optionValue");
				previewContent += '<div class="inputType col-md-offset-1  col-md-11" ><select class="form-control">';

				$.each(optionValArr,function(index,inputEleObj){

						var label = $(inputEleObj).val();
						previewContent += '<option value='+label+'>'+label+'</option>';
						questionObj['optionvalue'].push(label);
				});

				previewContent += '</select> </div>'

			}else if(answerType == 'text'){

				previewContent += '<div class="inputType col-md-offset-1 col-md-11"><input disabled type="'+answerType+(i+1)+'" class="form-control"/></div>';
				questionObj['optionvalue'].push("");
			}

			previewJson.addquestion.push(questionObj);
			i++;
		});

		console.log(previewJson);

		previewContent += '<div class="col-md-12" style="margin-top:15px;" ><input checked name="countrySelect" value="0" type="radio"/><span>Selects all countries to apply this question</span></div>';
		previewContent += '<div class="col-md-12" style="margin-top:15px;" ><input name="countrySelect" value="1" type="radio"/><span>Selects high impact countries to apply this question</span> <button type="button" class="btn btn-xs impactCountry btn-danger" data-toggle="popover" title="High Impact Countries" data-content="<div>KENYA, MALAWI, MOZAMBIQUE, NIGERIA, PAKISTAN, RUSSIA, SOUTH AFRICA, TANZANIA, UGANDA, UKRAINE, ZAMBIA, ZIMBABWE, BOTSWANA, CAMEROON, CHINA, COTE D^IVORE, ETHOPIA, INDIA, INDONESIA</div>">High Impact Countries</button></div>';
		previewContent += '<div class="col-md-12" style="margin-top:15px;" ><input name="countrySelect" value="2" type="radio"/><span>Selects particular countries to apply this question</span></div>';



		// For COUNTRY DROPDOWN
		var selectOpt = dureControl.selectCountryDropDownOptions();
		var selectDrop = "<select id='tokenize' multiple='multiple' class='countryDrop tokenize-sample' style='width: 35%;'>"+selectOpt+"</select>"
		previewContent += '<div id="countrySelect" class="col-md-12" style="display:none;margin-top:15px;" >'+selectDrop+'</div>';



		previewContent += '<div class="col-md-offset-4 col-md-8" style="margin-top:15px;" ><button type="submit" class="btn btn-primary backBtn" style="margin-right:10px;">Back</button><button type="submit" class="btn btn-primary submitPreview">Submit</button></div>';
		$("#addpolicyQSection").html(previewContent);

		var popover_template = '<div class="popover box-primary" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>';
		$('body').popover({ selector: '.impactCountry', html:true, template: popover_template, trigger: 'hover click', placement: 'auto', delay: {show: 50, hide: 400}})

		$('#add-policyQ-modal').modal(true);

		$('#tokenize').tokenize({'placeholder':'Search countries'});

		$("[name='countrySelect']").click(function(){

			if($("[name='countrySelect']:checked").val() == 2){

				$("#countrySelect").show();
			}else{
				$("#countrySelect").hide();
			}
		});

		$('.backBtn').click(function(){

			$('#add-policyQ-modal').modal('hide');
		});

		durePolicyAdd.submitPreview(previewJson);

	});
};

durePolicyAdd.submitPreview = function(previewJson){

	 var userinfo = localStorage.getItem("userJson");

	 if(userinfo != null){

		var userInfoJSON = JSON.parse(userinfo);
		var userid = userInfoJSON.userid;

	 }else{

		 var userid = 0;
	 }

	$('.submitPreview').click(function(){

		if($("[name='countrySelect']:checked").val() == 0){
			$.each(previewJson.addquestion,function(previewIndex,previewObject){
				previewJson.addquestion[previewIndex]['country'] = dureComUtil.countryIDArray;
			});

		}else if($("[name='countrySelect']:checked").val() == 1){

			$.each(previewJson.addquestion,function(previewIndex,previewObject){

			previewJson.addquestion[previewIndex]['country'] = dureComUtil.impactCountryIDArray;

			});
		}else{

			$.each(previewJson.addquestion,function(previewIndex,previewObject){

				previewJson.addquestion[previewIndex]['country'] = $('.countryDrop').val();
			});
		}

		console.log(previewJson);
		var groupId = previewJson.addquestion[0].groupid;
		var serviceUrl = durePolicyAdd.AppBaseURLContext + 'dataapi/target/all/addQuestion';

		dureService.addPolicyQuestion(serviceUrl,JSON.stringify(previewJson),durePolicyAdd.addPolicySuccess.bind(null,groupId));
	});

};

durePolicyAdd.addPolicySuccess = function(groupId){

	var dataObj = {};

	$("#add-policyQ-modal").modal('hide');
	swal({
	  title: "Question Submission",
	  text: "Your policy question has been added.",
	  type: "success"
	},
	function(){

		 var currentPath = window.location.href.slice(0, window.location.href.lastIndexOf('/'));
		 var pageName = 'policy.html';
		 var redirectUrl = currentPath + "/" + pageName + "?tabpane=" + groupId;

			setTimeout(function() {
				window.location = redirectUrl;
			}, 250);

		  //$('a[href="#tabpane-21"]').tab('show');
	});

	//swal("Question Submission", "Your policy question has been added.", "success");



	// var currentPageUrl = window.location.href;
	// var pos = currentPageUrl.lastIndexOf('/');
	// var urlContext = currentPageUrl.substring(0,pos)+'/'
	// var sendMailUrl = urlContext+'sendemail.php';

	// dataObj['emailto'] = 'samir@duretechnologies.com';
	// dataObj['emailfrom'] = 'shone@duretechnologies.com';
	// dataObj['subject'] = 'New Policy Question Submission';
	// dataObj['emailBody'] = 'A user has submitted a new policy question and needs  ';
	// dataObj['sendOnlyMail'] = true;

	// console.log(sendMailUrl);
	// console.log(dataObj);

	// dureService.sendMail(sendMailUrl,dataObj,durePolicyApproval.sendMailSuccess);


};


$(document).ready(function(){

	$('.labelDrop').change(function(){

		var lblVal = $('.labelDrop').val();


		var addLabelElements = '';

		for(var i=0;i < lblVal;i++){

			var labelHtml = '<div class="form-group">'+
							  '<label for="inputEmail3" class="col-sm-3 control-label">Define Label</label>'+
							  '<div class="col-sm-6">'+
								'<input name="questionLabel-1-'+(i+1)+'" type="text" class="form-control optionValue" placeholder="Add Label">'+
							  '</div>'+
							'</div>';


			addLabelElements += labelHtml;
		}

		$('.addLabel').html(addLabelElements);
		$('.addLabel').show();

	});


	if($('[name="optionsGroupRadios"]:checked').val() == 0){

		$('[name="newGroupName"]').parents('.form-group').hide();
	}

	$('[name="optionsGroupRadios"]').click(function(){

		if($('[name="optionsGroupRadios"]:checked').val() == 0){

			$('[name="newGroupName"]').parents('.form-group').hide();
			$('[name="newSubGroupName"]').parents('.form-group').hide();

			$('[name="oldGroupName"]').parents('.form-group').show();
			$('[name="oldSubGroupName"]').parents('.form-group').show();
			$('[name="optionsSubGrpRadios"]').parents('.form-group').show();

		}else{

			$('[name="newGroupName"]').parents('.form-group').show();
			$('[name="newSubGroupName"]').parents('.form-group').show();

			$('[name="oldGroupName"]').parents('.form-group').hide();
			$('[name="oldSubGroupName"]').parents('.form-group').hide();
			$('[name="optionsSubGrpRadios"]').parents('.form-group').hide();
		}
	});


	if($('[name="optionsSubGrpRadios"]:checked').val() == 0){

		$('[name="newSubGroupName"]').parents('.form-group').hide();
	}

	$('[name="optionsSubGrpRadios"]').click(function(){

		if($('[name="optionsSubGrpRadios"]:checked').val() == 0){

			$('[name="newSubGroupName"]').parents('.form-group').hide();
			$('[name="oldSubGroupName"]').parents('.form-group').show();

		}else{

			$('[name="newSubGroupName"]').parents('.form-group').show();
			$('[name="oldSubGroupName"]').parents('.form-group').hide();
		}
	});

	if($('[name="subQuestion1"]:checked').val() == 0){

		$('[name="subQuestionDef1"]').parents('.form-group').hide();
	}

	$('[name="subQuestion1"]').click(function(){

		if($('[name="subQuestion1"]:checked').val() == 1){

			$('[name="subQuestionDef1"]').parents('.form-group').show();
		}else{

			$('[name="subQuestionDef1"]').parents('.form-group').hide();
		}
	});

});
