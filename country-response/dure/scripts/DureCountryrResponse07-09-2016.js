$(document).ajaxStart(function(){
    //$("#ihmap").addClass('block-component');
  $('.container').block({ 
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
  $('.container').unblock();
});

dureCountryResponseObj = {};

dureCountryResponseObj.initilize = function() {
  dureCountryResponseObj.AppBaseURL = 'http://hivci.org/';
  dureCountryResponseObj.AppBaseURLContext = 'http://hivci.org/service/';
  dureCountryResponseObj.getCountryListJson();
  dureCountryResponseObj.getPolicyQuestions();
}

dureCountryResponseObj.getCountryListJson = function() {
  
  var serviceUrl = dureCountryResponseObj.AppBaseURLContext+'dataapi/target/all/countryData?callback=dureCountryResponseObj.callback_GetCountryJson';
  var serviceObj = {
      type:'GET',
      url:serviceUrl,
      dataType: 'jsonp',
      contentType: 'application/json',
      crossDomain : true
  }
  
   $.ajax(serviceObj);
};


dureCountryResponseObj.callback_GetCountryJson = function(countryList) {
  var countrySortedData = dureCountryResponseObj.sortData(countryList.features);
  var optionSelectTemplate = '<option >Select Country </option>';
  countrySortedData.filter(function(e) {
    //countryIdMapping
    //console.log();
    optionSelectTemplate += '<option value= ' + countryIdMapping[e.properties['iso_a3']].countryId + '-' + e.properties.iso_a2 + '>' + e.properties.name + '</option>'
  });

  $('#country-dropdown').html(optionSelectTemplate);

  //bind on change event
  $( "#country-dropdown" ).change(function(e) {
      var countryId = $(this).val().split('-')[1].toLowerCase();
      var countryName = $("option:selected", this).text();
      $('.f32 span').removeClass();
      $('.f32 span').addClass('flag');
      $('.f32 span').addClass(countryId);
      $('#country-name').text(countryName);
  });
}


dureCountryResponseObj.sortData = function(dataArray) {
  
  return dataArray.sort(function (a, b) {
      if (a.properties.name > b.properties.name) {
      return 1;
    }
    if (a.properties.name < b.properties.name) {
      return -1;
    }
    // a must be equal to b
    return 0;
  });
}

dureCountryResponseObj.getPolicyQuestions = function() {
  var serviceUrl =   dureCountryResponseObj.AppBaseURLContext+'dataapi/target/all/policyData/?&locationid=1&userid=0&status=Publish&callback=dureCountryResponseObj.callback_PolicyData';
  var serviceObj = {
      type:'GET',
      url:serviceUrl,
      dataType: 'jsonp',
      contentType: 'application/json',
      crossDomain : true
    }
    console.log(serviceUrl);
   $.ajax(serviceObj);
}


dureCountryResponseObj.callback_PolicyData = function(policyData) {
  var countryResponseData = policyData.locationProfile.groups.filter(function(e) { 
      if( e.groupid == 19 ) {
        return e.groupid;
      }
  });

  dureCountryResponseObj.prepareHtmlTemplate(countryResponseData[0].data[0].year[0]['2016']);
}

dureCountryResponseObj.prepareHtmlTemplate = function(data) {
  var htmlTemplate = '';
  data.filter(function(e, k){
     
     // currently hardcode change it later
     if(k ==0) { 
      htmlTemplate += '<h2>' + (e.question) + '</h2>';
      htmlTemplate += '<div class="row">';
      e.subquestion.filter(function(subQ, i) {
          //if(subQ.valuetype[0]  == 'text'){
            var iconname = i == 0  ?  'glyphicon-user' : i == 1 ? 'glyphicon-user' : i == 2 ? 'glyphicon glyphicon-envelope' : '';
            htmlTemplate +='<div class="col-xs-4 col-sm-4 col-md-4">'
                     + '<div class="form-group">'
                     +   '<label class="control-label">' + subQ.subquestion + '</label>'
                     +     '<div class="inputGroupContainer">'
                     +      '<div class="input-group">'
                     +           '<span class="input-group-addon">'
                     +              '<i class="glyphicon ' + iconname + '"></i>'
                     +            '</span>'
                     +              '<input  required data-subqid="'+ subQ.subquestionid +' "type=' + subQ.valuetype[0] + ' placeholder="" class="form-control"  />'
                     +          '</div>'
                     +       '</div>'
                     +   '</div>'
                     +  '</div>';
          //}  
      });
      htmlTemplate += '</div>';
    }

    if(k == 1) {
      htmlTemplate += '<h2>' + (e.question) + '</h2>';
      htmlTemplate += '<div class="row"><div class="col-md-12">';
      e.subquestion.filter(function(subQ, i) {
         
              htmlTemplate += '<div class="form-group">'
                     +   '<legend class="control-label">' + subQ.subquestion + '</legend>'
                     +     '<div class="inputGroupContainer">';

                     var iconname = 'glyphicon glyphicon-pencil';
                     if(subQ.valuetype[0] == 'text') {
                         htmlTemplate +=  '<div class="input-group">'
                                + '<span class="input-group-addon">'
                                +  '<i class="glyphicon ' + iconname + '"></i>'
                                + '</span>'
                                +   '<textarea  type=' + subQ.valuetype[0] + ' placeholder="" data-subqid="'+ subQ.subquestionid +'" class="form-control"  rows="6"/>'
                                + '</div>';
                        
                     } else {
                       subQ.optionvalue.filter(function(subQOption, j) {
                         var req = j == 0 ? 'required' : ''
                         htmlTemplate +=  '<label class="radio-inline"><input '+req+' data-subqid="'+subQ.subquestionid+'" type="radio" value="'+subQOption+'" name="optradio'+i+'">'+subQOption+'</label>'  
                       }); 
                     }
                     
                            
                     
            htmlTemplate += '</div><hr>'
                     +   '</div>'
                     +  '</div></div>';
           
      });
      htmlTemplate += '</div></div>'
    }

  });

 
  $('#country-response-form').prepend(htmlTemplate);
}




$("#submit-response").on('click', function() {

  var validationObj = dureCountryResponseObj.validateForm();
 
   if(validationObj.check) {
    sweetAlert("Oops...", "Form submission incomplete! Please fill complete form", "error");
    return false;
   }
  
  swal( {  
      title: "Are you sure?",  
      text: "Please confirm to submit the response",
      type: "warning",
      showCancelButton: true,
     // confirmButtonColor: "#DD6B55",
      confirmButtonText: "Confirm",
    showLoaderOnConfirm: true,
     closeOnConfirm: false 
   }, function(){
      dureCountryResponseObj.submitResponse();
      swal({   title: "Response Submitted!",   text: "Your response has been submitted",   type: "success",
      }, function() {   
         //location.href = 'http://hivci.org/';
         location.reload();
       });
     }); 

});


dureCountryResponseObj.submitResponse = function() {
 


  var responseObj = {
    "userid" : 0,
    "countryid" : $('#country-dropdown option:selected').val().split('-')[0],
    "subquestiondata" : [ ]
  }


   $('input[type=text]').each(function(e){
     var questionVal = $(this).val();
     var questionId = $(this).attr('data-subqid');
     responseObj['subquestiondata'].push({subquestionid: questionId,  value: questionVal});
   });

    $('input:radio:checked').each(function(e){
     var questionVal = $(this).val();
     var questionId = $(this).attr('data-subqid');
      responseObj['subquestiondata'].push({subquestionid: questionId,  value: questionVal});
    });

    $('textarea').each(function(e){
     var questionVal = $(this).val();
     var questionId = $(this).attr('data-subqid');
      responseObj['subquestiondata'].push({subquestionid: questionId,  value: questionVal});
    });
  

  var serviceUrl = dureCountryResponseObj.AppBaseURLContext+"dataapi/target/all/updateQuestion";
  var serviceObj ={
      type:'POST',
      url:serviceUrl,
      contentType: 'application/json',
      data: JSON.stringify(responseObj),
      success:function(resp) {
        //console.log(resp);
      }
    }
   $.ajax(serviceObj);   
}


// validation

dureCountryResponseObj.validateForm = function() {

  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;  
  var inValid = {
    check: false,
    message:[]
  };

  
  [].forEach.call(  document.querySelectorAll('#country-response-form input[type=text]:required'), function (e,i) {
	  
	  if($(e).val() == '') {
        inValid.check = true;
      }
	  
  });



    [].forEach.call( document.querySelectorAll('#country-response-form input[type=email]:required'),function(e,i) {
    
      if(!$(e).val().match(mailformat)) {
        inValid.check = true;
      } 
    });

    [].forEach.call( document.querySelectorAll('#country-response-form input[type=radio]:required'), function(e,i) {
        var radioName = $(e).attr('name');
        
        if($('input[name="'+radioName+'"]:checked').val() == undefined) {
           inValid.check = true;  
        }
    });

    if($('#country-dropdown option:selected').val() == "Select Country") {
       inValid.check = true; 
    }

    return inValid; 
}