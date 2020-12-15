define(['jquery', 'settings-core', 'settings-general', 'settings-presets'], function ($, CoreSettings, GeneralSettings, Presets) {
	'use strict';
	var generalPresets = GeneralSettings.presets
	var arraySettings = [];
	delete GeneralSettings["presets"];

	// ------- CHECK PRESETS -------
	var presetType, presetSet, presetList;
	for (var preset in generalPresets) {

		presetType = generalPresets[preset];
		presetSet = Presets[preset];
		presetList = presetSet[presetType];

		arraySettings[arraySettings.length] = presetList;
	}
	arraySettings[arraySettings.length] = GeneralSettings;
	for (var i = 0; i < arraySettings.length; i++) {


		//Check to see if the settings exist, if they do, override core Settings

		for (var generalAttribute in arraySettings[i]) {
			var varName = generalAttribute;
			var varValue = arraySettings[i][generalAttribute]
			switch (typeof varValue) {
				case "string":
					eval("CoreSettings." + varName + "=\"" + varValue + "\"");
					break;
				case "object":
					//might want to detect object type
					eval("CoreSettings." + varName + "=" + JSON.stringify(varValue) + "");
					break;
				default:
					eval("CoreSettings." + varName + "=" + varValue)
			}
		}
	}
});
