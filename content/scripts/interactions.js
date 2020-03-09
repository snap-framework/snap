//DO NOT MODIFY ↓
define([
    'jquery'
], function($) {
//DO NOT MODIFY ↑

	function initialize() {
		setEvents();
	}

	function setEvents() {
		$(masterStructure)
			.on("Framework:systemReady", function() {
				systemReady();
			})
			.on("Framework:pageLoaded", function() {
				pageLoaded();
			});
	}

	/* is called only once, when the Course has loaded*/
	function systemReady() {
		//console.log("Interactions:systemReady");
	}

	/* is called on every page load, great for adding custom code to all pages*/
	function pageLoaded() {
		//console.log("Interactions:pageLoaded");

		var medias = [];
		medias = Array.prototype.concat.apply(medias, document.getElementsByTagName('audio'));
		medias = Array.prototype.concat.apply(medias, document.getElementsByTagName('video'));
		
		$(medias).each(function(index){
			var catched = false;
			$(this).on('playing',function(e){							
				if(!catched){		        
					catched = true; 					
					window.ga('send',{
						hitType:'event',
						eventCategory:this.nodeName,
						eventAction:'play',
						eventLabel:this.getAttribute('title')
					})
		     	}
			});
		});		
	}

	initialize();

});