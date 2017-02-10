/*************************************** Section: Initialize and Load Map object *********************************************/
var iHealthMap = {};
var baseMaps = {};
var baseLayer = {};
iHealthMap.dataProviderCopy = {};
iHealthMap.dataProviderWorkingCopy = {};
iHealthMap.dataProviderWorkingFilteredCopy = {};
iHealthMap.dataProviderWorkingFilteredCountryCopy = {};
// All properties and methods initialized.
iHealthMap.initialize = function () {
  //console.log("Line 7 : Initializing maps for first time.");
  // remove layer
  province.clearLayer();
  iHealthMap.name = 'iHealth Map';
  iHealthMap.version = 'v0.1';
  iHealthMap._lat = 10.725;
  iHealthMap._long = 12.27;
  // iHealthMap._defaultZoom = 1; //Made change here -- Shone
  iHealthMap._defaultZoom = 2;
  iHealthMap._maxZoom = 18;
  // iHealthMap.jsondata = null;
  // iHealthMap.jsonStdData = null;
  // iHealthMap.jsonNonStdData = null;
  iHealthMap.geoJson = {};
  iHealthMap.geojsonLayer = null;
  iHealthMap.geojsonCountry = [];
  iHealthMap.geocoder = null;
  iHealthMap.zoom = null;
  iHealthMap.ggl = null;
  iHealthMap.markerTemp = null;
  if (google != undefined) {
    iHealthMap.geocoder = new google.maps.Geocoder();
  }
  iHealthMap.legendControl = null;
  iHealthMap.legendControlData = null;
  // iHealthMap.sliderControl = '';
  iHealthMap.currentYearIndex = 0;
  iHealthMap.minYearValue = 0;
  iHealthMap.maxYearValue = 0;
  iHealthMap.rangeOfYears = [];
  iHealthMap.level = 'region';
  iHealthMap.dataLevel = 'indicator';
  iHealthMap.indicatorType = 'Standard';
  iHealthMap.country = '';
  iHealthMap.isFilterApplied = 0;
  iHealthMap.filterParams = [];
  iHealthMap.dataProvider = {};
  iHealthMap.isRegionFilterChanged = false;
  iHealthMap.regionFilter = "";
  iHealthMap.filterType = "";
  iHealthMap.mapPanelWidth = 0;
  iHealthMap.mapPanelHeight = 0;
  iHealthMap.mapHeight = 0;
  iHealthMap.mapFullscreenZoom = 0;
  iHealthMap.geocodeRes = {};
  iHealthMap.dbClickCrntObj = null             // TODO 17/5/2015
  iHealthMap.renderMap();
  iHealthMap.collapseBtnClick();
  iHealthMap.FilterDataArr = [];
  filterLayerContainer('ISO_3_CODE', false, []);
  iHealthMap.playInterval = null;  // play interval for play button
  if (dureUtil.indicatorId == 170 || dureUtil.indicatorId == 168) {
    renderBarOverlay();
  }
  dureUtil.resetButtonControl();
};

//Renders the map as required to the map container .
iHealthMap.renderMap = function () {

  iHealthMap.initMap(iHealthMap._lat, iHealthMap._long);
};

// Initialized the map values and load map tiles
iHealthMap.initMap = function (_lat, _lng) {
  // baseLayer = new L.StamenTileLayer('toner', {
  // detectRetina: true
  // });

  if (_lat != undefined && _lng != undefined) {
    iHealthMap._lat = _lat;
    iHealthMap._long = _lng;
  }
  iHealthMap.map = new L.Map('ihmap', {
    center: new L.LatLng(iHealthMap._lat, iHealthMap._long),
    zoom: iHealthMap._defaultZoom,
    crs: L.CRS.EPSG4326                                    // Map projection equirectangular
            // layers:[baseLayer]
  });

  // scale

  var graphicScale = L.control.graphicScale({
    doubleLine: false,
    fill: 'fill',
    showSubunits: false,
    labelPlacement: 'top',
    position: 'bottomright'
  }).addTo(iHealthMap.map);

  // Credit DureTech for their wonderful Maps
  iHealthMap.map.attributionControl.addAttribution('<a href="http://www.duretechnologies.com/" title="Dure Technologies">Powered by Dure Technologies</a>');
  //Setting map panel width.
  iHealthMap.mapPanelWidth = $('.connectedSortable').width();
  iHealthMap.mapPanelHeight = $("#map-panel").height();
  iHealthMap.mapHeight = $("#ihmap").height();
  iHealthMap.mapFullscreenZoom = iHealthMap._defaultZoom;
  console.log(iHealthMap.mapPanelWidth);
  if (dCore.onlineStatus()) {
    iHealthMap.loadMapTiles();
  } else {
    //console.log("----------------------Offline Map ------------------------");
  }
};

// Load map tiles .
iHealthMap.loadMapTiles = function () {
  iHealthMap.map.doubleClickZoom.disable();
  // Google Layer
  iHealthMap.ggl = new L.Google();
  // var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  //var osmUrl='http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.png';
  //var osmUrl='https://cartocdn_{s}.global.ssl.fastly.net/base-antique/{z}/{x}/{y}.png';
  var osmUrl = 'https://cartocdn_{s}.global.ssl.fastly.net/base-eco/{z}/{x}/{y}.png';
  var osm = new L.TileLayer(osmUrl, {minZoom: iHealthMap._defaultZoom, maxZoom: 12, continuousWorld: false, noWrap: true, attribution: "Dure Technologies@2016"});

  // Mapbox Layer
  // L.mapbox.accessToken = '<your access token here>'
  // iHealthMap.mapBox = L.mapbox.tileLayer('https://api.tiles.mapbox.com/v3/examples.map-0l53fhk2.json');

  /*baseMaps = {
   "Google Maps": iHealthMap.ggl,
   "Open Street Map" : osm
   };*/
  var emptyTiles = L.tileLayer('');
  baseMaps = {
    ' ': emptyTiles
  };

  iHealthMap.map.addLayer(emptyTiles);
  // iHealthMap.map.addLayer(iHealthMap.ggl);
  //iHealthMap.map.addLayer(osm);
  iHealthMap.map.invalidateSize();

};

/**************************************************** Section: Map Data  ***************************************************/

// Fetches data from provider.
iHealthMap.getDataFromProvider = function () {
  //console.log('============================== Fetching data from provider ===================================');
  console.log(iHealthMap.getIndicatorDataType());

  if (iHealthMap.checkDataLevel == 0) {
    iHealthMap.dataProvider = iHealthMap.jsondata.data;
  } else {
    if (iHealthMap.getIndicatorDataType() == 'Standard') {
      iHealthMap.dataProvider = iHealthMap.getStdIndDataForMap();
    } else {
      iHealthMap.dataProvider = iHealthMap.getNonStdIndDataForMap();
    }
  }
  //console.log(iHealthMap.dataProvider);

  return iHealthMap.dataProvider;
  // iHealthMap.jsondata = iHealthMap.fetchDataFromStorage();
  // if(iHealthMap.jsondata != undefined){
  // return true;
  // }else{
  // //console.log("No data in provider/local storage.");
  // }
};

// Checks data in provider.
iHealthMap.checkDataInProvider = function () {
  if (iHealthMap.jsondata != undefined) {
    return true;
  } else if (iHealthMap.checkIfKeyExsistInStorage()) {
    if (iHealthMap.getDataFromProvider()) {
      return true;
    }
  }
  return false;
}

// Sets the data which is needed to show in the map .
iHealthMap.setDataForMap = function (data) {
  console.log("=========Setting map data.==========");
  //console.log(data);
  iHealthMap.jsondata = data;
  iHealthMap.dataProviderCopy = $.extend(true, {}, iHealthMap.jsondata);
  iHealthMap.setIndicatorDataType();
  console.log("Loading");
  if (iHealthMap.checkDataLevel() == 0) {

  } else {
    //console.log(iHealthMap.getIndicatorDataType());
    if (iHealthMap.getIndicatorDataType() == 'Standard') {
      iHealthMap.setStdIndDataForMap(data);
    } else {
      //console.log(data);
      iHealthMap.setNonStdIndDataForMap(data);
    }
  }
  return true;
};

// Set standard data for Map
iHealthMap.setStdIndDataForMap = function (param) {
  console.log("Setting std map data.");
  //console.log(param);
  iHealthMap.jsonStdData = param[0];
  //console.log(param);
  iHealthMap.dataProviderWorkingCopy = $.extend(true, {}, param[0]);
  return true;
}

// Get standard data for Map
iHealthMap.getStdIndDataForMap = function () {
  //console.log("Line 149: FETCHING std map data.");
  return iHealthMap.jsonStdData;
}

// Set non-standard data for Map
iHealthMap.setNonStdIndDataForMap = function (param) {
  //console.log("Line 152: Setting non std map data.");
  //console.log("setNonStdIndDataForMap");
  //if(param[2].worldIndicatorDataExt[0])
  //console.log(param);
  iHealthMap.jsonNonStdData = param[0];
  iHealthMap.dataProviderWorkingCopy = $.extend(true, {}, param[0]);
  return true;
}

// Set non-standard data for Map
iHealthMap.getNonStdIndDataForMap = function () {
  //console.log("Line 159: Fetching non std map data.");
  //console.log(iHealthMap.jsonNonStdData);
  return iHealthMap.jsonNonStdData;
};

// Set the indicator data type
iHealthMap.setIndicatorDataType = function () {
  iHealthMap.indicatorType = dureUtil.getIndicatorMetaInfoByParam('dataFormat');
  return true;
}

// Get the indicator data type - standard/non-standard
iHealthMap.getIndicatorDataType = function () {
  return iHealthMap.indicatorType;
}

// Check Data Level
iHealthMap.checkDataLevel = function () {
  if (iHealthMap.dataLevel == 'target') {
    return 0
  } else {
    return 1;
  }
};

// Check Indicator Data type
iHealthMap.checkIndicatorDataType = function () {
  return iHealthMap.indicatorType;
}

// Fetch data from local storage if it exsist for the key .
iHealthMap.fetchDataFromStorage = function () {

  return dureUtil.retrieveFromLocal('Target_' + dureUtil.appId + '_' + dureUtil.targetId + '_' + dureUtil.langId);
}

// Check if the key is there in the jsStorage .
iHealthMap.checkIfKeyExsistInStorage = function () {

  if (dureUtil.retrieveFromLocal('Target_' + dureUtil.appId + '_' + dureUtil.targetId + '_' + dureUtil.langId)) {
    return true;
  }
  return false;
}

/************************************************ Section : Leaflet Layer ***************************************************/

// Load the Geojson layer which you want to.
iHealthMap.loadLayer = function () {
  var layer = {};

  var filterGroupsData = dureUtil.respJsonData.filterGroups;

  for (var i = 0; i < filterGroupsData.length; i++) {
    for (var j = 0; j < filterGroupsData[i].filterSubGroups.length; j++) {
      for (var k = 0; k < filterGroupsData[i].filterSubGroups[j].filters.length; k++) {
        var tempArr = [];
        tempArr = [filterGroupsData[i].filterSubGroups[j].filters[k].filterName, filterGroupsData[i].filterSubGroups[j].filters[k].filterColor];
        iHealthMap.FilterDataArr.push(tempArr);
      }
    }
  }

  if (dureUtil.checkIfKeyExsist('WORLD_GEOJSON') == true) {
    //console.log('Fetching geojson layer from jStorage');
    iHealthMap.clearLayer();
    iHealthMap.geoJson = dureUtil.retrieveFromLocal('WORLD_GEOJSON');
    iHealthMap.addStyle();
    // invokeIncomeLevel();
    iHealthMap.renderMapControls();
  } else {
    iHealthMap.clearLayer();
    layer = iHealthMap.formatLayerObj();
    iHealthMap.geoJson.features = layer.features;
    iHealthMap.geoJson.type = layer.type;
    //console.log(iHealthMap.geoJson);
    iHealthMap.addStyle();
    iHealthMap.renderMapControls();
    // dureOverlays.initialize();

    //invokeIncomeLevel();
    // //console.log(iHealthMap.geoJson);
    // $.getJSON('data/world.geo.json', function(result) {
    // //console.log("Response is coming");
    // //console.log(result);
    // iHealthMap.clearLayer();
    // iHealthMap.geoJson =result;
    // /* dureUtil.storeAtLocal('WORLD_GEOJSON',result); // Commented by Shone to remove caching */
    // iHealthMap.addStyle();
    // invokeIncomeLevel();
    // iHealthMap.renderMapControls();
    // });
  }
  dureUtil.addMaskOnMap();
  dureUtil.applyDropShaddowEffect(iHealthMap.map);                // hover animation effect
  return true;
};

