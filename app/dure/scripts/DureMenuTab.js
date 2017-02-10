var ihealthMenu ={};

ihealthMenu.createTargetMenuForSidebar = function(){

	var appObj = {};
	var sidebarMenu;
	appObj = dureUtil.getCurrentViewKey('APPPROFILE');

	//console.log(appObj);

	sidebarMenu = ihealthMenu.buildTargetTreeViewForMenu(appObj.applications[0].targetGroups);

	if(sidebarMenu) {

		$('.sidebar-menu').append(sidebarMenu);
		x_navigation();
	}

	//alert($('.indicator').size());

	//$(document).on('click','.sidebar-menu a',function(){
	$('.indicator').on('click', function() {
    var $this = $(this),
	$bc = $('<li class="item"></li>');

	if($this.hasClass('indicator')){

		dureApp.titleObj = $(this);

		/*if(event == undefined){
			event = window.event;
		}
		event.stopPropagation();*/

		iHealthMap.unsetFilter();
		var check,targetId,target_id,targetRes,indicatorRes,indicatorId;
		indicatorId = $(this).attr('id');
		/*----------------- Commented for VIEW HUB ----------------*/
		//targetId = $(this).parents('.treeview').first().siblings('li').find('.target').attr('id');
		targetId = $(this).parents('.treeview').first().find('.target').attr('id');
		console.log(targetId);
		$('#sliderPause').trigger('click');
		targetRes = targetId.split("_");
		indicatorRes = indicatorId.split("_");
		dureUtil.setIndicatorMenuId(indicatorId)
		target_flag = dureUtil.setTargetId(parseInt(targetRes[1]));
		indicator_flag = dureUtil.setIndicatorId(parseInt(indicatorRes[1]));
		console.log(indicator_flag);
		dureUtil.setIndicatorYearLimits(dureUtil.appProfile.indicatorMinMaxYear);
		$.noty.closeAll();
		if($('#c3').is(':checked')) {
			//$('#c3').trigger('click');
      $('#c3').bootstrapToggle('off')
		}
		if(indicator_flag){
			//console.log("Data Level == ");
			console.log(dureUtil.getDataLevel());
			// Fix Me :(
			dureUtil.setDataLevel('world');
			dMap.setLevel('world');

			if(dureUtil.getDataLevel() == 'world'){
				dMap.setLevel('world');
				iHealthMap.map.setView(new L.LatLng(iHealthMap._lat,iHealthMap._long), 2);
				dureUtil.getWorldIndicatorData();

			}else{
				dMap.setLevel('country');
				dureUtil.getIndicatorData();
			}
		}

		$this.parents('li').each(function(n, li) {
			var $a = $(li).children('a').clone();

				if(n == 0){
					$bc.prepend(' <a href="#"><i class="fa fa-angle-double-right"></i><b style="font-size: medium">'+$a.eq(0).text()+'</b></a> ');
				}else{
					$bc.prepend(' <a href="#">' + $a.eq(0).text() + '</a> ');
				}

        });
        $('.breadcrumb').html($bc);

	}else{

		$this.parents('li').each(function(n, li) {
			var $a = $(li).children('a').clone();
			//$bc.prepend(' <a href="#"><i class="fa fa-angle-double-right"></i></a> ', $a.eq(0).text());

				if(n == 0){
					$bc.prepend('<a href="#"><i class="fa fa-angle-double-right"></i><b style="font-size: medium">' + $a.eq(0).text() + '</b></a> ');
				}else{
					$bc.prepend('<a href="#">' + $a.eq(0).text() + '</a> ');
				}

        });
        $('.breadcrumb').html($bc);
	}
	return false;

});
}

// Function stores target menu for sidebar
ihealthMenu.storeSidebarMenu = function(val){
	var key = "sidebarMenu";
	dureUtil.storeAtLocal(key,val);
}

