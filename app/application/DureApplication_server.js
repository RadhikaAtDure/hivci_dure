var dureApp = {};

dureApp.lastUrlSegment = function() {
    var currPathname = window.location.pathname;
    var segments = currPathname.split('/')
    var lastSegment = segments.pop();
    return lastSegment;
};

if(dureApp.lastUrlSegment() == 'home.html' || dureApp.lastUrlSegment() == 'map.html'|| dureApp.lastUrlSegment() == 'chart.html' || dureApp.lastUrlSegment() == 'authenticate.html'){
    dureApp.relativePath = './dure/';
	dureApp.appPath = '';
    dureApp.seperator = '';
}else{
    dureApp.relativePath = './dure/';
	dureApp.appPath = '../';
    dureApp.seperator = '../';
}
/*
if(dureApp.lastUrlSegment() == 'home.html' || dureApp.lastUrlSegment() == 'map.html'|| dureApp.lastUrlSegment() == 'chart.html' || dureApp.lastUrlSegment() == 'authenticate.html'){
    dureApp.relativePath = './dure/';
    dureApp.seperator = '';
}else{
    dureApp.relativePath = '../dure/';
    dureApp.seperator = '../';
}*/

head.js(
	    {jquery: dureApp.relativePath + 'libraries/jquery/2.1.1/jquery.min.js'},
	    {jqMig: dureApp.relativePath + "libraries/jquery/plugins/jquery-migrate-1.1.1.js"},
	    {bootstrap: dureApp.relativePath + "libraries/bootstrap/3.2/js/bootstrap.js"},
	    {jqueryui: dureApp.appPath + "js/jquery-ui-1.10.3.min.js"},
	    {touchpunch: dureApp.relativePath + "libraries/touchpunch/jquery.ui.touch-punch.min.js"},
	    {leaflet: dureApp.relativePath + 'libraries/leaflet/0.7.3/leaflet.js'},
		{bs_wysihtml5: dureApp.appPath + "js/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js"},
	    {lteApp: dureApp.appPath + "js/AdminLTE/app.js"},
	    {lteDash: dureApp.appPath + "js/AdminLTE/dashboard.js"},
	    {leafletStamen: 'http://maps.stamen.com/js/tile.stamen.js?v1.2.3'},
	    {leafletMapboxZoom: 'https://api.tiles.mapbox.com/mapbox.js/plugins/leaflet-zoomslider/v0.7.0/L.Control.Zoomslider.js'},
	    {leafletDvfJs: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/jsts/javascript.util.js'},
	    {leafletDvfJst: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/jsts/jsts.js'},
	    {leafletDateFmt: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/date.format.js'},
	    {leafletGeoHash: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/examples/lib/geohash.js'},
	    {leafletDvf: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/leaflet-dvf.min.js'},
	    {leafletActiveLayers: dureApp.relativePath + 'libraries/leaflet/plugins/selectLayers/activelayers/leaflet.active-layers.min.js'},
	    {leafletSelectLayers: dureApp.relativePath + 'libraries/leaflet/plugins/selectLayers/leaflet.select-layers.min.js'},
	    //{leafletIncomeData: dureApp.relativePath +  'libraries/leaflet/plugins/leaflet-dvf/data/incomesData.js'},
	    //{leaflettelephoneLines: dureApp.relativePath +  'libraries/leaflet/plugins/leaflet-dvf/data/telephoneLines.js'},
	    //{leafletsolidFuels: dureApp.relativePath +  'libraries/leaflet/plugins/leaflet-dvf/data/solidFuels.js'},
	    //{leafletPopulationDensity: dureApp.relativePath +  'libraries/leaflet/plugins/leaflet-dvf/data/populationDensity.js'},
	    {leafletWorldData: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/data/worldGeo.js'},
	    {leafletCountryData: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/data/countryData.min.js'},
		{leafletStatesData: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-dvf/data/stateData.min.js'},
		{leafletLabel: dureApp.relativePath + 'libraries/leaflet/plugins/leaf-label/leaflet.label.js'},
	    {leafletMarker: dureApp.relativePath + 'libraries/leaflet/plugins/leaflet-marker/leaflet.awesome-markers.js'},
	    {googlejs: dureApp.relativePath + "libraries/leaflet/plugins/provider/Google.js"},
	    {highchart: dureApp.relativePath + "libraries/highchart/js/highcharts.src.js"},
		{highchartDrillDown: dureApp.relativePath + "libraries/highchart/js/modules/drilldown.js"},
	    {bootSelect: dureApp.relativePath + "libraries/bootstrap-select/js/bootstrap-select.js"},
	    {fullscreen: dureApp.relativePath + "libraries/fullscreen/jquery.fullscreen-min.js"},
	    {jNotify: dureApp.relativePath + "libraries/jNotify/jquery/jNotify.jquery.min.js"},
	    {knob:  dureApp.appPath + "js/plugins/jqueryKnob/jquery.knob.js"},
	    {jStore: dureApp.relativePath + "libraries/jStorage.js"},
	    {modaloverlay: dureApp.relativePath + "libraries/modaloverlay/jquery.popupoverlay.js"},	    
	    {lteiCheck: dureApp.appPath + "js/plugins/iCheck/icheck.min.js"},
	    {dataTables: dureApp.appPath + "js/plugins/datatables/jquery.dataTables.min.js"},
	    {dataTablesBootstrap: dureApp.appPath + "js/plugins/datatables/dataTables.bootstrap.js"},
	    {dataTableTools: dureApp.appPath + "js/plugins/datatables/dataTables.tableTools.min.js"},
	    {lteDatepicker: dureApp.appPath + "js/plugins/daterangepicker/daterangepicker.js"},
	    {blockUIjs:dureApp.relativePath+"libraries/blockUI/jquery.blockUI.js"},
	    {rgbcolor : dureApp.appPath + 'js/pdf_js/rgbcolor.js'},
	    {canvg : dureApp.appPath + 'js/pdf_js/canvg.js'},
	    {html2canvas : dureApp.appPath + 'js/pdf_js/html2canvas.js'},
	    {jspdf : dureApp.appPath + 'js/pdf_js/jspdf.min.js'},
	    {exporting : dureApp.appPath + 'js/pdf_js/exporting.js'},	
	    {tableExport: dureApp.relativePath + "libraries/tableExport/js/jspdf.plugin.autotable.js"},
	    {tableXlExport: dureApp.relativePath + "libraries/tableExport/js/tableExport.js"},
	    {base64: dureApp.relativePath + "libraries/tableExport/js/jquery.base64.js"},
		{fabricjs: dureApp.relativePath + 'libraries/fabric/fabric.js'},
		{tinycolor: dureApp.relativePath + 'libraries/fabric/tinycolor.js'},
		{ihealthCountryIdMapping: dureApp.appPath + 'data/codes.js'},
	    {ihealth_masterList: dureApp.relativePath + 'scripts/DureMasterScript.js'},
		{ihealth_app_script: dureApp.seperator+'application/DureApplicationScript.js'},
		//{ihealth_app_loadlayout: dureApp.seperator +'application/DureApplicationLoadLayout.js'},
		{ihealth_export: dureApp.relativePath + 'scripts/DureExport.js'}
	);