var dureApp = {};

dureApp.lastUrlSegment = function() {
    var currPathname = window.location.pathname;
    var segments = currPathname.split('/')
    var lastSegment = segments.pop();
    return lastSegment;
};

if(dureApp.lastUrlSegment() == '' || dureApp.lastUrlSegment() == 'index.html' || dureApp.lastUrlSegment() == 'home.html' || dureApp.lastUrlSegment() == 'tab.html' || dureApp.lastUrlSegment() == 'slick.html' || dureApp.lastUrlSegment() == 'map.html'|| dureApp.lastUrlSegment() == 'chart.html' || dureApp.lastUrlSegment() == 'authenticate.html'){
    dureApp.relativePath = './dure/';
    dureApp.appPath = '';
    dureApp.seperator = '';
}else{
    dureApp.relativePath = '../dure/';
    dureApp.appPath = '';
    dureApp.seperator = '../';
}

head.js(
    {jquery: dureApp.relativePath + 'libraries/merge/g-jq-composite.all.min.js'},
/*g{jquery: dureApp.relativePath + 'libraries/jquery/2.1.1/jquery.min.js'},
  //  {jqMig: dureApp.relativePath + "libraries/jquery/plugins/jquery-migrate-1.1.1.js"},
    g{jqMig: dureApp.relativePath + "libraries/jquery/plugins/jquery.validate.min.js"},
    g{bootstrap: dureApp.relativePath + "libraries/bootstrap/3.2/js/bootstrap.js"},
    g{bs_wysihtml5: dureApp.appPath + "js/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js"},
    g{jqueryui: dureApp.appPath + "js/jquery-ui-1.10.3.min.js"},
    g{base64:dureApp.relativePath + "libraries/base64/base64.js"},
    g{touchpunch: dureApp.relativePath + "libraries/touchpunch/jquery.ui.touch-punch.min.js"},
    g{moment : dureApp.relativePath + 'libraries/moment/moment.min.js'},
    //{handlebarsjs : dureApp.relativePath + 'libraries/handlebars-js/handlebars-v3.0.3.js'},
     g{blockUIjs:dureApp.relativePath+"libraries/blockUI/jquery.blockUI.js"},
     g{jNotify: dureApp.relativePath + "libraries/jNotify/jquery/jNotify.jquery.min.js"},
    g{knob:  dureApp.appPath + "js/plugins/jqueryKnob/jquery.knob.js"},
    g{fullscreen: dureApp.relativePath + "libraries/fullscreen/jquery.fullscreen-min.js"},
     g{jStore: dureApp.relativePath + "libraries/sizeof/sizeof.compressed.js"},
    g{jStore: dureApp.relativePath + "libraries/jStorage.js"},
    g{modaloverlay: dureApp.relativePath + "libraries/modaloverlay/jquery.popupoverlay.js"},
    g{lteiCheck: dureApp.appPath + "js/plugins/iCheck/icheck.min.js"},
     {bootSelect: dureApp.relativePath + "libraries/bootstrap-select/js/bootstrap-select.js"},
*/

    {lteApp: dureApp.appPath + "js/AdminLTE/app.js"},
    {notify : dureApp.relativePath + 'libraries/noty/jquery.noty.packaged.min.js'},

     {jquery: dureApp.relativePath + 'libraries/merge/g-ll-composite.all.min.js'},

    //g{leaflet: dureApp.relativePath + 'libraries/leaflet/0.7.3/leaflet.js'},
     {leafletStamen: 'http://maps.stamen.com/js/tile.stamen.js?v1.2.3'},

    //g{leafletDvfJs: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/jsts/javascript.util.js'},

     {leafletDvfJst: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/jsts/jsts.js'},
    //{leafletDateFmt: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/date.format.js'},
    //{leafletGeoHash: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/geohash.js'},
    //g{leafletDvf: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/leaflet-dvf.min.js'},
    //g{leafletActiveLayers: dureApp.relativePath + 'libraries/leaflet/plugins/selectLayers/activelayers/leaflet.active-layers.min.js'},
    //g{leafletSelectLayers: dureApp.relativePath + 'libraries/leaflet/plugins/selectLayers/leaflet.select-layers.min.js'},
	{leafletSelectLayers: dureApp.relativePath + 'libraries/leaflet/plugins/scale/graphicScale.min.js'},

    {leafletWorldData: dureApp.appPath + 'data/worldGeo.js'},
    {leafletCountryData: dureApp.appPath + 'data/countryData.min.js'},
    {leafletHivCountryData: dureApp.appPath +'tempdata/hiv_country_staff.json'},
    //{leafletStatesData: dureApp.appPath + 'data/stateData.min.js'},
    //{barChartOverlayData: './data/populate.js'},
    //g{leafletLabel: dureApp.relativePath + 'libraries/leaflet/plugins/leaf-label/leaflet.label.js'},
    //g{leafletMarker: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-marker/leaflet.awesome-markers.js'},
    //g{googlejs: dureApp.relativePath + "libraries/leaflet/plugins/provider/Google.js"},
    {highchart: dureApp.relativePath + "libraries/highchart/js/highstock.js"},
    {highchartDrillDown: dureApp.relativePath + "libraries/highchart/js/modules/drilldown.js"},


    // {dataTables:"js/plugins/datatables/jquery.dataTables.js"},

     {jquery: dureApp.relativePath + 'libraries/merge/g-ut-composite.all.min.js'},

    //g{dataTables: dureApp.appPath + "js/plugins/datatables/jquery.dataTables.min.js"},
    //g{dataTablesBootstrap: dureApp.appPath + "js/plugins/datatables/dataTables.bootstrap.js"},
   // {dataTableTools: dureApp.appPath + "js/plugins/datatables/dataTables.tableTools.min.js"},
    //g{rgbcolor : dureApp.appPath + 'js/pdf_js/rgbcolor.js'},
    //g{canvg : dureApp.appPath + 'js/pdf_js/canvg.js'},
    //g{html2canvas : dureApp.appPath + 'js/pdf_js/html2canvas.js'},
    //g{jspdf : dureApp.appPath + 'js/pdf_js/jspdf.min.js'},
    //g{exporting : dureApp.appPath + 'js/pdf_js/exporting.js'},
    //g{tableExport: dureApp.relativePath + "libraries/tableExport/js/jspdf.plugin.autotable.js"},
    //g{tableXlExport: dureApp.relativePath + "libraries/tableExport/js/tableExport.js"},
    {base64: dureApp.relativePath + "libraries/tableExport/js/jquery.base64.js"},
    //{fabricjs: dureApp.relativePath + 'libraries/fabric/fabric.js'},
    //g{slick: dureApp.relativePath + "libraries/slick/slick.min.js"},
    {ihealthCountryIdMapping: dureApp.relativePath+ '../data/codes.js'},
    {dureConfigure: dureApp.relativePath + 'scripts/DureConfigure.js'},
    {ihealth_overlays: dureApp.relativePath + 'scripts/DureOverlays.js'},
    {ihealth_core: dureApp.relativePath + 'scripts/DureCore.js'},
    //{ihealth_menu: dureApp.relativePath + 'scripts/DureMenu.js'},
    {ihealth_util: dureApp.relativePath + 'scripts/DureUtil.js'},
    {ihealth_map: dureApp.relativePath + 'scripts/DureMap.js'},
    {ihealth_map_indicator: dureApp.relativePath + 'scripts/DureMapIndicator.js'},
    {ihealth_map_subprovince: dureApp.relativePath + 'scripts/DureMapSubprovince.js'},
    {ihealth_map_local: dureApp.relativePath + 'scripts/DureMapLocal.js'},
    {ihealth_map_indicator: dureApp.relativePath + 'scripts/DureRegion.js'},
    {ihealth_chart: dureApp.relativePath + 'scripts/DureChart.js'},
    {ihealth_tables: dureApp.relativePath + 'scripts/DureTables.js'},
    {ihealth_export: dureApp.relativePath + 'scripts/DureExport.js'},
    {ihealth_app_map: dureApp.appPath +'application/DureApplicationMap.js'},
    {ihealth_app_chart: dureApp.appPath +'application/DureApplicationChart.js'},
    {ihealth_app_table: dureApp.appPath +'application/DureApplicationTable.js'},
    {ihealth_app_ken: dureApp.appPath +'application/DureWHO.js'},
    {ihealth_core: dureApp.relativePath + 'scripts/DurePopup.js'},
    {ihealth_core: dureApp.relativePath + 'scripts/DureBenchmark.js'},
    {ihealth_core: dureApp.relativePath + 'scripts/DureLogin.js'},
    {ihealth_app_loadlayout: dureApp.appPath +'application/DureApplicationLoadLayout.js'}

);
