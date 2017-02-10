var iHealthTable = {};
var tabularJSON = [];
var iHtableObj = {};
var tabularCols = [];
iHealthTable.initialize = function(){
    iHealthTable.columns = [];
    iHealthTable.column_values = [];
    iHealthTable.column_count = 0;
    iHealthTable.req_cols = 20;
    iHealthTable.maxColumnsSupported = 20;
    iHealthTable.tabFormattedObj = {};
    iHealthTable.geoJSON = dureUtil.geoJson;
    //Load table data.
    iHealthTable.load();

};

/**************************************************** SECTION: TABLE DATA ****************************************************/

// Sets the data for table.
iHealthTable.setData = function(data){
    iHealthTable.data = data;
	
	console.log(" Setting the table data ");
    //console.log(iHealthTable.data);
    // iHealthTable.data = data.extractedObjects; // Commented for JH Hopkins by Shone
    return true;
}


//Get the  data for table
iHealthTable.getData = function(){
    //console.log("Giving the table data ");
    return iHealthTable.data;
};

/**************************************************SECTION: Display Tabular Data *********************************************/


iHealthTable.load = function(){

    var tableData = iHealthTable.getData();
    // Check Local and call Load Data
    iHealthTable.loadData(tableData.extractedObjects);
}

iHealthTable.loadData = function(tableData){

    // Commented by shone for JH project
    // iHealthTable.prepareCoreData(iHealthTable.data.coreData);
    // iHealthTable.prepareExtensionData(iHealthTable.data.extensiondata);
    // iHealthTable.prepareDerivedData(iHealthTable.data.derivedData);
    // iHealthTable.displayTable(iHealthTable.tabFormattedObj);
	
    //console.log("Loading the data tables for the user view.");
    //console.log("this is the load data for table ");
    //console.log(tableData);

    var table = {};
    if(tableData != undefined){

        // For extension data prepare object.
        if(tableData.extensionData != undefined) {

            // MODIFIED BY  SHONE === JH PROJECT EARLIER CODE
            // table.extData = table.data.worldIndicatorDataExt[0];
            //table.result = iHealthTable.getFormatedDataValues(table.extData);

            table.result = iHealthTable.prepareExtensionData(tableData.extensionData);
        } else if(tableData.coreData != undefined) { // For core data prepare object

            table.result = iHealthTable.prepareCoreData(tableData.coreData);
        }
    }

	//console.log("this is the prepared data for table ");
	//console.log(table.result);
    iHealthTable.displayTable(table.result);
};