iHealthMap.formatLayerObj = function () {
  var layer = {};
  layer.data = L.countries;
  layer.features = [];
  iHealthMap.geoJson.features = [];
  layer.type = "FeatureCollection";
  for (var outer in worldGeo.features) {
    for (var inner in layer.data) {
      if (worldGeo.features[outer].properties.iso_a3 == inner) {
        var innerObject = {};
        innerObject = layer.data[inner].features[0];
        innerObject.properties = {};
        innerObject.properties.iso_a3 = inner;
        innerObject.properties.iso_a2 = inner;
        innerObject.properties.name = worldGeo.features[outer].properties.name;
        layer.features.push(innerObject);

      }
    }
  }
  return layer;
};

function filterLayerContainer(baseKey, apply, container) {
  var layerFilter = {};
  layerFilter.baseKey = baseKey
  layerFilter.apply = apply;
  layerFilter.container = container;
  return layerFilter;
}

// Add styles to the layer that is added .
iHealthMap.addStyle = function (layerFilter) {
  if (!layerFilter) {
    var layerFilter = {};
    layerFilter.baseKey = 'ISO_3_CODE';
    layerFilter.apply = false;
    layerFilter.container = [];
  }
  //console.log("Line 224: Styling the world map for the given data");
  var styling = {};
  styling.data = '';
  styling.filterParams = [];
  if (iHealthMap.checkFilter() == 1) {
    styling.filterParams = iHealthMap.getFilterParam();
    // console.log(iHealthMap.filterType);
    // if(iHealthMap.filterType == 'region'){
    // styling.filterParams = iHealthMap.getRegionFilter();
    // }else{
    // styling.filterParams = iHealthMap.getFilterParam();
    // }
    console.log(styling.filterParams);

    if (styling.filterParams == 'Gavi' || styling.filterParams == 'Non-Gavi') {
      console.log("Region Filter called.");
      console.log(styling.filterParams);
      console.log(iHealthMap.checkRegionFilterChange());

      // On filter change clears data object copy and clears the option.
      if (iHealthMap.checkRegionFilterChange()) {

        iHealthMap.dataProviderWorkingFilteredCopy = {};
        iHealthMap.clearFilterOptions();
        iHealthMap.isRegionFilterChanged = false;
      }

      var regionData = [];
      var regionFlag = false;
      for (var index in dureMasterRegionList) {
        for (regionName in dureMasterRegionList[index]) {
          if (regionName == styling.filterParams) {
            regionData = dureMasterRegionList[index][regionName];
            regionFlag = true;
            break;
          }
        }
        if (regionFlag) {
          break;
        }
      }

      // console.log(regionData);
      styling.data = iHealthMap.getFilteredRegions(regionData);
    } else {
      console.log("Data Filter called.");
      styling.data = iHealthMap.getFilteredData(styling.filterParams);
    }
    //console.log("Line 241: Filtered Data below.");
    //console.log(styling.data);
  } else {
    console.log("Data without any filter called.");
    styling.data = iHealthMap.getDataFromProvider();
    //console.log("Line 245:Initial Data below.");
    //console.log(styling.data);
  }

  iHealthMap.geojsonLayer = L.geoJson(iHealthMap.geoJson, {
    filter: function (feature) {
      return filterLayer(feature, layerFilter);
    }, // show only selected layers
    style: style,
    onEachFeature: onEachFeature
  });

  function filterLayer(feature, layerFilter) {
    var returnFilter = true;
    if (layerFilter.apply) {
//			console.log(layerFilter);
      var id = feature.properties[layerFilter.baseKey];
      returnFilter = idParser(layerFilter.container, id);
    }
    return returnFilter;
  }
  function idParser(container, id) {
    var retCheck = false;
    for (var i in container) {
      if (container.hasOwnProperty(i)) {
        if (container[i][0] === id) {
          retCheck = true;
          break;
        } else {
          if (container[i] === id) {
            retCheck = true;
            break;
          }
        }
      }
    }
    return retCheck;
  }


  iHealthMap.geojsonLayer.addTo(iHealthMap.map);

  function style(feature) {
    var styleObj = getColorForRegion(feature.properties);
    if (dureUtil.scaleRangeCat.apply) {
      prepareScaleWiseRegionList(styleObj, feature.properties)
    }
    var classNam = 'range-' + styleObj.scaleColor.replace(new RegExp('#', 'g'), "");
    var colorHEX = "#FFFFFF";
    var layerWeight = 1;
    var fillRule = 'evenodd';
    var strokeProp = true;

    var blackBorderCountryISOArr = ["NGA", "THA", "IDN", "ZWE", "KEN", "PER", "ETH", "MLI", "MOZ", "SDN", "NER", "ARM", "BEN", "CMR", "CPV", "DJI", "GIN", "FJI", "GNB", "HTI", "KHM", "LSO", "MMR", "MNG", "NIC", "NPL", "OMN", "PAN", "SEN", "SSD", "TGO", "UKR"];
    if ($.inArray(feature.properties.iso_a3, blackBorderCountryISOArr) > -1 && dureUtil.indicatorId == 170) {
      colorHEX = "#000000";
      layerWeight = 1;
      fillRule = 'nonzero';
      strokeProp = true;
    }

    return {
      weight: layerWeight,
      opacity: 1,
      stroke: strokeProp,
      color: colorHEX,
      fillOpacity: 0.7,
      fillColor: styleObj.scaleColor,
      fillRule: fillRule,
      className: classNam
    };
  }

  // Get the style of the layer ()
  function getLayerStyle(layer) {
    var layerStyleObj = {};
    if (layer.options != undefined) {
      layerStyleObj.className = layer.options.className;
      layerStyleObj.fillColor = layer.options.fillColor;
    } else {
      var getLeafletId = layer._leaflet_id;
      var ftrlayer = layer._layers;
      layerStyleObj.className = ftrlayer[getLeafletId - 1].options.className;
      layerStyleObj.fillColor = ftrlayer[getLeafletId - 1].options.fillColor;
    }
    return layerStyleObj;
  }

  // Seperate Countries according to their scale value
  function prepareScaleWiseRegionList(styleObj, properties) {

    var scaleRangeName = 'range-' + styleObj.scaleColor.replace(new RegExp('#', 'g'), "");
    var countryName = properties.name;
    var metaContainer = [];
    if (!dureUtil.scaleRangeCat.regionList.hasOwnProperty(scaleRangeName)) {
      dureUtil.scaleRangeCat.regionList[scaleRangeName] = [];
    }
    metaContainer.push(countryName);
    metaContainer.push(styleObj.scaleValue);
    dureUtil.scaleRangeCat.regionList[scaleRangeName].push(metaContainer);
  }

  function onEachFeature(feature, layer) {

    var popup_content = buildPopup();
    if (popup_content != undefined) {
      if (dureUtil.indicatorId == 233 || dureUtil.indicatorId == 232 || dureUtil.indicatorId == 218) {
        popup_content = popup_content.replace("<span class='badge bg-badge'>1</span>", "<span class='badge bg-badge'>Available</span>");
      }
      layer.bindLabel(popup_content);
    }

    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight
    });

    $(layer).click(function (e) {
      var that = this;
      setTimeout(function () {
        var dblclick = parseInt($(that).data('double'), 10);
        if (dblclick > 0) {
          $(that).data('double', dblclick - 1);
        } else {
          dureUtil.setCountryRegionId(countryIdMapping[layer.feature.id].regionId); // TODO 16/3/2015
          dureUtil.setCountryId(countryIdMapping[layer.feature.id].countryId);  // set countryId (get id from codes.js)
          dureUtil.setIsoCode(layer.feature.properties.iso_a3);
          iHealthMap.dbClickCrntObj = e;
          changeRegionInfo();
          if (dureUtil.indicatorId == 233 || dureUtil.indicatorId == 232 || dureUtil.indicatorId == 218) {
            $('.loadChart, .drillDown').hide();
          } else {
            $('.loadChart, .drillDown').show();
          }

          iHealthMap.setCountryName(layer.feature.properties.name);
          if (e.target.feature.properties.iso_a3 == 'COD') {         //  **doc only for Demo. of congo
            $('.other-docs').addClass('hide');
            $('.COD-docs').removeClass('hide');
          } else {
            $('.other-docs').removeClass('hide');
            $('.COD-docs').addClass('hide');
          }

          if (dureUtil.indicatorId == 232 || dureUtil.indicatorId == 233 || dureUtil.getIndicatorId() == 234 || dureUtil.getIndicatorId() == 218) {

            if (dureUtil.getIndicatorId() == 234) {
              console.log("This is IndicatorId");
              durePopup.getDataForPopup(layer.feature.properties.iso_a3, dureUtil.getCountryId());
            } else if (dureUtil.getIndicatorId() == 218) {

              //var filePath = window.location.href  + 'policy.html?countryid='+dureUtil.getCountryId();
              //window.open(filePath);
              console.log("This is IndicatorId");
              console.log(dureUtil.getIndicatorId());
              durePopup.getPolicyDataQuestions(dureUtil.getCountryId());

            } else {

              if (dureUtil.temp_accessFilePaths[layer.feature.id]) {
                var filePath = window.location.href.split('#')[0] + dureUtil.temp_accessFilePaths[layer.feature.id].document_path;
                window.open(encodeURI(filePath), "_blank");
              }
            }
          }
          else {

            //console.log('Country ID:' + countryIdMapping[layer.feature.id].countryId);
            durePopup.getData(countryIdMapping[layer.feature.id].countryId);
          }
        }
      }, 300);
    }).dblclick(function (e) {
      $(this).data('double', 2);
      console.log("-------------- Drill downs to country level on dbl click -------");

      if (e.target.feature.id == "IDN") {
        window.open("http://hivzeroportal.org/viz/");
      }
      else if (e.target.feature.id == "THA") {
        window.open("http://www.aidszeroportal.org/response.php#response4");
      } else {

        dureUtil.setCountryRegionId(countryIdMapping[layer.feature.id].regionId);
        dureUtil.setCountryId(countryIdMapping[layer.feature.id].countryId);  // set countryId (get id from codes.js)
        dureUtil.getDataOnDrillDown();
        iHealthMap.dbClickCrntObj = e;
        // Deactivates REGION-LEVEL functionality of slider.
        removeControlBarOverlay();
        iHealthMap.deActivateSliderControls();
      }
    });


    function changeRegionInfo() {
      iHealthMap.OpenInfoContainer();
      var countryCode = layer.feature.properties.iso_a3;
      showCountryInfo();
      iHealthMap.changeChartInfoForCountry(countryCode);
    }

    function showCountryInfo() {
      var popInfo = {};
      popInfo.data = styling.data;
      popInfo.regData = '';
      popInfo.regExtData = '';
      popInfo.keyContent = '';
      popInfo.extContent = '';
      popInfo.content = '';
      popInfo.level = iHealthMap.checkDataLevel();
      popInfo.countryName = layer.feature.properties.name;

      if (popInfo.data != undefined) {
        if (iHealthMap.checkDataLevel() == 0) {
          popInfo.regData = selectTargetDataByParamFromJson('region');
          popInfo.regExtData = selectTargetDataByParamFromJson('regionExt');
        } else if (iHealthMap.checkDataLevel() == 1) {
          popInfo.regData = selectIndicatorDataByParamFromJson('region');
          popInfo.regExtData = selectIndicatorDataByParamFromJson('regionExt');
        }
        if (popInfo.regData != '') {

          popInfo.keyContent = buildPopupContent(popInfo.regData, popInfo.level);
        }
        if (popInfo.regExtData != '') {
          popInfo.extContent = buildPopupContent(popInfo.regExtData, popInfo.level);
        }

        if (popInfo.keyContent != '' || popInfo.extContent != '') {
          popInfo.content += buildTabsHtml(popInfo.keyContent, popInfo.extContent);
        } else {
          popInfo.content += "<div>No data available for this region.</div>"
        }
      }
      $('.embPopupBody').html(popInfo.content);
      $('.regionInfo').html(popInfo.countryName + ' Info');

      if (dureUtil.getIndicatorMetaInfoByParam('dataFormat') == 'Standard') {

        $('.loadChart').show();
        $('.drillDown').show();
      } else {
        $('.loadChart').hide();
        $('.drillDown').hide();
      }
    }

    function highlightFeature(e) {
      layer.setStyle({
        weight: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 1
      });
      if (!L.Browser.ie && !L.Browser.opera) {
        // layer.bringToFront();
      }

      if (iHealthMap.checkFilter() == 0) {
        var layerStyle = getLayerStyle(layer);
        iHealthMap.legendControl.highLightScale(layerStyle.className, layerStyle.fillColor, 'bold', '12px');      // When hover on map highlight the legend scale
      }
    }

    function resetHighlight(e) {
      var layerStyle = getLayerStyle(e.target);
      iHealthMap.legendControl.highLightScale(layerStyle.className, '#555', 'normal', '12px');
      iHealthMap.geojsonLayer.resetStyle(e.target);
    }

    function buildPopup(data, indicatorId) {
      var popup = {};

      popup.content = '';
      popup.data = styling.data;
      popup.regData = '';
      //popup.regExtData = '';
      popup.dataLvl = iHealthMap.checkDataLevel();
      if (popup.data != undefined) {
        if (popup.dataLvl == 0) {
          popup.regData = selectTargetDataByParamFromJson('region');
          //popup.regExtData = selectTargetDataByParamFromJson('regionExt');
        } else if (popup.dataLvl == 1) {
          popup.regData = selectIndicatorDataByParamFromJson('region');
          //popup.regExtData = selectIndicatorDataByParamFromJson('regionExt');
        }

        if (popup.regData != '') {
          popup.body = buildHoverPopupHtml(layer.feature.properties.name, buildPopupContent(popup.regData));
        } else if ($.inArray(layer.feature.properties.iso_a3, ["ESH", "JMU", "SAA"]) > -1) {

          popup.body = "Not applicable for this region.";

        } else {
          popup.body = "Data for this region is unavailable.";
        }

        popup.content += popup.body;

        /* if(popup.regExtData != ''){
         popup.content += "<div class='extensionData'><h1>Supporting Data</h1></div>" + buildPopupContent(popup.regExtData,popup.dataLvl);
         } */

      }

      popup.content += '</div>';
      return popup.content;
    }

    function buildHoverPopupHtml(header, data) {

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

    /* function buildPopup(){
     var popup = {};
     popup.content = '';
     popup.totContd = '';
     popup.content += '<div class="popContainer">'+'<div class="popupHeader"><b>' + layer.feature.properties.name + '</b></div>' ;
     popup.data = styling.data;
     popup.regData = '';
     popup.regExtData = '';
     popup.dataLvl = iHealthMap.checkDataLevel();
     if(popup.data != undefined){
     if(popup.dataLvl == 0){
     popup.regData = selectTargetDataByParamFromJson('region');
     popup.regExtData = selectTargetDataByParamFromJson('regionExt');
     }else if(popup.dataLvl == 1){
     popup.regData = selectIndicatorDataByParamFromJson('region');
     popup.regExtData = selectIndicatorDataByParamFromJson('regionExt');
     }
     if (popup.regData != '') {
     popup.content += "<div class='coreData'><h1>Key Data</h1></div>" + buildPopupContent(popup.regData,popup.dataLvl);
     }
     if(popup.regExtData != ''){
     popup.content += "<div class='extensionData'><h1>Supporting Data</h1></div>" + buildPopupContent(popup.regExtData,popup.dataLvl);
     }
     popup.totContd =  '<div class="popupBody"> '+popup.content+' </div>';
     }
     popup.totContd  += '</div>';
     return popup.totContd;
     } */

    // Selects proper data required from the data set in Json object.
    function selectTargetDataByParamFromJson(dataType) {
      var selectParam = {};
      selectParam.reg == '';
      selectParam.data = styling.data;
      if (dataType == 'region') {
        selectParam.reg = selectTargetRegData(selectParam.data);
      } else if (dataType == 'regionExt') {
        selectParam.reg = selectTargetRegExtData(selectParam.data);
      }
      return selectParam.reg;
    }

    // Selects region data required from the data set in Json object.
    function selectTargetRegData(data) {

      var selectdataReg = {};
      selectdataReg.res = '';
      selectdataReg.data = data;
      if (selectdataReg.data.regions != undefined) {
        if (selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a3] != undefined) {
          selectdataReg.res = selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a3];
        } else if (selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a2] != undefined) {
          selectdataReg.res = selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a2];
        }
      }
      return selectdataReg.res;
    }

    // Selects region data extension required from the data set in Json object.
    function selectTargetRegExtData(data) {
      var selRegExt = {};
      selRegExt.res = '';
      selRegExt.data = data;
      if (selRegExt.data.regions != undefined) {
        if (selRegExt.data.regions[3].regionDataExtension[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a3] != undefined) {
          selRegExt.res = selRegExt.data.regions[3].regionDataExtension[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a3];
        } else if (selRegExt.data.regions[3].regionDataExtension[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a2] != undefined) {
          selRegExt.res = selRegExt.data.regions[3].regionDataExtension[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a2];
        }
      }
      return selRegExt.res;
    }


    function selectIndicatorDataByParamFromJson(dataType) {
      var selectParam = {};
      selectParam.reg == '';
      selectParam.data = styling.data;
      //	console.log(styling.data);
      //	console.log(dataType);
      if (dataType == 'region') {
        selectParam.reg = selectIndicatorKeyData(selectParam.data);
      } else if (dataType == 'regionExt') {
        selectParam.reg = selectIndicatorExtData(selectParam.data);
        selectParam.reg = ''; // Hardcoding for supporting data time being 18-03-2015 - KUNAL
      }
      return selectParam.reg;
    }

    // Selects region data required from the data set in Json object.
    function selectIndicatorKeyData(data) {

      var selectdataReg = {};
      selectdataReg.res = '';
      selectdataReg.data = data;
      /* if(selectdataReg.data.regions != undefined){
       if(selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a3] != undefined){
       selectdataReg.res = selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a3];
       }else if(selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a2] != undefined){
       selectdataReg.res = selectdataReg.data.regions[2].regionData[0][iHealthMap.currentYear][0][layer.feature.properties.iso_a2];
       }
       } */
      // TODO 18/03/2015
      if (selectdataReg.data != undefined) {
        if (selectdataReg.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a3] != undefined) {
          selectdataReg.res = selectdataReg.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a3];
        } else if (selectdataReg.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a2] != undefined) {
          selectdataReg.res = selectdataReg.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a2];
        }
      }
      return selectdataReg.res;
    }

    // Selects region data extension required from the data set in Json object.
    function selectIndicatorExtData(data) {
      // //console.log("Line 468 : ============= Indicator extension data ================");
      var selRegExt = {};
      selRegExt.res = '';
      selRegExt.data = data;
      if (selRegExt.data != undefined) {
        // John hopkins world level array.
        if (selRegExt.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a3] != undefined) {
          selRegExt.res = selRegExt.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a3];
        } else if (selRegExt.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a2] != undefined) {
          selRegExt.res = selRegExt.data[iHealthMap.getCurrentyear()][0][layer.feature.properties.iso_a2];
        }
      }
      return selRegExt.res;
    }

    // Builds the popup content which will present the data in ATTRIBUTE : VALUE pair.
    function buildPopupContent(popData, level) {
      // //console.log("Line 466: Building pop content.");
      // //console.log(popData);
      var popup = {};
      popup.codes = [];
      popup.result = '';
      if (level == 0) {
        popup.result = buildTrgtData(popData);
      } else {

        if (iHealthMap.getIndicatorDataType() == 'Standard') {
          popup.result = buildStdIndData(popData, popup.codes);
        } else {
          popup.result = buildNonStdIndData(popData, popup.codes);
        }
      }
      return popup.result;
    }

    function buildTrgtData(data) {
      var targt = {};
      targt.attr = data[1];
      targt.val = data[0];
      targt.contnt = '';
      for (var i = 0; i < targt.attr.length; i++) {
        targt.contnt += "<div> " + targt.attr[i] + " : <span class='badge bg-badge'>" + targt.val[i] + "</span> </div>";
      }
      return targt.contnt;
    }

    function buildStdIndData(data, codes) {                // TODO 17/03/2015
      var indStd = {};
      indStd.attr = data[1];
      indStd.val = data[0];

      /*	if(dureUtil.getIndicatorId() == 187) {          // Change val -10 to Treat All for Indicator id 187 (ART policies)
       //console.log(indStd.val[0]);
       if(indStd.val[0] == -10) {
       //  indStd.val[0] = "Treat All";
       }
       }*/

      indStd.contnt = '';
      /*	for(var i = 0; i < indStd.attr.length; i++) {
       
       if(indStd.val[i] != null){
       
       if(indStd.val[i] == -1){ //-1 Changes
       indStd.contnt += "<div> " + indStd.attr[i] + " : <span class='badge bg-badge'>NA</span> </div>";
       }else{
       indStd.contnt += "<div> " + indStd.attr[i] + " : <span class='badge bg-badge'>" + dureUtil.numberWithSpace(indStd.val[i]) + "</span> </div>";
       }
       }
       } */

      for (var i = 0; i < indStd.attr.length; i++) {

        if (indStd.val[i] != null) {
          if (indStd.val[i] == -1) { //-1 Changes
            indStd.contnt += "<div> " + indStd.attr[i] + " : <span class='badge bg-badge'>NA</span> </div>";
          } else {
            if (dureUtil.getIndicatorId() == 187) {
              if (indStd.val[0] == -10) {
                indStd.contnt += "<div> " + indStd.attr[i] + " : <span class='badge bg-badge'>Treat All</span> </div>";
              } else {
                indStd.contnt += "<div> " + indStd.attr[i] + " : <span class='badge bg-badge'>" + dureUtil.numberWithSpace(indStd.val[i]) + "</span> </div>";
              }
            } else {
              var indVal = dureUtil.numberWithSpace(indStd.val[i]);
              if (indStd.val[i] < 1000 && indStd.val[i] > -1 && ($.inArray(dureUtil.getIndicatorId(), [171, 169, 483, 173, 170]) > -1)) {

                indVal = '< ' + (indStd.val[i] + 1);
              }
              if ((dureUtil.getIndicatorId() == 168 || dureUtil.getIndicatorId() == 432) && (indStd.val[i] === 0.09)) {
                indStd.val[i] = 0.1;
                indVal = '< ' + (indStd.val[i]);
              }

              indStd.contnt += "<div> " + indStd.attr[i] + " : <span class='badge bg-badge'>" + indVal + "</span> </div>";
            }
          }
        }
      }
      return indStd.contnt;
    }

    function buildNonStdIndData(data, codes) {
      var indNstd = {};
      indNstd.attr = data[1][0];
      indNstd.val = data[0][0];
      indNstd.contnt = '';
      if (codes.length == 0) {
        indNstd.contnt += "<div> " + indNstd.attr + " : <span class='badge bg-badge'>" + indNstd.val + "</span> </div>";
      } else {
        for (var i = 0; i < codes.length; i++) {

          if (indNstd.val[i] != null) {

            indNstd.contnt += "<div> " + indNstd.attr[i] + " : <span class='badge bg-badge'>" + indNstd.val[i] + "</span> </div>";
          }
        }
      }
      return indNstd.contnt;
    }

    function buildTabsHtml(core, ext) {
      if (core == '') {
        core = "No key data available.";
      }
      if (ext == '') {
        ext = "No extension data available.";

      }

      if (dureUtil.getCountryId() == "162") {
        ext = '<a href="http://portfolio.theglobalfund.org/en/Country/Index/NGA" target="_blank">Country Profile - The Global fund</a>';
      }


      var html = '<div class="nav-tabs-custom">' +
              '<ul class="nav nav-tabs">' +
              '<li class="active"><a href="#tab_1-1" data-toggle="tab">Key data</a></li>' +
              '<li class=""><a href="#tab_2-2" data-toggle="tab">Links</a></li>' +
              '</ul>' +
              '<div class="tab-content" style="min-width:50%">' +
              '<div class="tab-pane active" id="tab_1-1">' + core +
              '</div><!-- /.tab-pane -->' +
              '<div class="tab-pane" id="tab_2-2">' + ext +
              '</div><!-- /.tab-pane -->' +
              '</div><!-- /.tab-content -->' +
              '</div>' + '<div><a href="javascript:void(0)" class="loadChart" data-target="#chart-modal" data-toggle="modal"><i class="fa fa-bar-chart fa-2x"></i></a><span class="iconsholder"></span><a href="javascript:void(0)" class="drillDown"><i class="fa fa-level-down fa-2x"></i></a><div>';
      return html;
    }
  }

  function getColorForRegion(e) {
    var colorRegion = {};
    colorRegion.data = styling.data;
    //console.log(colorRegion.data);
    colorRegion.dataType = iHealthMap.checkDataLevel();
    if (colorRegion.dataType == 0) {
      return getTargetRegionColor(e, colorRegion.data);
    } else if (colorRegion.dataType == 1) {
      return getIndicatorRegionColor(e, colorRegion.data);
    }
  }

  // Gets the color according the data-scale and color-scale from provided data .
  function getTargetRegionColor(e, data) {
    var targtRegData = {};
    targtRegData.data = data;
    if (targtRegData.data == undefined) {
      return '#fff';
    }
    else if (targtRegData.data[iHealthMap.currentYear][0][e.iso_a2] != undefined) {
      targtRegData.regdata = targtRegData.data[iHealthMap.currentYear][0][e.iso_a2][0][2];
      return getColorScaleForData(targtRegData.regdata);
    } else if (targtRegData.data[iHealthMap.currentYear][0][e.iso_a3] != undefined) {
      targtRegData.regdata = targtRegData.data[iHealthMap.currentYear][0][e.iso_a3][0][2];
      return getColorScaleForData(targtRegData.regdata);
    }
    else {
      return '#3498db';
    }
  }

  // Gets the color according the data-scale and color-scale from provided data .
  function getColorScaleForData(param) {
    var scale = {};
    scale.data = iHealthMap.jsondata.data.targets[0].targetInfo.dataScale;
    scale.color = iHealthMap.jsondata.data.targets[0].targetInfo.colorScale;
    for (var i = 0; i < scale.data.length; i++) {
      if (data > scale.data[i] && data < scale.data[i + 1]) {
        scale.regionColor = scale.color[i];
      } else if (data == scale.data[scale.data.length - 1]) {
        scale.regionColor = scale.color[scale.data.length - 1];
      }
    }
    return scale.regionColor;
  }

  function getIndicatorRegionColor(e, data) {
    var indClr = {};
    indClr.data = data;
    indClr.type = iHealthMap.getIndicatorDataType();
    if (indClr.type == 'Standard') {
      return getStdIndicatorRegionColor(e, indClr.data);
    } else {
      return getNonStdIndicatorRegionColor(e, indClr.data);
    }
  }

  function getStdIndicatorRegionColor(e, data) {   //TODO 13/2/2015
    var stdRegColor = {};
    stdRegColor.data = data;
    var returnStyleObj = {};
    returnStyleObj.scaleColor = '';
    returnStyleObj.scaleValue = '';
    //console.log(data);
    //console.log(e.iso_a3);
    //console.log(iHealthMap.getCurrentyear());

    if (stdRegColor.data == undefined) {
      returnStyleObj.scaleColor = '#bdc3c7';
      returnStyleObj.scaleValue = null;
      return returnStyleObj;
    } else {
      if (stdRegColor.data[iHealthMap.getCurrentyear()][0][e.iso_a3] != undefined) {
        //console.log('render the style for the layer');
        //return stdRegColor.data[iHealthMap.getCurrentyear()][0][e.iso_a3][2][0];

        /* check the data for range and get color */
        return iHealthMap.rangeCompare(dureUtil.respJsonData.indicatorMetaInfo[0].indicatorInfo.levels[0].scales[0].linear[0], stdRegColor.data[iHealthMap.getCurrentyear()][0][e.iso_a3][0][0], returnStyleObj);

      } else {
        returnStyleObj.scaleColor = '#bdc3c7';
        returnStyleObj.scaleValue = null;
        return returnStyleObj;
      }
    }
  }

  function getNonStdIndicatorRegionColor(e, data) {
    var nStdRegColor = {};
    var returnStyleObj = {};

    nStdRegColor.data = data;
    returnStyleObj.scaleColor = '';
    returnStyleObj.scaleValue = '';

    if (nStdRegColor.data == undefined) {
      returnStyleObj.scaleColor = '#bdc3c7';
      returnStyleObj.scaleValue = null;
      return returnStyleObj;
    } else {

      if (nStdRegColor.data[iHealthMap.getCurrentyear()][0][e.iso_a3] != undefined) {

        for (var i = 0; i < iHealthMap.FilterDataArr.length; i++) {

          if (dureUtil.trim(iHealthMap.FilterDataArr[i][0].toLowerCase()) == dureUtil.trim(nStdRegColor.data[iHealthMap.getCurrentyear()][0][e.iso_a3][0][0].toLowerCase())) {
            returnStyleObj.scaleColor = iHealthMap.FilterDataArr[i][1];
            returnStyleObj.scaleValue = iHealthMap.FilterDataArr[i][0];
            return returnStyleObj;
            //return iHealthMap.FilterDataArr[i][1];
          }
        }

        //return nStdRegColor.data[iHealthMap.getCurrentyear()][0][e.iso_a3][2][0];
      } else {
        returnStyleObj.scaleColor = '#bdc3c7';
        returnStyleObj.scaleValue = null;
        return returnStyleObj;
      }
    }
  }
};

