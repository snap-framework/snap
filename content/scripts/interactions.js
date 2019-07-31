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
		loadFAQ();
	}
	
	//this is for the FAQ favourites.
	function loadFAQ() {
		var itemID;
		//list of learneable items
		for(var i=0;i<$(".learn-list>li").length;i++){
			itemID=$(".learn-list>li>.hint").eq(i).attr("id");
			$(".learn-list>li>.hint").eq(i).append("<a data-fav=\"#"+itemID+"\" class='favbtntest'>toggle favourite</a>");
		}	
		//this is the list of buttons for a predefined search
		for(i=0;i<$(".search-list>button").length;i++){
			$(".search-list>button").eq(i).click(function() {
				var searchText=($(this).text()==="*")?"":$(this).text();
				$(".wb-fltr-inpt").val(searchText)
				var e = jQuery.Event("keyup");
				//e.which = 50; // # Some key code value
				$(".wb-fltr-inpt").trigger(e);

			});
		}
	}	
	


	initialize();

});