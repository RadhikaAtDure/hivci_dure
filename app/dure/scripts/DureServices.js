var dureService = {};

// Get Service
dureService.getPolicyQuestions = function(serviceUrl){
	
	 var serviceObj ={
		  type:'GET',
		  url:serviceUrl,
		  dataType: 'jsonp',
		  contentType: 'application/json',
		  crossDomain : true,
	 }
	 
	 $.ajax(serviceObj);	 
};


// Update Service
dureService.updatePolicyResponse = function(serviceUrl,responseObj,successFunc){
	
	 var serviceObj ={
		  type:'POST',
		  url:serviceUrl,
		  contentType: 'application/json',
		  data: responseObj,
		  success:successFunc
		}
	 $.ajax(serviceObj);	 
};

// Update Service
dureService.addPolicyQuestion = function(serviceUrl,responseObj,successFunc){
	
	 var serviceObj ={
		  type:'POST',
		  url:serviceUrl,
		  contentType: 'application/json',
		  data: responseObj,
		  success:successFunc
		}
	 $.ajax(serviceObj);	 
};


// Mail Service
dureService.sendMail = function(serviceUrl,dataJson,successFunc){
	
	var serviceObj = {
		  
		  type:'POST',
		  url:serviceUrl,
		  data: dataJson,
		  dataType: 'json',
		  // contentType: 'application/json',
		  success:successFunc					  
	  }

	  $.ajax(serviceObj);
	
};

// Get file types Service
dureService.getFileTypes = function(serviceUrl){
	
	var serviceObj = {
		  
		  type:'GET',
		  url:serviceUrl,
		  dataType: 'jsonp',
		  contentType: 'application/json',
		  crossDomain : true
	}
	 $.ajax(serviceObj);
}

// Update/Add file info of the uploaded file to Db. 

dureService.addFileInfo = function(serviceUrl,dataJson,successFunc){
	
	var serviceObj ={
		  type:'POST',
		  url:serviceUrl,
		  contentType: 'application/json',
		  data: dataJson,
		  success:successFunc
	}
	$.ajax(serviceObj);		
};

// Delete File/Folder from Database only.
dureService.deleteFileFolder = function(serviceUrl,dataJson,successFunc){
	
	var serviceObj ={
		  type:'POST',
		  url:serviceUrl,
		  contentType: 'application/json',
		  data: dataJson,
		  success:successFunc
	}
	$.ajax(serviceObj);		
};


// Get country info list service.
dureService.getCountryInfoList = function(serviceUrl){
	
	var serviceObj = {
		  
		  type:'GET',
		  url:serviceUrl,
		  dataType: 'jsonp',
		  contentType: 'application/json',
		  crossDomain : true
	}
	 $.ajax(serviceObj).always(function(){

		if(dureFile.hasOwnProperty('initialize')){
			
			dureFile.initialize();						
		}
	});;
}

// Service to fetch TS Tracking Tool Info
dureService.getTsTrackingInfo = function(serviceUrl){
	
	// dureFirejs.initialize();
	
	 var serviceObj ={
		  type:'GET',
		  url:serviceUrl,
		  dataType: 'jsonp',
		  contentType: 'application/json',
		  crossDomain : true,
		  success:function(resp){
			  
			  console.log(resp);
			  dureTsTrack.setData(resp.data);
			  dureTsTrack.formatData();		
				
		  }
	 }
	 
	 $.ajax(serviceObj);
};

dureService.updateTsTrackingInfo = function(serviceUrl,dataJson,successFunc){

	var serviceObj ={
	  type:'POST',
	  url:serviceUrl,
	  contentType: 'application/json',
	  data: dataJson,
	  success:successFunc
	}
	$.ajax(serviceObj);		
	
};

dureService.addTsTrackingInfo = function(serviceUrl,dataJson,successFunc){
	
	var serviceObj ={
	  type:'POST',
	  url:serviceUrl,
	  contentType: 'application/json',
	  data: dataJson,
	  success:successFunc
	}
	$.ajax(serviceObj);		
	
};

dureService.deleteTsRecord = function(serviceUrl,dataJson,successFunc){
	
	var serviceObj ={
		  type:'POST',
		  url:serviceUrl,
		  contentType: 'application/json',
		  data: dataJson,
		  success:successFunc
	}
	$.ajax(serviceObj);	
	
}