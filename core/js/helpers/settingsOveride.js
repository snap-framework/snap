define(['jquery', 'settings-core', 'settings-general'], function($, CoreSettings, GeneralSettings) {
   'use strict';
   //Check to see if the settings exist, if they do, override core Settings
	for (var generalAttribute in GeneralSettings){
		var varName=generalAttribute;
		var varValue=GeneralSettings[generalAttribute]
		switch(typeof varValue) {
		    case "string":
		        eval("CoreSettings."+varName+"=\""+varValue+"\"");
		        break;
		    case "object":
		    	//might want to detect object type
		    	eval("CoreSettings."+varName+"="+JSON.stringify(varValue)+"");
		        break;
		    default:
		        eval("CoreSettings."+varName+"="+varValue)
		}
	}
});