var dureRegion = {};



dureRegion.iniObj = function () {

  dureRegion.geoJsonHolder = null;
  dureRegion.checkRegion = true;
  dureRegion.dataHolder = null;
  dureRegion.geoJsonLayer = null;
  dureRegion.selectedYear = '2015';
  dureRegion.rangeOfYears = null;
  dureRegion.currentYearIndex = 0;
  dureRegion.getRegionData();
  dureRegion.slideNext();
  dureRegion.slidePrev();
  dureRegion.slidePlay();
}

dureRegion.preparelayout = function () {

  iHealthMap.removeLegendControl() // remove legend from the map
  dureOverlays.clearOverlays();    // remove overlayes from the map
  removeControlBarOverlay();
  dureOverlays.removeSelectLayers();
  iHealthMap.clearLayer();         // remove countries layer
  iHealthMap.map.removeLayer(dureUtil.maskGeoLayer); // remove mask layer form the map
  iHealthMap.removeSliderControl(); // remove year slider from the map

}

dureRegion.getShapeFile = function () {
  $.getJSON('data/region/who-region.json', function (resGeoJson) {
    console.log(resGeoJson);
    dureRegion.geoJsonHolder = resGeoJson;
    dureRegion.loadLayer();
    dureRegion.renderLegend();
  });
}

dureRegion.getRegionData = function () {
  // $.getJSON('data/region-data-temp.json', function(resData) {
  //    dureRegion.dataHolder = resData;
  //    console.log(dureRegion.dataHolder);
  //    callbackAfterDataInit();
  // });
//  dureUtil.setDataLevel('region');
//  dMap.setLevel('region');
  var indicatorID = dureUtil.indicatorId;
  var serviceUrl = "http://hivci.org/service/dataapi/indicator/world/data/?appid=62&langid=1&indicatorid=" + indicatorID + "&regionid=12&callback=dureRegion.callBackRegionData";
  //var serviceUrl = "http://hivci.org/service/dataapi/indicator/world/data/?appid=62&langid=1&indicatorid=168&regionid=12&cache=true&callback=dureRegion.callBackRegionData";
  console.log(serviceUrl);
  $.ajax({
    type: 'GET',
    url: serviceUrl,
    dataType: 'jsonp',
    contentType: 'application/json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    },
    error: function (request, textStatus, errorThrown) {

    }
  });
}

dureRegion.callBackRegionData = function (resData) {

  //  dMap.setLevel('region');
  dureRegion.dataHolder = resData;
  var utility = dureRegion.utilDataExtract();
  if (!jQuery.isEmptyObject(dureRegion.dataHolder.indicators)) {
    dureRegion.preparelayout();
    dureRegion.getShapeFile();
    dureRegion.rangeOfYears = Object.keys(utility.getObjFromArray(dureRegion.dataHolder.indicators, 'worldIndicatorData')['worldIndicatorData'][0]); //Object.keys(dureRegion.dataHolder.indicators[1].worldIndicatorData[0]);
    iHealthMap.rangeOfYears = dureRegion.rangeOfYears;
    iHealthMap.createSlideControl();
    dureRegion.currentYearIndex = (dureRegion.rangeOfYears.length - 1);
    $('#slideryear').text('Year ' + dureRegion.rangeOfYears[dureRegion.rangeOfYears.length - 1]);
    dureRegion.deActivateSliderControls();
    console.log(resData);
  } else {
    alert('Region Data is not Available');
    dureRegion.checkRegion = false;
    $('#c3').bootstrapToggle('off')    
  }

}


// function callback_GetWorldIndicatorData(resData) {
//   console.log(resData);
// }

dureRegion.loadLayer = function () {
  dureRegion.geoJsonLayer = L.geoJson(dureRegion.geoJsonHolder, {
    style: dureRegion.setLayerStyle,
    onEachFeature: dureRegion.setLayerFeature
  });

  iHealthMap.map.addLayer(dureRegion.geoJsonLayer);
}

dureRegion.setLayerStyle = function (feature) {
  var fillColorName = dureRegion.getFeatureFillClr(dureRegion.getFeatureVal(feature.properties.WHO_REGION));
  return {
    color: 'white',
    weight: 1,
    opacity: 1,
    fillColor: fillColorName,
    fillOpacity: 1,
    className: ''
  };
}

dureRegion.getFeatureVal = function (id) {
  var returnVal = -1;
  var last_year = dureRegion.rangeOfYears[dureRegion.currentYearIndex];
  //console.log(last_year);
  var utility = dureRegion.utilDataExtract();
  var dataObj = utility.getObjFromArray(dureRegion.dataHolder.indicators, 'worldIndicatorData');
  if (dataObj['worldIndicatorData'][0][last_year] != undefined && dataObj['worldIndicatorData'][0][last_year][0][id] != undefined) {
    returnVal = dataObj['worldIndicatorData'][0][last_year][0][id][0];
  }
  return returnVal;
}