// Removes the geoJson Layer present on Map.
iHealthMap.clearLayer = function () {
  //console.log('Clearing layer');
  if (iHealthMap.geojsonLayer != undefined) {
    iHealthMap.map.removeLayer(iHealthMap.geojsonLayer);
  }
  if (iHealthMap.markerTemp != null) {
    iHealthMap.map.removeLayer(iHealthMap.markerTemp);
  }
  // if(dureOverlays.selectLayer != undefined){
  // dureOverlays.removeSelectLayers();
  // }
};

iHealthMap.rangeCompare = function (rangeData, valueTocompare, returnStyleObj) {

  var scaleColor = '';
  var mapDataObj = {};											// TODO

  for (var i = 0; i < rangeData.lowScale.length; i++) {

    if (valueTocompare >= rangeData.lowScale[i] && valueTocompare <= rangeData.highScale[i]) {
      scaleColor = rangeData.colorScale[i];
      returnStyleObj.scaleColor = rangeData.colorScale[i];
      returnStyleObj.scaleValue = valueTocompare;
      break;
    }

  }
  if (valueTocompare == -1) {
    returnStyleObj.scaleColor = '#fff';
  }

  return returnStyleObj;
}

/************************************************ Section: Scale ***********************************************************/

// Gets Map controls required for Map.
iHealthMap.renderMapControls = function (data) {
  var controls = {};
//	iHealthMap.renderEmbededPopup();	     //change req. for side over view panel to not show on map
  iHealthMap.renderSlider();
  // iHealthMap.renderCountryListDropdown();
  // iHealthMap.renderFilter();
};

