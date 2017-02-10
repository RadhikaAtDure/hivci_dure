var dureDataRepository = {};

dureDataRepository.initObj = function() {
	
	if(dureUser.checkUserLoginStatus()) {
		
		dureDataRepository.getCountryListJson();
		dureDataRepository.countriesFilePath = null;
	} else {
		$('#login-modal').modal({backdrop: 'static'},'show');
	}
	
}


dureDataRepository.getCountryListJson = function() {
	
	var serviceUrl = dureUser.AppBaseURLContext+'dataapi/target/all/countryData?callback=dureDataRepository.callback_GetCountryJson';
	dureService.getCountryInfoList(serviceUrl);
};

dureDataRepository.callback_GetCountryJson = function(resp) {
 dureDataRepository.countriesList = resp;
 dureDataRepository.prepareRegionDataRepoTable();
 dureDataRepository.getFileAccesspath(dureDataRepository.prepareCountryDataRepoTable);
}

dureDataRepository.getFileAccesspath = function(callBack) {
	$.getJSON( "tempdata/garpr_filename_list.json", function( data ) {
		dureDataRepository.countriesFilePath = data.data;
		callBack();
	});
}
		   	   
dureDataRepository.prepareCountryDataRepoTable = function() {
	var htmlTemplateCountries = '<table id="country-table" class="table table-bordered table-hover" cellspacing="0" width="100%"></table>';
	var dataSet = [];
    dureDataRepository.countriesList.features.map( function(e){
		if(dureDataRepository.countriesFilePath[e.properties.iso_a3] != undefined) {
			let name = e.properties.name;
			let iso_a2 = e.properties.iso_a2;
			let iso_a3 = e.properties.iso_a3;
			let documentPath = dureDataRepository.countriesFilePath[e.properties.iso_a3].document_path;
			dataSet.push([name, iso_a2, iso_a3, documentPath]);
			
		}
	});
	$('#country-data-repository').html(htmlTemplateCountries);
	$('#country-table').DataTable( {
		//"dom": '<"top"i>rt<"bottom"flp><"clear">',
        data: dataSet,
        columns: [
            { title: "Name","fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<span class="f32"><span class="flag ' + oData[1].toLowerCase() + '"></span>&nbsp;&nbsp;' + sData + '</span>');
            }},
            { title: "Download Document" ,"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<a  download class="btn btn-default btn-sm" href="' + oData[3] + '"><span class="glyphicon glyphicon-cloud-download"></span> Download file</a>');
            }}
        ],
		 initComplete: function () {

            this.api().columns([0]).every( function () {
                var column = this;
				var select = $('<select><option value="">All</option></select>')
                    .appendTo( $(column.header()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
 
                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    } );
 
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                } );
            } );
        }
    }
	);
}

dureDataRepository.prepareRegionDataRepoTable = function() {
	var htmlTemplateRegion = '<table id="region-table" class="table table-bordered table-hover" cellspacing="0" width="100%"></table>';
	
	var dataSet = [
	['African Region', 'afr', 'africanregion.xlsx'],
	['Eastern Mediterranean Region', 'emr', 'easternmediterraneanregion.xlsx'],
	['European Region', 'er', 'europeanregion.xlsx'],
	['Region of the Americas', 'ra', 'regionoftheamericas.xlsx'],
	['South-East Asia Region', 'sear', 'southeastasiaregion.xlsx'],
	['Western Pacific Region', 'wpr', 'westernpacificregion.xlsx']
	]
	$('#region-data-repository').html(htmlTemplateRegion);
	$('#region-table').DataTable( {
		//"dom": '<"top"i>rt<"bottom"flp><"clear">',
        data: dataSet,
        columns: [
            { title: "Name","fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('</span>&nbsp;&nbsp;' + sData + '</span>');
            }},
            { title: "Download Document" ,"fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
              $(nTd).html('<a  download class="btn btn-default btn-sm" href="tempdata/garpr-region/' +oData[2]+ '"><span class="glyphicon glyphicon-cloud-download"></span> Download file</a>');
            }}
        ]
    }
	);
}