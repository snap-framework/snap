define(['settings-core', 'labels'], function(CoreSettings, labels) {
	'use strict';
	
	var popup;
	
	//used only for launch page button
	function launchPop(target) {
		if (popup !== undefined) {
			try {
				if (popup.parent) {
					popup.parent.focus();
					return;
				}
			} catch (e) {
				//Handling callee error on IE when popup is closed
			}
		}

		//temporary popper
		var params = [
			'height=' + screen.height,
			'width=' + screen.width,
			'scrollbars=1',
			'resizable=1'//,
		   // 'fullscreen=yes' // only works in IE
		].join(',');

		popup = window.open(target, 'popup_window_' + CoreSettings.courseLegacyCode, params);
		popup.moveTo(0, 0);
		window.top.resizeTo(100, 50);
		window.top.moveTo(9999, 9999);
		popup.addEventListener('beforeunload',closeCourse,false);				
	}
	window.launchPop = launchPop;

	//used only for launch page to load course automatically if bookmarked
	function checkLaunch(target){
		var scormIsOn = getAPIHandle() != null;
		if (scormIsOn) {
			var isInit = doLMSInitialize();
			if (isInit) {
				var bookmark=doLMSGetValue("cmi.core.lesson_location");
				var bookmarkPresent = (bookmark.length > 0) ? true : false;
				if (doLMSGetValue("cmi.core.lesson_status") != "completed")	{
					doLMSSetValue("cmi.core.lesson_status", "incomplete");
					doLMSCommit();
				}	
			}
		}		
		if (CoreSettings.skipSplash || bookmarkPresent) {
			launchPop(target);
		}
	}
	window.checkLaunch = checkLaunch;
	function closeCourse(){
		if(popup && !popup.window.amINavigating){			
			saveScormValues();			
			popup.close();
			window.top.close();
		}		
		
	}
	window.closeCourse = closeCourse; // used in browsereventscripts too!	
	
	window.addEventListener('load', loadScorm, false);
	window.addEventListener('beforeunload',closeLauncher,false);

	function loadScorm() {
		//init the connection for the APIWrapper
		window.lmsConnected = LMSIsInitialized();

		//Charger les valeurs instanciées dans le Cookie par la page de départ du SCO.
		if (lmsConnected) {
			var url = document.location.href;
			bookmark = doLMSGetValue("cmi.core.lesson_location");
			if (url.indexOf("quit", 0) == -1 && bookmark !== url && url.indexOf("index") == -1) {
				doLMSSetValue("cmi.core.lesson_location", url);
				bookmark = url;
			}
		}
	}
	function closeLauncher(e){
		if(popup){
			popup.close();
			window.top.close();
		}
	}
	function saveScormValues(e) {
		var isInit = LMSIsInitialized();

		if (isInit) {
			lessonStatus = doLMSGetValue("cmi.core.lesson_status");
			if (lessonStatus == "completed" || lessonStatus == "passed") {
				doLMSSetValue("cmi.core.exit", "");
			}
			else {
				doLMSSetValue("cmi.core.exit", "suspend");
			}
			doLMSCommit();
		}		
	}
	
});