define([
	'jquery',
	'./diagnosis-constants',
	'../BaseModule'
], function($, CONSTANTS, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			this.options = options;

			this.name = this.options.name;
			this.index = this.options.index;
			this.aBugs = [];
		},

		diagnose: function(subObj) {
			switch (this.index) {
				case CONSTANTS.TYPES.BROKEN_IMAGE:
					this.diagnoseImg(subObj);
					break;
				case CONSTANTS.TYPES.UNINDEXED_EXTERNAL_LINK:
					this.diagnoseUnindexedExtLink(subObj);
					break;
				case CONSTANTS.TYPES.BROKEN_EXTERNAL_LINK:
					this.diagnoseIndexedExtLink(subObj);
					break;
				case CONSTANTS.TYPES.BROKEN_GLOSSARY_REFERENCE:
					this.diagnoseGlossary(subObj);
					break;
			}
		},

		diagnoseImg: function(subObj) {
			$("img").each(function() {
				var image = $(this);
				if (image.context.naturalWidth == 0 || image.readyState == 'uninitialized') {
					//check if this image is already in the list
					var imgBugFlag = false;
					for (var lBugs = 0; lBugs < subObj.aBugs.length; lBugs++) {
						if (subObj.aBugs[lBugs].type == 2 && subObj.aBugs[lBugs].info == image.attr("src") + " is broken") {
							imgBugFlag = true;
						}
					}
					if (imgBugFlag === false) {
						masterStructure.diagnosis.addBrokenImage(image.attr("src") + " is broken", subObj);
					}
				}
			});
		},
		diagnoseUnindexedExtLink: function(subObj) {
			var linkCollection = $("#dynamic_content a[href^='http'][class!='external']");
			for (var loopLinks = 0; loopLinks < linkCollection.length; loopLinks++) {
				var imgBugFlag = false;
				for (var lBugs = 0; lBugs < subObj.aBugs.length; lBugs++) {
					if (subObj.aBugs[lBugs].type == 3) {
						imgBugFlag = true;
					}
				}
				if (imgBugFlag === false) {
					masterStructure.diagnosis.addUnindexedLink($(linkCollection[loopLinks]).attr("href").substring(0, 20) + " is unindexed", subObj);
				}
			}
		},

		diagnoseIndexedExtLink: function(subObj) {
			var linkCollection = $("#dynamic_content a[rel='external']");
			//	this needs serverside :(
			//we'll try to hook it up later down the road
			/*var http = new XMLHttpRequest();

			http.open('HEAD', 'http://www.google.ca', false);
			http.send();
			alert(http.status)
	
			return http.status != 404;
			*/

		},
		//CSPS-KR TODO: this should be in the glossary module; diagnose() 
		diagnoseGlossary: function(subObj) {
			var glossaryCollection = $(".csps-glossary");
			var searched;
			var found;
			for (var loopGloss = 0; loopGloss < glossaryCollection.length; loopGloss++) {
				searched = $(glossaryCollection[loopGloss]).attr("href");
				//CSPS-KR TODO: stop using internal properties of glossary directly
				found = $(masterStructure.glossary.template).find(searched);
				// console.log($(masterStructure.glossary.template).find("#pop_glossary_Advise").length);
				var imgBugFlag = false;
				for (var lBugs = 0; lBugs < subObj.aBugs.length; lBugs++) {
					if (subObj.aBugs[lBugs].type == 5) {
						imgBugFlag = true;
					}
				}
				if (imgBugFlag === false && found.length === 0) {
					//console.log()
					//masterStructure.diagnosis.addGlossary(searched+" is not a valid glossary entry", subObj);
				}
			}
		}
	});
});