dureRegion.getFeatureFillClr = function (value) {
  var returnColor = '#EEEEEE';
  //if(colorSet.scaleDataType == 'NUMBER' || colorSet.scaleDataType == 'PERCENTAGE') {
  var lowScale = dureRegion.dataHolder.indicatorMetaInfo[0].indicatorInfo.levels[0].scales[0].linear[0].lowScale;
  var highScale = dureRegion.dataHolder.indicatorMetaInfo[0].indicatorInfo.levels[0].scales[0].linear[0].highScale;
  var colorScale = dureRegion.dataHolder.indicatorMetaInfo[0].indicatorInfo.levels[0].scales[0].linear[0].colorScale;

  if (true) {
    if (value != undefined && value != -1) {
      var value = Number(value);
      if (value > highScale[highScale.length - 1]) {
        returnColor = colorScale[colorScale.length - 1];

      }
      else {
        for (var i = 0; i < lowScale.length; i++) {
          if (value >= lowScale[i] && value <= highScale[i]) {
            returnColor = colorScale[i];
            break;
          }
          if (value < lowScale[i]) {
            returnColor = colorScale[i];
            break;
          }
        }
      }
    }
  }

  //if(colorSet.scaleDataType == 'STRING') {
  if (false) {
    for (var i = 0; i < colorSet.scaleRange.length; i++) {
      if (value == colorSet.scaleRange[i]) {
        returnColor = colorSet.scaleColor[i];
        break;
      }
    }
  }


  return returnColor;
}

dureRegion.setLayerFeature = function (feature, layer) {
  var last_year = dureRegion.rangeOfYears[dureRegion.currentYearIndex];
  //console.log(last_year);
  var id = layer.feature.properties.WHO_REGION;
  var headerName = layer.feature.properties.WHO_Region_Name;
  var utility = dureRegion.utilDataExtract();
  var dataObj = utility.getObjFromArray(dureRegion.dataHolder.indicators, 'worldIndicatorData');
  var data = dataObj['worldIndicatorData'][0][last_year][0][id];
  var popUpContent = dureRegion.getHoverLabel(headerName, data);
  layer.bindLabel(popUpContent);

  layer.on({
    mouseover: dureRegion.highlightFeature,
    mouseout: dureRegion.resetFeature
  });

}



dureRegion.highlightFeature = function (e) {
  var layer = e.target;
  layer.setStyle({
    weight: 2,
    color: 'white',
    dashArray: '',
    fillOpacity: 1
  });
}

dureRegion.resetFeature = function (e) {
  dureRegion.geoJsonLayer.resetStyle(e.target);
}


dureRegion.removeLayer = function () {
  iHealthMap.map.removeLayer(dureRegion.geoJsonLayer); // remove mask layer form the map(dureRegion.geoJsonLayer)
}

dureRegion.renderLegend = function () {

  // console.log("========= Rendering the legend and updating legend to province level ===========");
  //console.log(province.jsondata);
  var legend = {}; // TODO
  var lowScale = dureRegion.dataHolder.indicatorMetaInfo[0].indicatorInfo.levels[0].scales[0].linear[0].lowScale;


  legend.indicatorName = dureRegion.dataHolder.indicatorMetaInfo[0].indicatorInfo.indicatorName;


  if (dureRegion.dataHolder.indicatorMetaInfo[0].indicatorInfo.levels != undefined) {
    $.each(dureRegion.dataHolder.indicatorMetaInfo[0].indicatorInfo.levels, function (index, levelObject) {

      if (levelObject.levelName == 'World Region') {

        legend.colorScale = levelObject.scales[0].linear[0].colorScale;
        legend.highScale = levelObject.scales[0].linear[0].highScale;
        legend.lowScale = levelObject.scales[0].linear[0].lowScale;
        legend.scaleDesc = levelObject.scales[0].linear[0].scaleDesc;
      } else {
        console.log("Current level is not province level.");
      }
    });
  }

  iHealthMap.renderLegend(legend);

}

// Unbinds slider controlS attached to the elements at region level.
dureRegion.deActivateSliderControls = function () {
  console.log("Deactivating controls");
  $("#sliderNext").unbind("click");
  $("#sliderPrev").unbind("click");
  $("#sliderPlay").unbind("click");
  $("#sliderNext").attr('id', 'sliderNextReg');
  $("#sliderPrev").attr('id', 'sliderPrevReg');
  $("#sliderPlay").attr('id', 'sliderPlayReg');
};

dureRegion.removelegend = function () {

}


dureRegion.loadChart = function () {

}

dureRegion.loadDataTable = function () {

}