iHealthTable.prepareCoreData = function(data){

    iHealthTable.tabFormattedObj.dataForAllYears = $.extend(true,{},data);
    iHealthTable.tabFormattedObj.uniqueCols = [];
    iHealthTable.tabFormattedObj.colValues = [];

	//console.log(iHealthTable.tabFormattedObj);
    tabularJSON = [];
	
    var coreColumns = [];
    var coreRows = [];      // Set One Array of Arrays of Values (not Objects)  a[0] = 'A' , a[1] = 'B' XXX === a['A','B']
    var rowCount = 0;
    $.each(iHealthTable.tabFormattedObj.dataForAllYears[0], function (index, dataForOneYear) {

            var countOfRows = dataForOneYear[0].length;
			//console.log(index);
			//console.log(dataForOneYear);

            $.each(dataForOneYear[0],function (indexdataForThisLocation, dataForThisLocation) {

				
                if( dureUtil.getDataLevel() == 'country') {
                    locationName = dureUtil.getNameFromGeoCode(indexdataForThisLocation,  dureUtil.geoJson);
                }
                if(dureUtil.getDataLevel() == 'world'){
                    locationName = dureUtil.getCountryNamefromIso(indexdataForThisLocation);    
                }
				
				if(locationName != undefined){
			
					var jsonTableObject = {};
					var formattedObject = {};
					var jsonDataArray = new Array();
					var locationName;
					
					//console.log(dataForThisLocation);
					
					coreColumns = iHealthTable.cleanArray(dataForThisLocation[1]);	
					
					coreColumns.unshift('Year'); // Data Period Column
					coreColumns.unshift('Location'); // Province Name Column
					
                    dataForThisLocation[0] =  iHealthTable.cleanArray(dataForThisLocation[0]);
					var coreData =  dataForThisLocation[0];
					coreData.unshift(index); // Data Period Value		
					coreData.unshift(locationName); // Province Name Value
												
					//console.log(coreData);
					var dimensionForArray = coreData.length;

					dimensionForArray = dimensionForArray + 1  // Add Province Name Column

					iHealthTable.tabFormattedObj.colValues[rowCount]=new Array();
					
					var i = 0;
					for (j=0;j<dimensionForArray;j++) {

						if(coreData[j] != undefined && coreData[j] != null){
							
							if (coreData[j] == -10) {
								iHealthTable.tabFormattedObj.colValues[rowCount][i] = 'Treat All';
							} else if (coreData[j] == -1) {
								iHealthTable.tabFormattedObj.colValues[rowCount][i] = 'NA';
							} else {
								iHealthTable.tabFormattedObj.colValues[rowCount][i] = coreData[j];
							}								

							if(j == (dimensionForArray - 1))
							{
								iHealthTable.tabFormattedObj.colValues[rowCount][i] = indexdataForThisLocation;
							}
							
							i++;
						}
					}								

					rowCount++;

					var i=0;
                     for(var h = 0; h < coreColumns.length; h++) {
                           
						//console.log(dataForThisLocation[0][h]);
						   
						if(dataForThisLocation[0][h] != undefined){
						   
							if(dataForThisLocation[0][h] == 'Côte d’Ivoire'){
								jsonTableObject['col' + i] = 'Cote d Ivoire';
								
							} else if(dataForThisLocation[0][h] == -10){
								jsonTableObject['col' + i] = 'Treat All';
							} else if(dataForThisLocation[0][h] == '' || dataForThisLocation[0][h] == -1){
								jsonTableObject['col' + i] = 'N/A';
							} else {
								
								if ($.isNumeric(dataForThisLocation[0][h])) {
									jsonTableObject['col' + i] = dataForThisLocation[0][h];
								} else {
									jsonTableObject['col' + i] = dataForThisLocation[0][h].toString().replace(/[^a-z0-9.\s]/gi, ' ');
								}																
							}
							i++;
						}
                     }
					
                    //console.log(jsonTableObject);
					tabularJSON.push(jsonTableObject);
					//coreRows.push([1],[2],[3]);
				}
            });

    });

    //console.log(coreData);
	
    if(coreColumns != undefined && coreColumns.length > 0 ){
        iHealthTable.tabFormattedObj.uniqueCols = coreColumns;     // Append iHealthTable.tabFormattedObj
    }

    $.each(iHealthTable.tabFormattedObj.uniqueCols,function(k,v){
        var cols = {};
        cols.title = v.toUpperCase();
        cols.key = v;
        tabularCols.push(cols);

    });

    if(tabularJSON != undefined){
        iHealthTable.exportTableData(tabularJSON,tabularCols);
    }

	//console.log(iHealthTable.tabFormattedObj);
	
    return iHealthTable.tabFormattedObj;

}