// Renders Legend if it does not exsist on map .
iHealthMap.renderLegend = function (data) {
  //console.log("++++++++ Inside render legend func +++++++");
  //console.log(data);
  if ($('.legend').length == 0) {
    if (data != undefined) {
      iHealthMap.createLegendControl(data);
    } else {
      //console.log("You have undefined data in this piece of code.");
    }
  }

};

// Creates a legend control on the Map.
iHealthMap.createLegendControl = function (param) {
  var legend = {};

  var documentFragment = $(document.createDocumentFragment());
  //console.log("++++++++ Inside create legend func +++++++");

  if (iHealthMap.getIndicatorDataType() == "Standard") {
    if (param != undefined) {
      legend.headerText = "Legend";
      legend.colorArr = param.colorScale;
      legend.highScaleArr = param.highScale;
      legend.lowScaleArr = param.lowScale;
      legend.dataDesp = param.scaleDesc;
      if (dureUtil.indicatorId == 187) {

        legend.info = '<div class="legend-info"> <h5> Threshold </h5>';
      } else {

        legend.info = '<div class="legend-info"> <h5>' + param.indicatorName + '</h5>';
      }


      documentFragment.append('<div style="width:100%;text-align: center;"><h2 style="text-align: center;">' + param.indicatorName + '</h2></div>');
      documentFragment.append('<div class="legend-info" style="width:50%;"><h3>Legend Information: </h3></div><br>');

      for (var i = 0; i < legend.lowScaleArr.length; i++) {
        // legend.info += '<i class="legendstyle" style="background:'+legend.colorArr[i]+'"></i>&nbsp;<span class="showthisrange range-' + legend.colorArr[i].replace(new RegExp('#', 'g'), "") + '">'+legend.dataDesp[i]+'</span><br/>'; // add showthisrange class to highlight legend and clickable
        legend.info += '<div class="legendInnerDiv"><i class="legendstyle" style="background:' + legend.colorArr[i] + '"></i>&nbsp;<span class="showthisrange range-' + legend.colorArr[i].replace(new RegExp('#', 'g'), "") + '">' + legend.dataDesp[i] + '</span></div>'; // add showthisrange class to highlight legend and clickable

        documentFragment.append('<div class="legendInnerDiv" style="width:30%;display:inline-block;font-size:20px !important;"><i style="background:' + legend.colorArr[i] + '"></i>' + legend.dataDesp[i] + '</div>');
      }
      legend.info += "</div>";

      iHealthMap.legendControl = L.control({position: "bottomright"});
      iHealthMap.legendControl.onAdd = function (map) {
        legend.div = L.DomUtil.create('div', 'scaleWrap');
        // legend.div.innerHTML += '<div class="gradelist"><h2 class="gradelistHeader">' + legend.headerText + '</h2>' + legend.info + '</div>';

        $("#lengendGrid").html("");
        $("#lengendGrid").append(documentFragment);
        legend.div.innerHTML += iHealthMap.buildBoxHtml(legend.headerText, legend.info, 'scaleInfo');

        return legend.div;
      },
              iHealthMap.legendControl.highLightScale = function (scaleClass, clr, weight, size) {
                $('.' + scaleClass).css({
                  "color": clr,
                  "fontWeight": weight,
                  "font-size": size
                });
              },
              iHealthMap.legendControl.getSelectedRange = function () {
                $('.showthisrange').on('click', function () {

                  if (dureUtil.getDataLevel() == "world") {

                    var filteredIdlist;
                    $(this).html();
                    var rangeClassName = $(this).attr('class').substring($(this).attr('class').lastIndexOf('range-'));
                    filteredIdlist = dureUtil.scaleRangeCat.regionList[rangeClassName];
                    iHealthMap.clearLayer();
                    dureUtil.scaleRangeCat.apply = false;
                    var layerFilter = filterLayerContainer('name', true, filteredIdlist);
                    iHealthMap.addStyle(layerFilter);
                    var that = this;
                    var callBackList = {
                      layerList: layerFilter,
                      colorCode: {apply: true, code: rangeClassName, scale: $(that).html()},
                    };
                    //console.log(filteredIdlist);
                    if (filteredIdlist) {
                      var notificationMessage = filteredIdlist.length + ' Countries Found <br/>' + 'Range: ' + $(this).html();
                      notifications(notificationMessage, callBackList);
                    } else {
                      var notificationMessage = 'No Countries Found <br/>' + 'Range: ' + $(this).html();
                      callBackList.colorCode.apply = false;
                      notifications(notificationMessage, callBackList);
                    }
                  } else {

                    var filteredIdlist;
                    $(this).html();
                    var rangeClassName = $(this).attr('class').substring($(this).attr('class').lastIndexOf('range-'));
                    filteredIdlist = province.scaleRangeCat.regionList[rangeClassName];
                    province.clearMapLayer();
                    province.scaleRangeCat.apply = false;
                    var layerFilter = filterLayerContainer('NAME_1', true, filteredIdlist);
                    province.addStyle(layerFilter);
                    var that = this;
                    var callBackList = {
                      layerList: layerFilter,
                      colorCode: {apply: true, code: rangeClassName, scale: $(that).html()},
                    };
                    //console.log(filteredIdlist);
                    if (filteredIdlist) {
                      var notificationMessage = filteredIdlist.length + ' Province Found <br/>' + 'Range: ' + $(this).html();
                      notifications(notificationMessage, callBackList);
                    } else {
                      var notificationMessage = 'No Province Found <br/>' + 'Range: ' + $(this).html();
                      callBackList.colorCode.apply = false;
                      notifications(notificationMessage, callBackList);
                    }

                  }

                });
              };

      iHealthMap.legendControl.addTo(iHealthMap.map);
      iHealthMap.legendControl.getSelectedRange();
    } else {
      //console.log("You have undefined data in this piece of code.");
    }
  } else {

    var nonStdParam = dureUtil.respJsonData.filterGroups;

    legend.headerText = "Legend";


    if (dureUtil.indicatorId == 434) {

      legend.info = '<div class="legend-info"> <h5> PMTCT option </h5>';

    } else {

      legend.info = '<div class="legend-info"> <h5>' + nonStdParam[0].filterGroupName + '</h5>';
    }

    documentFragment.append('<div style="width:100%;text-align: center;"><h2 style="text-align: center;">' + nonStdParam[0].filterGroupName + '</h2></div>');
    documentFragment.append('<div class="legend-info" style="width:50%;"><h3>Legend Information: </h3></div><br>');

    for (var i = 0; i < nonStdParam[0].filterSubGroups.length; i++) {

      //legend.info += '<i class="legendstyle" style="background:'+nonStdParam[0].filterSubGroups[i].filterSubGroupColor+'"></i>&nbsp;<span class="showthisrange range-' +nonStdParam[0].filterSubGroups[i].filterSubGroupColor.replace(new RegExp('#', 'g'), "") + '">'+nonStdParam[0].filterSubGroups[i].filterSubGroupName+'</span><br/>';
      //legend.info += '<div class="legendInnerDiv"><i class="legendstyle" style="background:'+nonStdParam[0].filterSubGroups[i].filterSubGroupColor+'"></i>&nbsp;<span>'+nonStdParam[0].filterSubGroups[i].filterSubGroupName+'</span></div>';
      legend.info += '<div class="legendInnerDiv"><i class="legendstyle" style="background:' + nonStdParam[0].filterSubGroups[i].filterSubGroupColor + '"></i>&nbsp;<span class="showthisrange range-' + nonStdParam[0].filterSubGroups[i].filterSubGroupColor.replace(new RegExp('#', 'g'), "") + '">' + nonStdParam[0].filterSubGroups[i].filterSubGroupName + '</span></div>'; // add showthisrange class to highlight legend and clickable

      documentFragment.append('<div class="legendInnerDiv" style="width:30%;display:inline-block;font-size:20px !important;"><i style="background:' + nonStdParam[0].filterSubGroups[i].filterSubGroupColor + '"></i>' + nonStdParam[0].filterSubGroups[i].filterSubGroupName + '</div>');
    }
    legend.info += "</div>";

    iHealthMap.legendControl = L.control({position: "bottomright"});
    iHealthMap.legendControl.onAdd = function (map) {
      legend.div = L.DomUtil.create('div', 'scaleWrap');
      // legend.div.innerHTML += '<div class="gradelist"><h2 class="gradelistHeader">' + legend.headerText + '</h2>' + legend.info + '</div>';

      $("#lengendGrid").html("");
      $("#lengendGrid").append(documentFragment);
      legend.div.innerHTML += iHealthMap.buildBoxHtml(legend.headerText, legend.info, 'scaleInfo');
      return legend.div;
    };

    iHealthMap.legendControl.highLightScale = function (scaleClass, clr, weight, size) {
      $('.' + scaleClass).css({
        "color": clr,
        "fontWeight": weight,
        "font-size": size
      });
    },
            iHealthMap.legendControl.getSelectedRange = function () {
              $('.showthisrange').on('click', function () {
                var filteredIdlist;
                $(this).html();
                var rangeClassName = $(this).attr('class').substring($(this).attr('class').lastIndexOf('range-'));
                filteredIdlist = dureUtil.scaleRangeCat.regionList[rangeClassName];
                iHealthMap.clearLayer();
                dureUtil.scaleRangeCat.apply = false;
                var layerFilter = filterLayerContainer('name', true, filteredIdlist);
                iHealthMap.addStyle(layerFilter);
                var that = this;
                var callBackList = {
                  layerList: layerFilter,
                  colorCode: {apply: true, code: rangeClassName, scale: $(that).html()},
                };
                //console.log(filteredIdlist);
                if (filteredIdlist) {
                  var notificationMessage = filteredIdlist.length + ' Countries Found <br/>' + 'Range: ' + $(this).html();
                  notifications(notificationMessage, callBackList);
                } else {
                  var notificationMessage = 'No Countries Found <br/>' + 'Range: ' + $(this).html();
                  callBackList.colorCode.apply = false;
                  notifications(notificationMessage, callBackList);
                }

              });
            };

    iHealthMap.legendControl.addTo(iHealthMap.map);

    iHealthMap.legendControl.getSelectedRange();
  }
};

