$(masterStructure).on("Framework:pageLoaded#m99-5-1", function (e) {
	
	scormCheck();
	$("#fwversion").html(masterStructure.version);
	updateTrackingObj();
});

function testFNav(){
	fNav('m99-0');
	return false;
}
function testCurrentSub(){
	alert(masterStructure.currentSub.title);
	return false;
}
function testParentSub(){
	alert(masterStructure.currentSub.parent.title);
	return false;
}
function testNextSub(){
	alert(masterStructure.currentSub.next.title);
	return false;
}

function scormCheck(){
	if(scorm.status!="offline"){
		$("#scormstatus").html("Sucess").addClass("successful");
		addScormList("lesson_status", "Lesson Status");
		updateLessonStatus();
		addScormList("Bookmark", "Bookmark")
		$("#Bookmark").html(scorm.getBookmark());

		$("#scormlist").append("<li><p class='col-md-12'><button onclick='scorm.complete();updateLessonStatus();'>set course to Completed</button></p></li>")
		

        	
		
		
	}else{
		$("#scormstatus").html("Offline").addClass("failed");
	}
}

function updateLessonStatus(){
	var lessonStatus=scorm.getLessonStatus();
			$("#lesson_status").html(lessonStatus).addClass((lessonStatus=="completed")?"successful":"");
}

function addScormList(id, msg){
	 $("#scormlist").append("<li><p class='col-md-10'>"+msg+"</p><p id='"+id+"' class='col-md-2'>Testing</p></li>")
	}
	
function saveTrackingObj()	{
	var newValue=$("#trackingSave").val();
	if (newValue.length>0 )
		trackingObj.saveData("qualityData", newValue);
	updateTrackingObj();

}
function updateTrackingObj()	{

	var loadedValue=trackingObj.getData("qualityData");
	if ( typeof loadedValue === "undefined"){
		trackingObj.saveData("qualityData", "");
		loadedValue=trackingObj.getData("qualityData");
		
	}

	$("#trackingLoad").val(loadedValue)
}