// util
dureRegion.utilDataExtract = function () {
  return {
    getObjFromArray: function (objInArray, matchObj) {
      if (Array.isArray(objInArray)) {
        for (var i = 0; i < objInArray.length; i++) {
          if (objInArray[i].hasOwnProperty(matchObj)) {
            return objInArray[i];
            break;
          }
        }
      }
    }
  };
}


dureRegion.getHoverLabel = function (headerName, rawData) {
  var labelcontent = [];
  if (rawData) {
    for (var i = 0; i < rawData[0].length; i++) {
      labelcontent.push('<span>' + rawData[1][i] + '</span>: <span class="badge bg-badge">' + (rawData[0][i]) + '</span>');
    }
  } else {
    labelcontent.push('<span>Data not available</span><br/>');
  }
  return dureRegion.buildHoverPopupHtml(headerName, labelcontent.join('<br>'));
}


dureRegion.buildHoverPopupHtml = function (header, data) {

  var html = '<div class="box box-primary box-solid box-transparent">' +
          '<div class="box-header" data-toggle="tooltip" title="" data-original-title="Header tooltip">' +
          '<h5 class="box-title">' + header + '</h5>' +
          '</div>' +
          '<div class="box-body">'
          + data +
          '</div>' +
          '</div>';

  return html;
}


// toggle

function toggleView(checkObj) {
  if ($(checkObj).is(':checked')) {
    dureRegion.iniObj();
  } else {
    if (dureRegion.checkRegion) {
      dureRegion.removeLayer();
      $('.resetMap').trigger('click');
    }
  }
}




// Functionality for next button
dureRegion.slideNext = function () {
  $(document).on('click', '#sliderNextReg', function () {
    console.log("-----------: Region Next clicked ------");
    dureRegion.currentYearIndex++;
    console.log(dureRegion.currentYearIndex);
    if (dureRegion.currentYearIndex < dureRegion.rangeOfYears.length && dureRegion.currentYearIndex >= 0) {
      // console.log("-----------Line 373: Province Next clicked Inside if cond------");
      $(this).addClass('sliderNextRed');

      if (iHealthMap.setCurrentyear(dureRegion.rangeOfYears[dureRegion.currentYearIndex])) {
        $('#slideryear').text('Year ' + dureRegion.rangeOfYears[dureRegion.currentYearIndex]);
        dureRegion.onYearChange(dureRegion.currentYearIndex);
      }
    } else {
      dureRegion.currentYearIndex--;
    }
  });
};

// Functionality for previous button
dureRegion.slidePrev = function () {
  $(document).on('click', '#sliderPrevReg', function () {
    console.log("----------- Region Prev clicked ------");
    dureRegion.currentYearIndex--;
    // console.log("Current year index aftr == " + province.currentYearIndex);
    if (dureRegion.currentYearIndex < dureRegion.rangeOfYears.length && dureRegion.currentYearIndex >= 0) {
      $(this).addClass('sliderPrevRed');

      if (iHealthMap.setCurrentyear(dureRegion.rangeOfYears[dureRegion.currentYearIndex])) {
        $('#slideryear').text('Year ' + dureRegion.rangeOfYears[dureRegion.currentYearIndex]);
        dureRegion.onYearChange(dureRegion.currentYearIndex);
      }
    } else {
      dureRegion.currentYearIndex++;
    }
  });
};


// Functionality for Play button                          // 24/8/2015
dureRegion.slidePlay = function () {
  $(document).on('click', '#sliderPlayReg', function () {
    console.log('ss');
    $(this).hide();
    $('#sliderPause').show();
    $('#sliderPause').removeClass('hide');
    var slideDuration = 1300;
    var crntIndex = dureRegion.currentYearIndex;
    dureRegion.playInterval = setInterval(function () {
      dureRegion.currentYearIndex++;
      if (dureRegion.currentYearIndex > dureRegion.rangeOfYears.length - 1) {
        dureRegion.currentYearIndex = 0;
      }

      if (crntIndex == dureRegion.currentYearIndex) {

        $('#sliderPause').hide();
        $('#sliderPlayReg').show();
        clearInterval(dureRegion.playInterval);
        console.log('clear')
      }

      $('#slideryear').text('Year ' + dureRegion.rangeOfYears[dureRegion.currentYearIndex]);
      //iHealthMap.onYearChange(iHealthMap.currentYearIndex);
      dureRegion.onYearChange(dureRegion.currentYearIndex);
    }, slideDuration);
  });
};


//Change functionality
dureRegion.onYearChange = function (index) {
  dureOverlays.clearOverlays();
  //subprovince.clearLayer();
  //local.clearMarkers();
  dMap.setLevel('country');
  if (index != undefined) {
    dureRegion.currentYear = dureRegion.rangeOfYears[index];
  } else {
    dureRegion.currentYear = iHealthMap.currentYear;
  }
  dureRegion.loadLayer();
  $('#year-modal').modal('hide');
}