// Removes the Legend control from map .
iHealthMap.removeLegendControl = function () {
  //console.log(iHealthMap.legendControl + " === Removing the legend");
  if (iHealthMap.legendControl != undefined && iHealthMap.legendControl !== null) {

    iHealthMap.legendControl.removeFrom(iHealthMap.map);
  }
  iHealthMap.legendControl = null;
};

/************************************************ Section: Map Controls *****************************************************/
iHealthMap.OpenInfoContainer = function () {

  $(".embedPopupWrap .box-primary").removeClass('collapsed-box');
  $(".embedPopupWrap .box-body").show();
  $(".embedPopupWrap .btn-primary").removeClass('fa-plus');
  $(".embedPopupWrap .btn-primary i").addClass('fa-minus');

  /* opening legend container on click */
  $(".infolegend .box-primary").removeClass('collapsed-box');
  $(".infolegend .box-body").show();
  $(".infolegend .btn-primary").removeClass('fa-plus');
  $(".infolegend .btn-primary i").addClass('fa-minus');
}


//Renders embeded popup on map.
iHealthMap.renderEmbededPopup = function () {
  if ($('.embedPopupWrap').length == 0) {
    iHealthMap.createEmbedPopup();
  }
}

//Creates embed popup in the Map.
iHealthMap.createEmbedPopup = function () {
  var header = " Region Info";
  var body = '<div class="embPopupBody"> Please click/tap to get info about countries.</div>';

  iHealthMap.popupControl = L.control({position: "topright"});
  iHealthMap.popupControl.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'embedPopupWrap');
    div.innerHTML += iHealthMap.buildBoxHtml(header, body, 'regionInfo');
    return div;
  };
  iHealthMap.popupControl.addTo(iHealthMap.map);
};

// Removes the Legend control from map .
iHealthMap.removeEmbedPopupControl = function () {
  if (iHealthMap.popupControl != undefined) {

    iHealthMap.popupControl.removeFrom(iHealthMap.map);
  }
};

// Renders Slider if it does not exsist on map .
iHealthMap.renderSlider = function () {
  if ($('.sliderdiv').length == 0) {
    iHealthMap.createSlideControl();
  }
};

// Creates slider control that is needed for map.
iHealthMap.createSlideControl = function () {

  iHealthMap.sliderControl = L.control({position: "bottomleft"});
  iHealthMap.sliderControl.onAdd = function () {
    var div = L.DomUtil.create('div', 'sliderdiv');
    div.innerHTML = '<div class="btn-group dropup">' +
            '<button type="button" id="sliderPrev" class="btn btn-primary sliderPrev"><i class="fa fa-backward"></i></button>' +
            '<button type="button" id="slideryear" class="btn btn-primary" data-target="#year-modal" data-toggle="modal"> Year ' + iHealthMap.currentYear + '</button>' +
            '<button type="button" id="sliderNext" class="btn btn-primary sliderNext"><i class="fa fa-forward"></i></button>' +
            '<button type="button" id="sliderPlay" class="btn btn-primary playbutton-style"><i class="fa fa-play"></i></button>' +
            '<button type="button" id="sliderPause" class="btn btn-primary playbutton-style hide"><i class="fa fa-pause"></i></button>' +
            '</div>';
    return div;
  }
  iHealthMap.sliderControl.addTo(iHealthMap.map);
  iHealthMap.slideNext();
  iHealthMap.slidePrev();
  iHealthMap.slidePlay();
  iHealthMap.slidePause();
  // Call to build Select year control in slider.
  if (iHealthMap.rangeOfYears.length != 0) {

    console.log('iHealthMap.createSlideControl');
    //console.log(iHealthMap.rangeOfYears);
    //console.log(province.rangeOfYears);

    if (dureUtil.getDataLevel() == 'country') {
      iHealthMap.buildYearSelectHtml(province.rangeOfYears);
    } else if (dureUtil.getDataLevel() == 'region') {
      iHealthMap.buildYearSelectHtml(dureRegion.rangeOfYears);
    }
    else {
      iHealthMap.buildYearSelectHtml(iHealthMap.rangeOfYears);
    }

  }
};

