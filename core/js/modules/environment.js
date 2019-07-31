define(['jquery',
		'settings-core'], function ($,CoreSettings) {
    'use strict';  
	var api;
	
	//what's environment (local, skynet, publicfacing)
		CoreSettings.environment=(CoreSettings.environment===null)?detectHost():CoreSettings.environment;

	//what kind of data storage does it have (connectionMode)
		api=getConnection();

		CoreSettings.connectionMode=(CoreSettings.connectionMode===null)?detectConnMode(api):CoreSettings.connectionMode;
	

		CoreSettings.scormversion=api;
	
	

	$("html").attr("data-pop", CoreSettings.isPopped)
	$("html").attr("data-env", CoreSettings.environment)
	$("html").attr("data-conn", CoreSettings.connectionMode)
	
	
	
	

	//detect if the host is local, public facing or on a prod environment (will include any saba server)
	function detectHost(){
		var host;
		   host=(location.hostname.indexOf("10.128") ===0)?"localhost":location.hostname;
		   
		   switch(host) {
				case "localhost":
				case "127.0.0.1":
			   	case "skynet":				   
					host="local";
					break;
				case "www.csps-efpc.gc.ca":
				case "csps-efpc.gc.ca":
					host= "public";
					break;
				default:
					host= "prod";
					break;
			}
		return host;

	}
	
	function detectConnMode(api){

		//CoreSettings.connectionMode=(CoreSettings.connectionMode===null)?null:CoreSettings.connectionMode;
		if(CoreSettings.environment!=="prod" || api === null){
			return "offline";
		}else{
			return "scorm";
		}
		
		
		
		
	}
	function getConnection(){
		if(CoreSettings.isPopped === true){
			if(window.opener.getAPIHandle() !== null){
				CoreSettings.api=window.opener;
				return window.opener.getAPIHandle();
			}
		}else{
			if(getAPIHandle() !== null){
				CoreSettings.api=window;
				return getAPIHandle();
			}else{
				return null;
			}
		}				
	}
		function scormCheck(){

			//scormVersion
			return getAPIHandle().scormVersion !== null;
		}	
	
	
});

