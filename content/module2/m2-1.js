define([
    'underscore',
    'jquery',
    'json!settings-general',
    '../../modules/BaseModule',
    'utils'
], function(_, $, GeneralSettings, BaseModule, Utils) {
	'use strict';
	
	return BaseModule.extend({

		initialize: function() {
			//html has been loaded, do your worst.
			console.log("m2-1.js initialize");
			this.addMessage();
		},
		addMessage: function() {
			var html = "<div class='container'><p><i>NOTE: This note has been appended with RequireJS.<br>";
			html += "Look at <b>content/module2/"+Utils.getStringFromArray(masterStructure.currentNav)+".js</b>";
			html += " for more info on how this works.</i></p></div>";
			$("#dynamic_content").find("h1").after(html);
		}
	});
});