// Functionality for next button
iHealthMap.slideNext = function () {
  // console.log("Inside slider next.");
  $('#sliderNext').click(function () {
    // console.log("clicked slider next.");
    iHealthMap.currentYearIndex++;
    if (iHealthMap.currentYearIndex < iHealthMap.rangeOfYears.length && iHealthMap.currentYearIndex >= 0) {
      $(this).addClass('sliderNextRed');
      if (iHealthMap.setCurrentyear(iHealthMap.rangeOfYears[iHealthMap.currentYearIndex])) {
        $('#slideryear').text('Year ' + iHealthMap.rangeOfYears[iHealthMap.currentYearIndex]);
        iHealthMap.onYearChange(iHealthMap.currentYearIndex);
      }
    }
    else {
      iHealthMap.currentYearIndex--;
    }
  });
};

// Functionality for previous button
iHealthMap.slidePrev = function () {

  $('#sliderPrev').click(function () {
    iHealthMap.currentYearIndex--;
    if (iHealthMap.currentYearIndex < iHealthMap.rangeOfYears.length && iHealthMap.currentYearIndex >= 0)
    {
      $(this).addClass('sliderPrevRed');
      if (iHealthMap.setCurrentyear(iHealthMap.rangeOfYears[iHealthMap.currentYearIndex])) {
        $('#slideryear').text('Year ' + iHealthMap.rangeOfYears[iHealthMap.currentYearIndex]);
        iHealthMap.onYearChange(iHealthMap.currentYearIndex);
      }
    }
    else
    {
      iHealthMap.currentYearIndex++;
    }
  });
};

// Functionality for Play button                          // 24/8/2015
iHealthMap.slidePlay = function () {

  $('#sliderPlay').click(function () {
    $(this).hide();
    $('#sliderPause').show();
    $('#sliderPause').removeClass('hide');
    var slideDuration = 1300;
    var crntIndex = iHealthMap.currentYearIndex;
    iHealthMap.playInterval = setInterval(function () {
      iHealthMap.currentYearIndex++;
      if (iHealthMap.currentYearIndex > iHealthMap.rangeOfYears.length - 1) {
        iHealthMap.currentYearIndex = 0;
      }

      if (crntIndex == iHealthMap.currentYearIndex) {

        $('#sliderPause').hide();
        $('#sliderPlay').show();
        clearInterval(iHealthMap.playInterval);
      }

      $('#slideryear').text('Year ' + iHealthMap.rangeOfYears[iHealthMap.currentYearIndex]);
      //iHealthMap.onYearChange(iHealthMap.currentYearIndex);

      if (dMap.checkLevel() == 'world') {
        iHealthMap.onYearChange(iHealthMap.currentYearIndex);
      } else if (dMap.checkLevel() == 'country') {
        province.onYearChange(province.currentYearIndex);
      }
    }, slideDuration);
  });
};

iHealthMap.slidePause = function () {

  $('#sliderPause').click(function () {
    $(this).hide();
    $('#sliderPlay').show();
    clearInterval(iHealthMap.playInterval);
  });
}

/*
 Author: Shone Johnson
 Date: 10-12-14
 Description: Builds html for year selection control in slider
 */
iHealthMap.buildYearSelectHtml = function (years) {

  console.log(years);

  $('.yearSelect').children().remove()
  var html = '<option>Select a year</option>';
  if (years != undefined) {

    for (var i = 0; i < years.length; i++) {

      html += "<option value=" + years[i] + ">" + years[i] + "</option>"
    }
    $('.yearSelect').append(html);
    iHealthMap.onYearSelect();
  }
};

// Functionality to select year from dropdown.
iHealthMap.onYearSelect = function () {

  $('.yearSelect').change(function () {
    iHealthMap.currentYear = $('.yearSelect').val();
    $('#slideryear').text('Year ' + iHealthMap.currentYear);
    console.log("Year selected from dropdown .....");
    // Changes to check the level -- By Shone.
    if (dMap.checkLevel() == 'world') {
      iHealthMap.onYearChange();
    } else if (dMap.checkLevel() == 'country') {
      province.onYearChange();
    }
  });
};

// Changes and displays map data on year change.
iHealthMap.onYearChange = function (index) {
  console.log("Index for the year - " + index);
  dureOverlays.clearOverlays();
  if (index != undefined) {
    iHealthMap.currentYear = iHealthMap.rangeOfYears[index];

  }
  dureUtil.scaleRangeCat = {regionList: {}, apply: true};                           //TODO 18/03/2015
  console.log(dureUtil.scaleRangeCat);
  /*----------------- Commented for VIEW HUB BY SHONE ----------------*/
  // iHealthMap.changeRegionSummaryDataForYear(iHealthMap.currentYear);

  iHealthMap.changeOtherComponentData(iHealthMap.currentYear);


  iHealthMap.loadLayer();

  if (dureUtil.indicatorId == 170 || dureUtil.indicatorId == 168) {
    var check = $('.leaflet-control-layers-selector').is(':checked');
    removeControlBarOverlay();
    renderBarOverlay();
    if ($('.leaflet-control-layers-selector').next().text() == " Cascade") {
      if (check)
        $('.leaflet-control-layers-selector').trigger('click');
    }
  } else {
    removeControlBarOverlay();
  }

  /*  ##### Changes added by Swapnil for changing overlay on year change ##### */
  if (dureOverlays.OverlayVisible) {
    dureOverlays.clearOverlays();

    dureOverlays.CurrentYearOverlayData = dureOverlays.getOverlayDataForPeriodNew(iHealthMap.getCurrentyear(), dureOverlays.CurrentOption.label);
console.log(dureOverlays.CurrentYearOverlayData);
    if (dureOverlays.currentOverlayStyle == 'Radial') {

      dureOverlays.showRadialChartForYear(dureOverlays.CurrentOption, dureOverlays.CurrentYearOverlayData);
      $(dureOverlays.overlayList).eq(dureOverlays.selectedIndexVal).prop('selected', true);
    } else {
      dureOverlays.showBubbleChartForYear(dureOverlays.CurrentOption, dureOverlays.CurrentYearOverlayData);
      $(dureOverlays.overlayList).eq(dureOverlays.selectedIndexVal).prop('selected', true);
    }
  }
  /*  ##### Changes added by Swapnil ##### */

  $('#year-modal').modal('hide');
}

//Removes slider control from Map.
iHealthMap.removeSliderControl = function () {
  if (iHealthMap.sliderControl != undefined && iHealthMap.sliderControl !== null) {
    iHealthMap.sliderControl.removeFrom(iHealthMap.map);
  }
  iHealthMap.sliderControl = null;
};

// Unbinds slider controlS attached to the elements at region level.
iHealthMap.deActivateSliderControls = function () {
  console.log("Deactivating controls");
  $("#sliderNext").unbind("click");
  $("#sliderPrev").unbind("click");
  $("#sliderNext").attr('id', 'sliderNextProv');
  $("#sliderPrev").attr('id', 'sliderPrevProv');
};

// Clears map data and map controls.
iHealthMap.clearMap = function () {
  iHealthMap.clearLayer();
  iHealthMap.removeLegendControl();
  iHealthMap.removeSliderControl();
  iHealthMap.removeEmbedPopupControl();
};

// Drills down into the country provinces/states.
iHealthMap.drilldownToCountry = function (country, countryISO) {
  dMap.setLevel('country');                              // TODO change level to country
  province.initialize(country, countryISO);
};

// Resets map and places map to default position .
iHealthMap.onResettingMap = function () {
  console.log("================== Reset Action From World Level =====================");
  province.clearMapLayer();
  iHealthMap.unsetFilter();
  iHealthMap.clearLayer();
  iHealthMap.clearFilterOptions();
  iHealthMap.removeSliderControl();
  iHealthMap.removeEmbedPopupControl();
  iHealthMap.removeLegendControl();
  dureOverlays.clearOverlays();
  gaviOverlays.clearOverlays();
  if (dureUtil.indicatorId == 168 || dureUtil.indicatorId == 170) {
    removeControlBarOverlay();
    renderBarOverlay();
  }
  else {
    removeControlBarOverlay();
  }
  $.noty.closeAll();
  iHealthMap.setYearRangeAndLimits();
  iHealthMap.map.setView(new L.LatLng(iHealthMap._lat, iHealthMap._long), 2);
  iHealthMap.map.panTo(new L.LatLng(iHealthMap._lat, iHealthMap._long));
  iHealthMap.loadLayer();
  iHealthMap.renderLegend(iHealthMap.legendControlData);

  // province.deActivateSliderControls();
}

// Set Year Range and Limits so as to display data on maps according to year.
iHealthMap.setYearRangeAndLimits = function () {
  console.log("==== Setting Map Year Ranges ====");
  var range = {};
  range.data = '';
  range.data = iHealthMap.getDataFromProvider();
  //console.log(range.data);
  if (dMap.checkLevel() == 'world') {
    var currentView = dureUtil.retrieveFromLocal("currentView");

    if (currentView != undefined && currentView.indicatorID == dureConfig.getUserIndicatorId()) {
      console.log('### USING LOCAL STORAGE ###');
      // iHealthMap.currentYear = iHealthMap.minYearValue = dureUtil.getMinYearForTarget(currentView.targetID);
      // iHealthMap.maxYearValue = dureUtil.getMaxYearForTarget(currentView.targetID);
      iHealthMap.minYearValue = dureUtil.getMinYearForIndicator(currentView.indicatorID);
      iHealthMap.currentYear = iHealthMap.maxYearValue = dureUtil.getMaxYearForIndicator(currentView.indicatorID);

      //console.log("setting current year here");
      //console.log(iHealthMap.currentYear);
    }

    iHealthMap.rangeOfYears = dureUtil.getRangeOfYears();

    iHealthMap.currentYearIndex = (iHealthMap.rangeOfYears.length - 1);
    //console.log(iHealthMap.rangeOfYears[0]);
    //console.log(currentYearIndex);

    //iHealthMap.currentYear = iHealthMap.rangeOfYears[0];
    iHealthMap.currentYear = iHealthMap.maxYearValue = iHealthMap.rangeOfYears[iHealthMap.currentYearIndex];

    console.log("setting current year here");
    console.log(iHealthMap.currentYear);

  } else if (dMap.checkLevel() == 'country') {
    // iHealthMap.rangeOfYears
    // iHealthMap.currentYearIndex
    // iHealthMap.minYearValue
    // iHealthMap.currentYear = iHealthMap.maxYearValue =
  }
};

//Builds html for popup.
iHealthMap.buildBoxHtml = function (header, body, className) {
  var html = "<div class='box box-solid box-primary box-transparent box-rm-margin-bottom'>" +
          "<div class='box-header collapsibleHeader'>" +
          "<h5 class='pull-left " + className + "'>" + header + "</h6>" +
          "<div class='box-tools pull-right'>" +
          "<button class='btn btn-primary btn-xs' data-widget='collapse'><i class='fa fa-minus'></i></button>" +
          "</div>" +
          "</div>" +
          "<div class='box-body' style='display: block;'>" + body + "</div>" +
          "</div>";
  return html;
};


iHealthMap.renderCountryListDropdown = function () {

  $('.selectpicker').selectpicker({
    style: 'btn-sm btn-primary',
    size: 10,
    width: 150
  });
  $('.countryPick ul.selectpicker').find('.dropdown-header').children('span').addClass('label label-primary');
  $('.selectpicker').change(function () {

    var group = $('.selectpicker option:selected')[0].className;

    if (group == 'optgroup') {

      console.log($('.selectpicker').val());
      var optgrpVal = $('.selectpicker').val();
      if (iHealthMap.setFilter()) {
        // iHealthMap.setFilterType('region');
        iHealthMap.setFilterParam(optgrpVal);
        iHealthMap.setRegionFilter(optgrpVal);
        console.log("Loading regions");
        iHealthMap.loadLayer();
      }
    } else {
      if (iHealthMap.checkFilter()) {
        iHealthMap.isFilterApplied = 0;
        iHealthMap.loadLayer();
      }
      var address = $('.selectpicker').val();
      if (iHealthMap.searchRegionByIsocode(address) == false) {
        iHealthMap.getLatLngForAddr(address);
      }
    }
  });
}