iHealthTable.prepareExtensionData = function(data){

    // Append iHealthTable.data
    var tabFormattedObj = {};
    tabFormattedObj.dataForAllYears = data[0];
    tabFormattedObj.uniqueCols = [];
    tabFormattedObj.uniqueCols = ["Country"];
    tabFormattedObj.colValues = [];
    tabularJSON = [];
	
    $.each(tabFormattedObj.dataForAllYears, function (year, dataForOneYear) {
        $.each(dataForOneYear[0],function (index, countriesForThisYear) {

                var formattedObject = {};
                var jsonTableObject = {};

                // Formating objects and fetch only desired data from the given data .

                formattedObject.countryCode = index;
                formattedObject.countryName = iHealthTable.getCountryNameFromKey(index);
                formattedObject.columnName = countriesForThisYear[1][0];

                // The name of the columns to be dispalyed
                tabFormattedObj.uniqueCols = iHealthTable.setUniqueValueInArray(tabFormattedObj.uniqueCols,formattedObject.columnName);
                //The value of the above respective cols to be displayed.
                formattedObject.columnValue = countriesForThisYear[0][0];

                formattedObject.year = year;
                var valueArray = [];
                valueArray.push(formattedObject.countryName,formattedObject.columnValue,formattedObject.year);
                tabFormattedObj.colValues.push(valueArray);

                //    The json object that is to be used for creating pdf and printing data on paper.

                jsonTableObject['Country'] = formattedObject.countryName;
                jsonTableObject[formattedObject.columnName] = formattedObject.columnValue;
                jsonTableObject['Year'] = formattedObject.year;
                // Final complete object for creating pdf and printing
                tabularJSON.push(jsonTableObject);

        });
    });

    tabFormattedObj.uniqueCols.push('Year');

    $.each(tabFormattedObj.uniqueCols,function(k,v){
        var cols = {};
        cols.title = v.toUpperCase();
        cols.key = v;
        tabularCols.push(cols);
    });


    // console.log(tabularJSON);
    // console.log(tabularCols);
    if(tabularJSON != undefined){
        iHealthTable.exportTableData(tabularJSON,tabularCols);
    }
	
	//console.log(tabFormattedObj);
    return tabFormattedObj;
}


iHealthTable.prepareDerivedData = function(data){

    // Append iHealthTable.data
}


iHealthTable.getFormatedDataValues = function(data){

    var tabFormattedObj = {};
    tabFormattedObj.dataForAllYears = data;
    tabFormattedObj.uniqueCols = [];
    tabFormattedObj.uniqueCols = ["Country"];
    tabFormattedObj.colValues = [];
    tabularJSON = [];
    $.each(tabFormattedObj.dataForAllYears, function (year, dataForOneYear) {
        $.each(dataForOneYear[0],function (index, countriesForThisYear) {

                var formattedObject = {};
                var jsonTableObject = {};

                // Formating objects and fetch only desired data from the given data .

                formattedObject.countryCode = index;
                formattedObject.countryName = iHealthTable.getCountryNameFromKey(index);
                formattedObject.columnName = countriesForThisYear[1][0];

                // The name of the columns to be dispalyed
                tabFormattedObj.uniqueCols = iHealthTable.setUniqueValueInArray(tabFormattedObj.uniqueCols,formattedObject.columnName);
                //The value of the above respective cols to be displayed.
                formattedObject.columnValue = countriesForThisYear[0][0];

                formattedObject.year = year;
                var valueArray = [];
                valueArray.push(formattedObject.countryName,formattedObject.columnValue,formattedObject.year);
                tabFormattedObj.colValues.push(valueArray);

                //    The json object that is to be used for creating pdf and printing data on paper.

                jsonTableObject['Country'] = formattedObject.countryName;
                jsonTableObject[formattedObject.columnName] = formattedObject.columnValue;
                jsonTableObject['Year'] = formattedObject.year;
                // Final complete object for creating pdf and printing
                tabularJSON.push(jsonTableObject);

        });
    });

    tabFormattedObj.uniqueCols.push('Year');

    $.each(tabFormattedObj.uniqueCols,function(k,v){
        var cols = {};
        cols.title = v.toUpperCase();
        cols.key = v;
        tabularCols.push(cols);
    });


    // console.log(tabularJSON);
    // console.log(tabularCols);
    if(tabularJSON != undefined){
        iHealthTable.exportTableData(tabularJSON,tabularCols);
    }
    return tabFormattedObj;
};

