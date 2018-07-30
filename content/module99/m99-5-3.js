$(masterStructure).on("Framework:pageLoaded#m99-5-3", function (e) {
	lockPage(true);
		var lockStatus=masterStructure.isSoftLocked;

		//qa_lockedout
		$("#qa_lockedin").html((lockStatus)?"Soft Lock":"Failed").addClass((lockStatus)?"successful":"failed");


unlockNext()
});

function unlockNext(){
	console.log("unlock next");
		$('#qa_lockedout').html((masterStructure.currentSub.next.isLocked)?'Next page: Locked':'Next page: Unlocked')
		.addClass((masterStructure.currentSub.next.isLocked)?'successful':'failed');
		if (!masterStructure.currentSub.next.isLocked){
			$("#unlocknextBTN").remove();
		}
}