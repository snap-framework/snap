define(['settings-core'], function(CoreSettings) {
	'use strict';
	
	return {
		backwardCompat: function() {
			//this is where legacy settings are kept to make sure all is well.
			CoreSettings.pageOfPermissive = (typeof CoreSettings.pageOfPermissive === "undefined") ? CoreSettings.tlPermissive : CoreSettings.pageOfPermissive;
			CoreSettings.lvlPageOf = (typeof CoreSettings.lvlPageOf === "undefined") ? CoreSettings.lvlTimeline : CoreSettings.lvlPageOf;
		}
	};
});