iHealthTable.getCountryNameFromKey = function(key){
    var country = L.countryLookup;
    var name = '';
    if(key != undefined)
    {
        for(var k in country){
            if(country[k]['alpha-3'] == key){
                name = country[k].name;
                break;
            }
        }
    }
    return name;
};

iHealthTable.setUniqueValueInArray = function(inputArray,inputValue){
        if(inputValue != undefined)
        {
            if(inputArray == undefined) {inputArray = []};

            if ((jQuery.inArray(inputValue, inputArray)) == -1)
                 {
                     inputArray.push(inputValue);
                 }
        }
        return inputArray;
 }

 iHealthTable.displayTable = function(data){
    var tableHtml = {};
    tableHtml.colHeader = '';
    if(data != undefined){
        tableHtml.data = data;
        for(var i= 0; i < tableHtml.data.uniqueCols.length ; i++)
        {
            if(tableHtml.data.uniqueCols.length < iHealthTable.maxColumnsSupported){
                tableHtml.colHeader += "<th>"+tableHtml.data.uniqueCols[i]+"</th>"; // HTML table column header
            }
        }


        // Append table header cols
        if($('#ihTable').find('th').length != 0){
            //console.log("Table exsist");
            iHtableObj.fnClearTable();
            iHtableObj.fnDestroy();
            $('#ihTable').children('thead').children('tr').children('th').remove();
            $('#ihTable').children('thead').children('tr').html(tableHtml.colHeader);
            $('#ihTable').dataTable({
                "data": tableHtml.data.colValues,
                "responsive": true,
                "iDisplayLength": 20,
                "lengthMenu": [ 20,50,100,200],
               // "sScrollX": "500px",
                "sScrollY": "360px"
            });
        }else{
        $('#ihTable').children('thead').children('tr').html(tableHtml.colHeader);
        //Initialize Data Tables.
        iHtableObj = $('#ihTable').dataTable({
                        "data": tableHtml.data.colValues,
                        "responsive": true,
                        "iDisplayLength": 20,
						"lengthMenu": [ 20,50,100,200],
                       // "sScrollX": "500px",
                        "sScrollY": "360px"
                    });
            $(".exportXlsBtn").click(function(){

                $('#ihTable').tableExport({type:'excel', tableName:'iVizard_'+Date.now(), escape:'false',tableJsonData: tabularJSON});
            });
        }
    }
 };

 // Check Data Level
iHealthTable.checkDataLevel = function(){
    if(iHealthTable.dataLevel == 'target'){
        return 0
    }else{
        return 1;
    }
};

// Set the indicator data type
iHealthTable.setIndicatorDataType = function(){
    if(dureUtil.getIndicatorMetaInfoByParam('dataFormat') != undefined){
        iHealthTable.indicatorType = dureUtil.getIndicatorMetaInfoByParam('dataFormat');
        //console.log(iHealthTable.indicatorType);
    }
    return true;
}

// Get the indicator data type - standard/non-standard
iHealthTable.getIndicatorDataType = function(){
    return iHealthTable.indicatorType;
}

iHealthTable.exportTableData = function(tableJSON,tableCols){
    $('.exportBtn').click(function(e){
        var exportTbl = {};
        exportTbl.fontSize = 12;
        exportTbl.height = 0;
        exportTbl.data = [];
        exportTbl.data = tableJSON;

        doc = new jsPDF('p', 'pt', 'a4', true);
        doc.setFont("courier", "normal");
        doc.setFontSize(exportTbl.fontSize);

        height = doc.autoTable(tableCols,exportTbl.data, {xstart:10,ystart:10,tablestart:70,marginleft:50});
        doc.save('iVizard_'+Date.now()+'.pdf');
    });

}

// Remove empty elements from array

iHealthTable.cleanArray = function (actual) {
  var newArray = new Array();
  for(var i = 0; i<actual.length; i++){
      if (actual[i]){
        newArray.push(actual[i]);
    }
  }
  return newArray;
}