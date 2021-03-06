$(document).ajaxStart(function () {
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
}).ajaxStop(function () {
  $('.container').unblock();
});

dureCountryResponseObj = {};

dureCountryResponseObj.initilize = function () {
  dureCountryResponseObj.AppBaseURL = 'http://hivci.org/';
  dureCountryResponseObj.AppBaseURLContext = 'http://hivci.org/service/';
  dureCountryResponseObj.getCountryListJson();
  dureCountryResponseObj.getPolicyQuestions();
}




dureCountryResponseObj.getCountryListJson = function () {

  var serviceUrl = dureCountryResponseObj.AppBaseURLContext + 'dataapi/target/all/countryData?callback=dureCountryResponseObj.callback_GetCountryJson';
  var serviceObj = {
    type: 'GET',
    url: serviceUrl,
    dataType: 'jsonp',
    contentType: 'application/json',
    crossDomain: true
  }

  $.ajax(serviceObj);
};


dureCountryResponseObj.callback_GetCountryJson = function (countryList) {
  var countrySortedData = dureCountryResponseObj.sortData(countryList.features);
  var optionSelectTemplate = '<option >Select Country </option>';
  countrySortedData.filter(function (e) {
    //countryIdMapping
    //console.log();
    if(countryIdMapping[e.properties['iso_a3']].countryId == 1) {
      $('.f32 span').addClass('flag');      
      $('.f32 span').addClass(e.properties.iso_a2.toLowerCase());
      $('#country-name').text(e.properties.name);
      optionSelectTemplate += '<option selected value= ' + countryIdMapping[e.properties['iso_a3']].countryId + '-' + e.properties.iso_a2 + '>' + e.properties.name + '</option>'
    } else {
      optionSelectTemplate += '<option value= ' + countryIdMapping[e.properties['iso_a3']].countryId + '-' + e.properties.iso_a2 + '>' + e.properties.name + '</option>'
    }
  });

  $('#country-dropdown').html(optionSelectTemplate);

  //bind on change event
  $("#country-dropdown").change(function (e) {
    var countryId = $(this).val().split('-')[1].toLowerCase();
    var locationId = $(this).val().split('-')[0].toLowerCase();
    var countryName = $("option:selected", this).text();
    $('.f32 span').removeClass();
    $('.f32 span').addClass('flag');
    $('.f32 span').addClass(countryId);
    $('#country-name').text(countryName);
    //console.log(locationId);

    var serviceUrl = dureCountryResponseObj.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid=' + locationId + '&userid=0&status=Publish&callback=dureCountryResponseObj.callback_PolicyData';
    var serviceObj = {
      type: 'GET',
      url: serviceUrl,
      dataType: 'jsonp',
      contentType: 'application/json',
      crossDomain: true
    }
    console.log(serviceUrl);
    $.ajax(serviceObj);

  });
}