/* Tree for tab view */

     /*  <li class="xn-openable">
                        <a href="#"><span class="fa fa-th"></span> <span class="xn-text">Indicator Group</span></a>
                        <ul>
							<li><a href="#">People with HIV</a></li>
							<li><a href="#">New HIV Infections</a></li>
							<li><a href="#">Malaria Cases</a></li>
							<li><a href="#">HIV-TB Deaths</a></li>
                            <li class="xn-openable">
                                <a href="#"><span class="fa fa-info-circle"></span> Indicator sub group</a>
                                <ul>
                                    <li><a href="#">Population - World</a></li>
                                    <li><a href="#">Health Facilities</a></li>
									 <li><a href="#">Countries Spending</a></li>
                                </ul>
                            </li>
                        </ul>
        </li>  */


// Function builds Target Tree view required for menu .Example of the treeview is given below.
/*
	 <li class="treeview">
		<a href="#"><i class="fa fa-th"></i> <span>Targets</span><i class="fa pull-right fa-angle-left"></i></a>
		<ul class="treeview-menu" style="display: none;">
			<li><a href="#" style="margin-left: 10px;"><i class="fa fa-angle-double-right"></i> Target 1</a></li>
			<li class="treeview active">
				<a href="#" style="margin-left: 10px;"><i class="fa fa-th"></i> <span>Indicators</span><i class="fa fa-angle-double-right"></i></a>
				<ul class="treeview-menu" style="display: block;">
					<li><a href="#" style="margin-left: 20px;"><i class="fa fa-angle-double-right"></i> Indicator 1</a></li>
				</ul>
			</li>
			<li><a href="#" style="margin-left: 10px;"><i class="fa fa-angle-double-right"></i> Target 2</a></li>
			<li><a href="#" style="margin-left: 10px;"><i class="fa fa-angle-double-right"></i> Target 3</a></li>
		</ul>
	</li>
*/
ihealthMenu.buildTargetTreeViewForMenu = function(targetGrpObj){

		var targetTreeView = '';
		for(var i = 0 ; i < targetGrpObj.length; i++){

			//console.log(dureConfig.getUserTargetId());
			//console.log(targetGrpObj[i].targets[0].targetId);

		/* 	if (targetGrpObj[i].targets[0].targetId == dureConfig.getUserTargetId()) {

				targetTreeView += "<li class='treeview'>"+
										"<a href='#'>"+
											"<i class='fa fa-th'></i> <span>"+targetGrpObj[i].targetGroupName+"</span>"+

											"<i class='fa pull-right fa-angle-left'></i>"+
										 "</a>";
				var targetMenu = ihealthMenu.getTargetMenuForTargetGroup(targetGrpObj[i].targets);
				targetTreeView += targetMenu+"</li>";
			} */

			if (targetGrpObj[i].targets[0].targetId == dureConfig.getUserTargetId()) {

				//console.log(targetGrpObj[i].targetGroupName);

				//targetTreeView += "<li class='xn-openable treeview'>"+
				//						"<a href='#'>"+
				//							"<i class='fa fa-th'></i> <span class='xn-text'>"+targetGrpObj[i].targetGroupName+"</span>"+
				//						"</a>";
				var targetMenu = ihealthMenu.getTargetMenuForTargetGroup(targetGrpObj[i].targets);
				targetTreeView += targetMenu+"";
			}


		}

		return targetTreeView;

}

