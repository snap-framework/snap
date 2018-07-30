$(masterStructure).on("Framework:pageLoaded#m99-5-2", function (e) {
		checkLockStatus();
		window.checkLockStatus=checkLockStatus;
});

function checkLockStatus(){
		var lockStatus=masterStructure.currentSub.isLockedIn&&masterStructure.allowedLockedInExit!=true;
		$("#qa_lockedin").html((lockStatus)?"Locked In":"Unlocked").addClass((lockStatus)?"successful":"failed");
	}	