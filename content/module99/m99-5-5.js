//DO NOT MODIFY ↓
define([
    'jquery'
], function($) {
//DO NOT MODIFY ↑
	function initialize() {
			
			
			$(masterStructure)
				.on("Framework:systemReady", function() {
					$("#qa_systemready").html("<span>Success</span>").addClass("successful");
					
				})
				.on("Framework:pageLoaded", function() {
					$("#qa_pageloaded").html("<span>Success</span>").addClass("successful");
				});			
		}
		
	initialize();

});