/************************************************ Section: Map Dependent Info ***********************************************/

// Changes Info on Chart for country.
iHealthMap.changeChartInfoForCountry = function (code) {

  if (dureUtil.prepareChartObjects(iHealthMap.dataProviderCopy, 'region', code)) {
    console.log("Chart changed for country");
  }
};

// Changes Region summary data on change of year.
iHealthMap.changeRegionSummaryDataForYear = function (year) {
  var data;
  console.log("###====== Change Country Summary data ======###");
  if (year != undefined) {
    //console.log(iHealthMap.jsondata.data.regions[1].regionSummaryData[0][year].data);
    data = iHealthMap.jsondata.data.regions[1].regionSummaryData[0][year].data;
    if (data != undefined) {
      console.log("Changing summary data for country");
      dureUtil.changeRegionSummaryData(data);
    }
  }
};

// Changes the overview panel data
iHealthMap.changeOtherComponentData = function (year) {

  var overviewData;
  if (year != undefined) {
    if (dureUtil.currentFormattedJSONData.extensionData != undefined) {
      if (dureUtil.currentFormattedJSONData.extensionData[0] != undefined) {
        overviewData = dureUtil.currentFormattedJSONData.extensionData[0][year];
        if (overviewData != undefined) {
          // console.log("Changing overview Panel data");
          dureUtil.changeComponentData(overviewData);
        }
      }
    }
  }
}

// Sets country name for click/tap on the map.
iHealthMap.setCountryName = function (country) {
  iHealthMap.country = country;
};

// Returns the country name for country selected from map.
iHealthMap.getCountryName = function () {
  return iHealthMap.country;
};

iHealthMap.searchRegionByIsocode = function (countryName) {
  var countryCode;
  var addr = {}, lat, lng, zoom, marker;
  zoom = 4;
  if (iHealthMap.markerTemp != null) {
    iHealthMap.map.removeLayer(iHealthMap.markerTemp);
  }

  countryCode = dureUtil.getGeoCodeFromName(countryName, iHealthMap.geoJson);
  if (countryCode != undefined && countryCode != '') {
    lat = L.countryCentroids[countryCode].lat;
    lng = L.countryCentroids[countryCode].lng;
    if (lat != undefined && lng != undefined) {
      bounds = L.latLngBounds(L.countries[countryCode].features[0].geometry.coordinates).getCenter();
      console.log(bounds);
      lat = bounds.lng;
      lng = bounds.lat;
    }
  }

  if (lat != undefined && lng != undefined) {
    iHealthMap.map.setView(new L.LatLng(lat, lng), zoom);
    marker = L.marker([lat, lng]);
    marker.addTo(iHealthMap.map);
    iHealthMap.markerTemp = marker;
  } else {
    return false;
  }
  return true;
};

//Returns lat long of a region.
iHealthMap.getLatLngForAddr = function (address) {
  var addr = {};
  iHealthMap.geocoder.geocode({'address': address}, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      //console.log("=============== Line 968: Geocoding location results =======.");
      if (iHealthMap.markerTemp != null) {
        iHealthMap.map.removeLayer(iHealthMap.markerTemp);
      }
      iHealthMap.geocodeRes = results[0].geometry;
      console.log(results[0].geometry);
      addr.lat = results[0].geometry.location.k;
      addr.lng = results[0].geometry.location.B;
      addr.zoom = 4;
      iHealthMap.map.setView(new L.LatLng(addr.lat, addr.lng), addr.zoom);
      marker = L.marker([addr.lat, addr.lng]);
      marker.addTo(iHealthMap.map);
      iHealthMap.markerTemp = marker;
    }
  });
}

/************************************************ Section : Map Filter  ****************************************************/

iHealthMap.renderFilter = function (filterData) {
  $('.filterControl').remove();
  console.log(filterData);
  if ($('.filterControl').length == 0) {
    var filter = {};
    // filter.data = iHealthMap.getDataFromProvider();
    filter.data = filterData[0];
    // //console.log("filter.data");
    ////console.log(filter.data);

    filterDataResultFromProvider = filter.data;

    //var filterDataResultall = [];
    filterDataResult = [];
    $.each(filter.data, function (index, value) {

      filterDataResult.push(value[0]);
    });


    var headFilter = [];

    var filteredJSONObjectArray = [];
    var filteredJSONObject = {};
    var tempArray = [];
    var columnName = "";


    $.each(filterDataResult[0], function (index, value) {


      var nameChanged = false;


      if (value[1][0] != undefined && $.inArray(value[1][0], headFilter) < 0)
      {
        ////console.log(value[0]);

        columnName = value[1];
        headFilter.push(columnName);
        if (index > 0)
        {
          nameChanged = true;

        }
      }

      if (!nameChanged)
      {
        if (filteredJSONObject.key == undefined) {
          filteredJSONObject.key = columnName;
          filteredJSONObject.data = [];
          tempArray = [];
        }

      }
      else
      {
        filteredJSONObject.data = dureUtil.getUniqueFromArrayNew(tempArray);
        filteredJSONObjectArray.push(filteredJSONObject);
        filteredJSONObject = {};
        filteredJSONObject.key = columnName;
        filteredJSONObject.data = [];
        tempArray = [];

      }

      ////console.log(value[0][0]);

      var codeValueObject = {};

      codeValueObject.code = "";
      codeValueObject.colorcode = "";

      if (value[3][0] != undefined)
      {
        codeValueObject.code = value[3][0];
      }

      if (value[2][0] != undefined)
      {
        codeValueObject.colorcode = value[2][0];
      }

      codeValueObject.value = value[0][0];

      // tempArray.push(codeValueObject);
      //filteredJSONObject.data.push(value[0][0]);

      tempArray.push(codeValueObject.code + "~" + codeValueObject.value + "~" + codeValueObject.colorcode);

      //codetemp.push(value[3]);
    });

    filteredJSONObject.data = dureUtil.getUniqueFromArrayNew(tempArray);
    filteredJSONObjectArray.push(filteredJSONObject);


    // //console.log(filteredJSONObjectArray);


    ////console.log(headFilter);
    /**********************************************************************************/


    /* this the hardcoded loop that will generate only 4 filter this can be change as per the requirement */
    for (var i = 0; i < filteredJSONObjectArray.length; i++) {

      var filteredJSONObject = filteredJSONObjectArray[i];
      var filterHtml = '';
      if (i == 0) {

        filterHtml += '<div class="panel panel-default filterControl" style="margin-bottom:0px"><div class="panel-heading" role="tab" id="heading' + i + '"><h4 class="panel-title"><a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '" aria-expanded="false" aria-controls="collapseOne">' + filteredJSONObject.key + '</a></h4></div><div id="collapse' + i + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne"><div class="panel-body"><ul class="list-group">';

      } else {

        filterHtml += '<div class="panel panel-default filterControl" style="margin-bottom:0px"><div class="panel-heading" role="tab" id="heading' + i + '"><h4 class="panel-title"><a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '" aria-expanded="false" aria-controls="collapseOne">' + filteredJSONObject.key + '</a></h4></div><div id="collapse' + i + '" class="panel-collapse collapse " role="tabpanel" aria-labelledby="headingOne"><div class="panel-body"><ul class="list-group">';

      }


      $.each(filteredJSONObject.data, function (index, object) {
        var codeValues = object.split("~");
        var code = codeValues[0];
        var value = codeValues[1];
        var colorcode = codeValues[2];

        filterHtml += '<li class="list-group-item" style="color:black;font-size:medium"><label><input type="checkbox" datacode="' + code + '" datacolorcode="' + colorcode + '" value="' + value + '" class="filterCheckBox" style="margin-right:5px">  ' + value + '</label></li>';
      });
      filterHtml += '</ul></div></div></div>';
      $("#accordion").before(filterHtml);
    }
    iHealthMap.bindFilterBtnEvent();

  }
}
/********************* creating legend based on the data in filter   *********************/
iHealthMap.createLegendOnFilter = function () {



  /* new changes on 11-Dec-2014 to make legend div collapsible */

  // var documentFragment = $(document.createDocumentFragment());
  // var checkedFilters = $('.filterCheckBox:checkbox:checked');
  // if (checkedFilters.length < 1) {
  //     checkedFilters = $('.filterCheckBox');
  // }


  // var header = "Info";
  // var body = '';


  // iHealthMap.removeLegendControl();
  // iHealthMap.legendControl = L.control({
  //     position: 'bottomright'
  // });

  // iHealthMap.legendControl.onAdd = function(map) {
  //     var div = L.DomUtil.create('div', 'info legend');

  //     $.each(checkedFilters, function(key, val) {
  //         console.log(val.getAttribute("datacode"))

  //         body +=
  //             '<div  class="legendInnerDiv"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> ' + val.value + '</div>';

  //         documentFragment.append('<div  class="legendInnerDiv" style="width:30%;display:inline-block"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> ' + val.value + '</div>');


  //     });

  //     $("#lengendGrid").html("");
  //     $("#lengendGrid").append(documentFragment);
  //     div.innerHTML += iHealthMap.buildBoxHtml(header, body, 'regionInfo');
  //     return div;
  // };

  //  iHealthMap.legendControl.addTo(iHealthMap.map);

  /* new changes on 11-Dec-2014 to make legend div collapsible */










  /*** hardcoded code ***/


  var documentFragment = $(document.createDocumentFragment());
  var checkedFilters = $('.filterCheckBox:checkbox:checked');
  if (checkedFilters.length < 1) {
    checkedFilters = $('.filterCheckBox');
  }


  var header = "Legend";
  var body = '';


  iHealthMap.removeLegendControl();
  iHealthMap.legendControl = L.control({
    position: 'bottomright'
  });

  iHealthMap.legendControl.onAdd = function (map) {
    var planningPresent = false;
    var introducedPresent = false;
    var notPlannedPresent = false;
    var div = L.DomUtil.create('div', 'infolegend legend');

    $.each(checkedFilters, function (key, val) {
      if (dureUtil.respJsonData.indicatorMetaInfo[0].indicatorInfo.indicatorName == 'Current Vaccine Intro Status') {


        if (val.value == 'Introduced into national immunization program') {/* create Introduced legend */


          if (!introducedPresent) {

            body +=
                    '<div  class="legendInnerDiv"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> Introduced </div>';

            documentFragment.append('<div  class="legendInnerDiv" style="width:30%;display:inline-block"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> Introduced</div>');

            introducedPresent = true;
          }



        }
        else if (val.value == 'Gavi approved/approved with clarification' || val.value == 'Gavi plan to apply' || val.value == 'Gavi conditional approval to introduce' || val.value == 'Non-Gavi planning introduction') {/* create Planning legend */


          if (!planningPresent) {

            body +=
                    '<div  class="legendInnerDiv"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> Planning </div>';

            documentFragment.append('<div  class="legendInnerDiv" style="width:30%;display:inline-block"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> Planning</div>');

            planningPresent = true;
          }


        }
        else if (val.value == 'No Decision' || val.value == 'Widespread coverage through private market') {/* create Not introduced legend */


          if (!notPlannedPresent) {

            body +=
                    '<div  class="legendInnerDiv"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> Not introduced </div>';

            documentFragment.append('<div  class="legendInnerDiv" style="width:30%;display:inline-block"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> Not introduced</div>');

            notPlannedPresent = true;
          }



        }


      }

      else {

        body +=
                '<div  class="legendInnerDiv"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> ' + val.value + '</div>';

        documentFragment.append('<div  class="legendInnerDiv" style="width:30%;display:inline-block"><i style="background:' + val.getAttribute("datacolorcode") + '"></i> ' + val.value + '</div>');


      }
    });

    $("#lengendGrid").html("");
    $("#lengendGrid").append(documentFragment);
    div.innerHTML += iHealthMap.buildBoxHtml(header, body, 'infolegend');
    return div;
  };

  iHealthMap.legendControl.addTo(iHealthMap.map);


  /*** hardcoded code ***/

}