dureCountryResponseObj.sortData = function (dataArray) {

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

dureCountryResponseObj.getPolicyQuestions = function () {
  var serviceUrl = dureCountryResponseObj.AppBaseURLContext + 'dataapi/target/all/policyData/?&locationid=1&userid=0&status=Publish&callback=dureCountryResponseObj.callback_PolicyData';
  var serviceObj = {
    type: 'GET',
    url: serviceUrl,
    dataType: 'jsonp',
    contentType: 'application/json',
    crossDomain: true
  }
  console.log(serviceUrl);
  $.ajax(serviceObj);
}


dureCountryResponseObj.callback_PolicyData = function (policyData) {
  var countryResponseData = policyData.locationProfile.groups.filter(function (e) {
    if (e.groupid == 20) {
      return e.groupid;
    }
  });
  console.log(countryResponseData);
  dureCountryResponseObj.prepareHtmlTemplate(countryResponseData[0].data[0].year[0]['2014']);
}

dureCountryResponseObj.prepareHtmlTemplate = function (data) {
  var htmlTemplate = '';
  var count = 0;
  $('#country-response-form .reposequestion').remove();
  htmlTemplate += '<div class="reposequestion">';
  data.filter(function (e, k) {
    // currently hardcode change it later
//    if (false) { //if(k ==0) { 
//      
//      htmlTemplate += '<h2>' + (e.question) + '</h2>';
//      htmlTemplate += '<div class="row">';
//      e.subquestion.filter(function (subQ, i) {
//        //if(subQ.valuetype[0]  == 'text'){
//        var iconname = i == 0 ? 'glyphicon-user' : i == 1 ? 'glyphicon-user' : i == 2 ? 'glyphicon glyphicon-envelope' : '';
//        htmlTemplate += '<div class="col-xs-4 col-sm-4 col-md-4">'
//                + '<div class="form-group">'
//                + '<label class="control-label">' + subQ.subquestion + '</label>'
//                + '<div class="inputGroupContainer">'
//                + '<div class="input-group">'
//                + '<span class="input-group-addon">'
//                + '<i class="glyphicon ' + iconname + '"></i>'
//                + '</span>'
//                + '<input  required data-subqid="' + subQ.subquestionid + ' "type=' + subQ.valuetype[0] + ' placeholder="" class="form-control"  />'
//                + '</div>'
//                + '</div>'
//                + '</div>'
//                + '</div>';
//        //}  
//      });
//      htmlTemplate += '</div>';
//    }

    //if (k == 0) {
    htmlTemplate += '<h2>' + (e.question) + '</h2>';
    htmlTemplate += '<div class="row"><div class="col-md-12">';
    e.subquestion.filter(function (subQ, i) {
      //console.log(subQ.valuetype[0])
      htmlTemplate += '<div class="form-group">'
              + '<legend class="control-label">' + subQ.subquestion + '</legend>'
              + '<div class="inputGroupContainer">';

      var iconname = 'glyphicon glyphicon-pencil';

      if (subQ.valuetype[0] == 'text') {
        htmlTemplate += '<div class="input-group">'
                + '<span class="input-group-addon">'
                + '<i class="glyphicon ' + iconname + '"></i>'
                + '</span>'
                + '<textarea  type=' + subQ.valuetype[0] + ' placeholder="" data-subqid="' + subQ.subquestionid + '" class="form-control"  rows="6"/>'
                + '</div>';

      } else if (subQ.valuetype[0] == 'dropdown') {
        console.log(subQ.answer1);
        htmlTemplate += '<select class="form-control selecdropdown" data-subqid="' + subQ.subquestionid + '">';
        subQ.optionvalue.filter(function (subQOption, j) {
          var req = j == 0 ? 'required' : ''
          if (subQ.answer1 == null) {
            htmlTemplate += '<option  value="' + subQOption + '">' + subQOption + '</option>'
          } else {
            if (subQ.answer1[0] == subQOption) {
              htmlTemplate += '<option selected value="' + subQOption + '">' + subQOption + '</option>'
            } else {
              htmlTemplate += '<option  value="' + subQOption + '">' + subQOption + '</option>'
            }
          }
        });
        htmlTemplate += '</select>';
      } else if (subQ.valuetype[0] == 'checkbox') {

        subQ.optionvalue.filter(function (subQOption, j) {
          var req = j == 0 ? 'required' : ''
          htmlTemplate += '<div>';
          htmlTemplate += '<label class="checkbox-inline"><input ' + req + ' data-subqid="' + subQ.subquestionid + '" type="checkbox" value="' + subQOption + '" name="optradio' + count + '">' + subQOption + '</label>'
          htmlTemplate += '</div>';
        });

      }
      else {
        subQ.optionvalue.filter(function (subQOption, j) {
          var req = j == 0 ? 'required' : ''
          htmlTemplate += '<label class="radio-inline"><input ' + req + ' data-subqid="' + subQ.subquestionid + '" type="radio" value="' + subQOption + '" name="optradio' + count + '">' + subQOption + '</label>'
        });
      }



      htmlTemplate += '</div><hr>'
              + '</div>';
      count++;

    });
    htmlTemplate += '</div></div>'
    //}

  });
  htmlTemplate += '</div>';

  $('#country-response-form').prepend(htmlTemplate);
}




$("#submit-response").on('click', function () {

  var validationObj = dureCountryResponseObj.validateForm();

  if (validationObj.check) {
    sweetAlert("Oops...", "Form submission incomplete! Please fill complete form", "error");
    return false;
  }

  swal({
    title: "Are you sure?",
    text: "Please confirm to submit the response",
    type: "warning",
    showCancelButton: true,
    // confirmButtonColor: "#DD6B55",
    confirmButtonText: "Confirm",
    showLoaderOnConfirm: true,
    closeOnConfirm: false
  }, function () {
    dureCountryResponseObj.submitResponse();
    swal({title: "Response Submitted!", text: "Your response has been submitted", type: "success",
    }, function () {
      //location.href = 'http://hivci.org/';
      location.reload();
    });
  });

});


dureCountryResponseObj.submitResponse = function () {



  var responseObj = {
    "userid": 0,
    "countryid": $('#country-dropdown option:selected').val().split('-')[0],
    "subquestiondata": []
  }


  $('input[type=text]').each(function (e) {
    if ($(this).attr('data-subqid') != undefined) {
      var questionVal = $(this).val();
      var questionId = $(this).attr('data-subqid');
      responseObj['subquestiondata'].push({subquestionid: questionId, value: questionVal});
    }
  });

  $('input:radio:checked').each(function (e) {
    var questionVal = $(this).val();
    var questionId = $(this).attr('data-subqid');
    responseObj['subquestiondata'].push({subquestionid: questionId, value: questionVal});
  });
  
  var checkarray = [];
  var checkquestionId = '';
  $('input:checkbox:checked').each(function (e) {
    var questionVal = $(this).val();
    var questionId = $(this).attr('data-subqid');
    checkarray.push(questionVal);
    checkquestionId = questionId;
  });  
  if (checkarray) {
    responseObj['subquestiondata'].push({subquestionid: checkquestionId, value: checkarray.join()});
  }

  $('select.selecdropdown').each(function (e) {
    var questionVal = $(this).val();
    var questionId = $(this).attr('data-subqid');
    responseObj['subquestiondata'].push({subquestionid: questionId, value: questionVal});
  });


  $('textarea').each(function (e) {
    var questionVal = $(this).val();
    var questionId = $(this).attr('data-subqid');
    responseObj['subquestiondata'].push({subquestionid: questionId, value: questionVal});
  });

  console.log(responseObj);
  var serviceUrl = dureCountryResponseObj.AppBaseURLContext + "dataapi/target/all/updateQuestion";
  var serviceObj = {
    type: 'POST',
    url: serviceUrl,
    contentType: 'application/json',
    data: JSON.stringify(responseObj),
    success: function (resp) {
      //console.log(resp);
    }
  }
  $.ajax(serviceObj);
}


// validation

dureCountryResponseObj.validateForm = function () {

  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var inValid = {
    check: false,
    message: []
  };


  [].forEach.call(document.querySelectorAll('#country-response-form input[type=text]:required'), function (e, i) {

    if ($(e).val() == '') {
      inValid.check = true;
    }

  });



  [].forEach.call(document.querySelectorAll('#country-response-form input[type=email]:required'), function (e, i) {

    if (!$(e).val().match(mailformat)) {
      inValid.check = true;
    }
  });

  [].forEach.call(document.querySelectorAll('#country-response-form input[type=radio]:required'), function (e, i) {
    var radioName = $(e).attr('name');

    if ($('input[name="' + radioName + '"]:checked').val() == undefined) {
      inValid.check = true;
    }
  });


  [].forEach.call(document.querySelectorAll('#country-response-form input[type=checkbox]:required'), function (e, i) {
    var radioName = $(e).attr('name');
    if ($('input[name="' + radioName + '"]:checked').val() == undefined) {
      inValid.check = true;
    }
  });

  if ($('#country-dropdown option:selected').val() == "Select Country") {
    inValid.check = true;
  }

  return inValid;
}


// Download country support responses

if (dureUser.checkUserLoginStatus()) {

  $("#download-file").removeClass('hide');

  $("#download-file").on('click', function () {

    var downloadURL = dureCountryResponseObj.AppBaseURLContext + 'dataapi/exportExcel?groupid=20&subgroupid=21';
    window.open(downloadURL);
  });
}