// Creates TARGET menus for particular Target group .
ihealthMenu.getTargetMenuForTargetGroup = function(targetObj){
/*     <ul>
							<li><a href="#">People with HIV</a></li>
							<li><a href="#">New HIV Infections</a></li>
							<li><a href="#">Malaria Cases</a></li>
							<li><a href="#">HIV-TB Deaths</a></li>
                            <li class="xn-openable">
                                <a href="#"><span class="fa fa-info-circle"></span> Indicator sub group</a>
                                <ul>
                                    <li><a href="#">Population - World</a></li>
                                    <li><a href="#">Health Facilities</a></li>
									 <li><a href="#">Countries Spending</a></li>
                                </ul>
                            </li>
     </ul> */
	var targetMenuHtml = '<ul>';
	for(var i = 0 ; i < targetObj.length; i++){

		/*----------------- Commented for VIEW HUB ----------------*/
		//targetMenuHtml += "<li><a href='#' style='' class='target' id=T_"+targetObj[i].targetId+"><i class='fa fa-dot-circle-o'></i>"+targetObj[i].targetName+'</a></li>';
		/* if("#T_"+dureUtil.targetId == 60){
			targetMenuHtml += '<li class="xn-openable treeview active">';
		} */
		targetMenuHtml += '<li class="xn-openable treeview">';
		if(targetObj[i].indicators != undefined){
			targetMenuHtml += '<a href="#" style="" class="target" id=T_'+targetObj[i].targetId+'>'+
									'<i class="glyphicon glyphicon-th-list"></i> <span>' + targetObj[i].targetName + '</span>'+
									/* '<span class="fa fa-info-circle"></span> Indicators'+ */
									/* '<i class="fa pull-right fa-angle-left"></i>'+ */
									/* '<span class="fa"></span>'+ */
								'</a>'+
								'<ul>';
			targetMenuHtml += ihealthMenu.getIndicatorMenuForTarget(targetObj[i].indicators, targetObj[i].targetId);
		}

		targetMenuHtml += "</ul></li>";
	}

		/*targetMenuHtml += '<li class="treeview">';
		targetMenuHtml += '<a href="#" style="" class="target">'+
							'<i class="glyphicon glyphicon-th-list"></i><span>Drug Access</span>'+
							'</a>';
		targetMenuHtml += "</li>";

		targetMenuHtml += '<li class="treeview">';
		targetMenuHtml += '<a href="tempdata/data/data_file/data_Spectrum2015_ART_PMTCT.xlsx" style="" class="target">'+
							'<i class="glyphicon glyphicon-th-list"></i><span>GARPR Data</span>'+
							'</a>';
		targetMenuHtml += "</li>";*/

		/* targetMenuHtml += '<li class="treeview">';
		targetMenuHtml += '<a href="http://www.who-hivconsultantroster.net/auth/login" target="_blank" style="" class="target">'+
							'<i class="glyphicon glyphicon-th-list"></i><span>Consultant Roster</span>'+
							'</a>';
		targetMenuHtml += "</li>"; */

		/* targetMenuHtml += '<li class="treeview">';
		targetMenuHtml += '<a href="http://ivizard.org/who/dashboard/" target="_blank" style="" class="target">'+
							'<i class="glyphicon glyphicon-th-list"></i><span>Country Profiles</span>'+
							'</a>';
		targetMenuHtml += "</li>";

		targetMenuHtml += '<li class="treeview">';
		targetMenuHtml += '<a href="tempdata/data/data_file/HIV Country Staff.xlsx" style="" class="target">'+
							'<i class="glyphicon glyphicon-th-list"></i><span>HIV Country Staff</span>'+
							'</a>';
		targetMenuHtml += "</li>";*/

	targetMenuHtml += '</ul>';
	return targetMenuHtml;
}

// Creates INDICATOR menus for particular target menus .
ihealthMenu.getIndicatorMenuForTarget = function(indicatorObj, targetId){

	var indicatorMenuHtml = '';
	for(var i = 0 ; i < indicatorObj.length; i++){

		indicatorMenuHtml += '<li><a href="#" style="" class="indicator" id=I_'+indicatorObj[i].indicatorId+'><i class="fa fa-arrow-circle-right"></i>'+indicatorObj[i].indicatorName+'</a></li>';
	}

/* 	if(targetId == 63) {
		indicatorMenuHtml += '<li><a href="http://www.who-hivconsultantroster.net/" target="_system" style="" class="indicator"><i class="fa fa-arrow-circle-right"></i>Consultants Roster</a></li>';
	} */
	return indicatorMenuHtml;
}