/********************* binding click event for the button on the map  *********************/

iHealthMap.bindFilterBtnEvent = function () {
  iHealthMap.createLegendOnFilter();
  // Click event for apply filter button starts here
  $("#applyFilterBtn").click(function (e) {
    var filterValueArr = [];
    var checkedFilters = $('.filterCheckBox:checkbox:checked');

    $.each(checkedFilters, function (key, val) {
      filterValueArr.push({
        "filterValue": val.value,
        "filterCode": val.getAttribute("datacode")
      });
    });
    // If values are checked, then the length of array is checked. If length is 0 filter params set else not set .
    if (filterValueArr.length != 0) {
      if (iHealthMap.setFilter()) {
        console.log(filterValueArr);
        iHealthMap.setFilterParam(filterValueArr);
        iHealthMap.setFilterType('data');
      }
    } else {
      iHealthMap.unsetFilter();
    }
    if (iHealthMap.loadLayer()) {
      $('.bs-example-modal-lg').modal('hide');
      iHealthMap.createLegendOnFilter();
    }

  });

  // Click event for clear filter button starts here
  $("#clearFilterBtn").click(function (e) {
    if (iHealthMap.unsetFilter()) {
      iHealthMap.clearFilterOptions()
      iHealthMap.loadLayer();
      $('.bs-example-modal-lg').modal('hide');

    }
  });
};

iHealthMap.clearFilterOptions = function () {
  iHealthMap.setFilterParam('');
  $('.icheckbox_minimal').removeClass('checked');
  $('.filterCheckBox:checkbox').attr("checked", false);
  iHealthMap.createLegendOnFilter();
}

iHealthMap.setFilter = function () {
  iHealthMap.isFilterApplied = 1;
  return true;
};

iHealthMap.unsetFilter = function () {
  iHealthMap.isFilterApplied = 0;
  $('.selectpicker').selectpicker('val', ''); // Resets the selection to first option i.e blank.
  $('.selectpicker').selectpicker('hide');
  $('.listBtn').show();
  return true;
};

iHealthMap.checkFilter = function () {
  return iHealthMap.isFilterApplied;
};

iHealthMap.setFilterParam = function (filterArr) {
  iHealthMap.filterParams = filterArr;
};

iHealthMap.getFilterParam = function () {
  return iHealthMap.filterParams;
}

iHealthMap.getFilteredRegions = function (listOfRegions) {
  //console.log(listOfRegions);
  var filterRegions = {};
  var originalData;


  if ($.isEmptyObject(iHealthMap.dataProviderWorkingFilteredCopy))
  {
    console.log('Filter not set use OLD object');
    originalData = iHealthMap.dataProviderWorkingCopy;
  }
  else
  {
    console.log('Filter Set set ');
    originalData = iHealthMap.dataProviderWorkingFilteredCopy;
  }

  console.log(originalData);
  iHealthMap.dataProviderWorkingFilteredCountryCopy = $.extend(true, {}, originalData);

  $.each(iHealthMap.dataProviderWorkingFilteredCountryCopy, function (year, dataForYear) {
    var temp = {};
    console.log(year);
    $.each(dataForYear, function (index, dataForCountries) {
      console.log(index);
      $.each(listOfRegions, function (index, regionObject) {
        if (dataForCountries.hasOwnProperty(regionObject.code)) {

          temp[regionObject.code] = dataForCountries[regionObject.code];
        }
      });
    });
    iHealthMap.dataProviderWorkingFilteredCountryCopy[year][0] = temp;
  });

  // var dataFilterParam = iHealthMap.getFilterParam();
  // if(dataFilterParam.length != 0){
  // iHealthMap.dataProviderWorkingFilteredCountryCopy = iHealthMap.getFilteredData(dataFilterParam);
  // }

  return iHealthMap.dataProviderWorkingFilteredCountryCopy;
};

iHealthMap.getFilteredData = function (param) {
  var filter = {};
  console.log(param);
  if ($.isEmptyObject(iHealthMap.dataProviderWorkingFilteredCountryCopy))
  {
    console.log('Filter not set use OLD object');
    iHealthMap.dataProviderWorkingFilteredCopy = $.extend(true, {}, iHealthMap.dataProviderWorkingCopy);
    console.log(iHealthMap.dataProviderWorkingFilteredCopy);
  }
  else
  {
    console.log('Filter Set set ');
    iHealthMap.dataProviderWorkingFilteredCopy = $.extend(true, {}, iHealthMap.dataProviderWorkingFilteredCountryCopy);
  }

  // Deep copy of original object

  filter.param = param;
  filter.truth = [];
  filter.flag = false;

  var list = iHealthMap.dataProviderWorkingFilteredCopy[iHealthMap.getCurrentyear()][0];
  console.log(filter);
  console.log(list);

  $.each(list, function (k, v) {

    $.each(filter.param, function (key, value) {
      var key = '';
      for (var fkey in v[3]) {
        if (v[3][fkey] != value.filterCode) {
          continue;
        } else {
          key = fkey;
          break;
        }
      }
      if (value.filterValue == v[0][key]) {
        filter.truth.push(true);
      } else {
        filter.truth.push(false);
      }
    });
    if ($.inArray(true, filter.truth) > -1) {
      filter.flag = true;
    } else {
      filter.flag = false;
    }
    filter.truth = [];
    // filter.flag = iHealthMap.filterateDataByParams(filter.param,v);
    if (filter.flag == false) {
      delete iHealthMap.dataProviderWorkingFilteredCopy[iHealthMap.getCurrentyear()][0][k];
    }
  });
  // iHealthMap.setFilterParamiHealthMap.setFilterParam ===== found something wrong.

  return iHealthMap.dataProviderWorkingFilteredCopy;
};

iHealthMap.filterateDataByParams = function (param, val) {
  var filterate = {};
  filterate.truth = [];
  filterate.flag = false;
  filterate.param = param;
  filterate.data = val;

  $.each(filterate.param, function (k, v) {
    var key = '';
    for (var fkey in filterate.data[3]) {
      if (filterate.data[3][fkey] != v.filterCode) {
        continue;
      } else {
        key = fkey;
        break;
      }
    }
    //console.log(v.filterValue);
    //console.log(filterate.data[0][key]);
    if (v.filterValue == filterate.data[0][key]) {
      filterate.truth.push(true);
    } else {
      filterate.truth.push(false);
    }
  });

  if ($.inArray(true, filterate.truth) > -1) {
    return true;
  } else {
    return false;
  }
};


iHealthMap.setCurrentyear = function (year) {

  console.log(year);

  iHealthMap.currentYear = year;
  return true;
}

iHealthMap.getCurrentyear = function () {
  return iHealthMap.currentYear;
}
// iHealthMap.removeSelectLayers = function(){
// 	//console.log('REMOVING SELECT LAYER');
// 	iHealthMap.map.removeLayer(incomeLayer);
// 	iHealthMap.map.removeLayer(telephoneLinesBarChart);
// 	iHealthMap.map.removeLayer(solidFuelLayer);
// 	selectLayer.removeFrom(iHealthMap.map);
// 	selectLayer = null;
// }
/* click event for clear filter button ends here  */

iHealthMap.reloadBaseLayer = function () {
  //console.log("Reloading base layer...");
  setTimeout(function () {
    iHealthMap.map.invalidateSize()
  }, 400);
};

// Get country details from ISO CODE 3.
iHealthMap.getCountryObjectFromAlpha3 = function (alpha3) {

  var countryObject = {};
  if (alpha3 != undefined)
  {
    for (obj in L.countryLookup)
    {
      //console.log(L.countryLookup[obj]);
      var objValue = L.countryLookup[obj];

      if (objValue['alpha-3'] == alpha3)
      {
        //console.log(objValue);
        countryObject.countryCode = objValue['country-code'];
        countryObject.countryName = objValue['name'];
        break;
      }
    }
  }

  return countryObject;
}

iHealthMap.setRegionFilter = function (param) {

  if (iHealthMap.regionFilter != param) {
    iHealthMap.isRegionFilterChanged = true;
  } else {
    iHealthMap.isRegionFilterChanged = false;
  }
  iHealthMap.regionFilter = param;
}

iHealthMap.checkRegionFilterChange = function () {
  return iHealthMap.isRegionFilterChanged;
}

iHealthMap.getRegionFilter = function () {
  return iHealthMap.regionFilter;
}

iHealthMap.setFilterType = function (filterType) {

  iHealthMap.filterType = filterType;
  return true;

}

iHealthMap.collapseBtnClick = function () {
  $(".collapseBtn").click(function (e) {

    //console.log($(this).offsetParent().next().is(':visible'));

    if ($(this).offsetParent().next().is(':visible')) { /* if it is true then hide all the button */
      //$(this).parent('.hideOnCollapse').hide();
      //$(this).closest('.hideOnCollapse').hide();
      $(this).parent().find(".hideOnCollapse").hide();
      $(this).attr('data-original-title', 'Expand');
      $('.selectpicker').selectpicker('hide');
      //$('.hideOnCollapse').hide();
    } else { /* if it is false then show all the buttons */
      //$('.hideOnCollapse').show();
      //$(this).closest('.hideOnCollapse').show();
      $(this).parent().find(".hideOnCollapse").show();
      $(this).attr('data-original-title', 'Collapse');
    }
  })
};

iHealthMap.setFullScreenZoomLevel = function (zoomLevel) {
  iHealthMap.mapFullscreenZoom = zoomLevel;
}

$(document).bind("fullscreenchange", function () {

  //console.log("Fullscreen " + ($(document).fullScreen() ? "on" : "off"));
  var offFullScreenZoomLevel = iHealthMap._defaultZoom;
  if (dMap.level == 'country') {
    offFullScreenZoomLevel = province._defaultZoom;
  }

  var fullscreen = $(document).fullScreen() ? "on" : "off";

  if (fullscreen === "on")
  {
    console.log(screen.width);
    console.log(screen.height);
    // This is the max num any system can process. So we set it to max number of the system. This will nullify the effect and default indexes will come into picture.
    $("#filterModal").css('z-index', '2147483647');
    $(".joyride-tip-guide").css('z-index', '2147483647');
    // $("#year-modal").css('z-index','2147483647');
    // $(".modal-backdrop").css('z-index','2147483647');
    $("#map-panel").width(screen.width);
    $("#map-panel").height(screen.height);
    $("#ihmap").height(screen.height - 60);
    console.log(iHealthMap.mapFullscreenZoom);
    // iHealthMap.map.setZoom(iHealthMap.mapFullscreenZoom);
    iHealthMap.reloadBaseLayer();
  }
  else
  {
    // $("#map-panel").width(iHealthMap.mapPanelWidth);
    $("#filterModal").css('z-index', '');
    $(".joyride-tip-guide").css('z-index', '');
    // $("#year-modal").css('z-index','');
    // $(".modal-backdrop").css('z-index','');
    $("#map-panel").height("");
    $("#map-panel").width("");
    $("#map-panel").attr('width', iHealthMap.mapPanelWidth);
    $("#ihmap").height(iHealthMap.mapHeight);
    // iHealthMap.map.setZoom(offFullScreenZoomLevel);
    iHealthMap.reloadBaseLayer();
  }
});
