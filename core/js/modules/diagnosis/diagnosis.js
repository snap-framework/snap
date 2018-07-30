define([
	'underscore',
	'jquery',
	'../BaseModule',
	'logger',
	'./diagnosis-constants',
	'./bug',
	'./bug-type'
], function(_, $, BaseModule, Logger, CONSTANTS, Bug, BugType) {
	'use strict';

	var bugTypesMap = [
		{index: CONSTANTS.TYPES.COMMENTS, name: "Comments"},
		{index: CONSTANTS.TYPES.MISSING_PAGE, name: "Missing Page"},
		{index: CONSTANTS.TYPES.BROKEN_IMAGE, name: "Broken Image"},
		{index: CONSTANTS.TYPES.UNINDEXED_EXTERNAL_LINK, name: "Unindexed External Link"},
		{index: CONSTANTS.TYPES.BROKEN_EXTERNAL_LINK, name: "Broken External Link"},
		{index: CONSTANTS.TYPES.BROKEN_GLOSSARY_REFERENCE, name: "Broken Glossary Reference"}
	];

	return BaseModule.extend({

		initialize: function(options) {
			Logger.log("INIT: Diagnosis");

			this.options = options;
			this.navigation = this.options.navigation;

			this.isVisible = false;
			this.isAutoScan = true;
			this.aBugs = [];
			this.aPages = [];
			this.aTypes = [];

			this.initializeBugTypes();
			this.setListeners();
		},
		initializeBugTypes: function() {
			for (var i = 0; i < bugTypesMap.length; i++) {
				this.aTypes[i] = new BugType(bugTypesMap[i]);
			}
		},
		
		setListeners: function() {
			var that = this;
			$(this).on("Diagnosis:toggleDiagnosis", _.bind(this.toggleDiagnosis, this));
			$(this).on("Diagnosis:addComment", _.bind(this.addComment, this));
			$(this).on("Diagnosis:addMissingPage", function(e, sub, xhr) {
				that.addMissingPage(sub, xhr);
			});
			$(this).on("Diagnosis:diagnoseImages", _.bind(this.diagnoseImages, this));
		},

		onPageLoaded: function() {
			this.autoScan();
		},

		diagnoseImages: function() {
			this.aTypes[CONSTANTS.TYPES.BROKEN_IMAGE].diagnose(masterStructure.currentSub);
		},

		addBug: function(severity, type, info, subObj) {
			this.aBugs[this.aBugs.length] = new Bug({
				severity: severity,
				type: type,
				info: info,
				page: subObj
			});
			this.refreshDiagWindow();
		},
		addComment: function() {
			var msg = prompt("Enter Comment", "here");
			if (msg) {
				this.addBug(CONSTANTS.SEVERITY.COMMENTS, CONSTANTS.TYPES.COMMENTS, msg, masterStructure.currentSub);
			}
		},
		addMissingPage: function(subObj, xhr) {
			xhr = xhr || {};
			//add a missing page
			if (!subObj.isMissing) {
				subObj.$el.addClass("missing");
				//add useful info to subObj
				subObj.isMissing = true;
				subObj.xhr = xhr;
				this.addBug(CONSTANTS.SEVERITY.MISSING_PAGE, CONSTANTS.TYPES.MISSING_PAGE, xhr.status || "404", subObj);
			}
		},
		addBrokenImage: function(msg, subObj) {
			this.addBug(CONSTANTS.SEVERITY.BROKEN_IMAGE, CONSTANTS.TYPES.BROKEN_IMAGE, msg, subObj);
		},
		addUnindexedLink: function(msg, subObj) {
			this.addBug(CONSTANTS.SEVERITY.UNINDEXED_EXTERNAL_LINK, CONSTANTS.TYPES.UNINDEXED_EXTERNAL_LINK, msg, subObj);
		},
		addGlossary: function(msg, subObj) {
			this.addBug(CONSTANTS.SEVERITY.BROKEN_GLOSSARY_REFERENCE, CONSTANTS.TYPES.BROKEN_GLOSSARY_REFERENCE, msg, subObj);
		},

		reorderBugs: function() {
			//order by page, type and severity
			//create a temp array
			//loop through flatlist
			var pages = masterStructure.flatList;

			//reset bug types
			this.initializeBugTypes();
			this.aBugs = [];
			//loop through pages in site
			for (var loop = 0; loop < pages.length; loop++) {
				//just make sure ther are bugs in this page
				if (pages[loop].aBugs.length > 0) {
					//loop through bug types	
					for (var type = 0; type < this.aTypes.length; type++) {
						//for everytype, go through this page's bugs
						for (var bugs = 0; bugs < pages[loop].aBugs.length; bugs++) {
							if (pages[loop].aBugs[bugs].type == type) {
								//this is the type we're looking for, add it to this type
								this.aTypes[type].aBugs[this.aTypes[type].aBugs.length] = pages[loop].aBugs[bugs];
								this.aBugs[this.aBugs.length] = pages[loop].aBugs[bugs];
							}
						}
					}
				}
			}
		},
		listByType: function(target) {
			//loop through types
			var that = this;
			var type;
			var $target = $(target);
			$target.html("");
			var nbBugs;
			for (var lTypes = 0; lTypes < this.aTypes.length; lTypes++) {
				type = this.aTypes[lTypes];
				if (type.aBugs.length > 0) {
					nbBugs = 0;
					$target.append("<details id='details-panel-bug" + type.index + "'><summary class='wb-details'>" + type.index + " - " + type.name + " (<span>0</span>)</summary></details>")
					for (var lBugs = 0; lBugs < type.aBugs.length; lBugs++) {
						nbBugs++;
						$target.children("#details-panel-bug" + type.index).append("<ul>" + type.aBugs[lBugs].getInfoByType() + "</ul>");
						$target.children("#details-panel-bug" + type.index).children("summary").children("span").html(nbBugs);
						$target.find("a[data-position='"+type.aBugs[lBugs].page.sPosition+"']").off("click").on("click", function() {
							var position = $(this).attr("data-position");
							$(that.navigation).trigger("Navigation:changePage", position);
							return false;
						});
					}

				}
			}
			$target.find('summary').trigger( "wb-init.wb-details" ); // fix IE details not opening problem
		},
		refreshDiagWindow: function() {
			if (this.isAutoScan) {
				this.reorderBugs();
				this.listByType('.diag-window');
			}
		},
		autoScan: function() {
			if (this.isAutoScan) {
				//0 and 1 are automatic
				//check the list of what needs to be scanned
				//scan for missing image;

				for (var lTypes = 0; lTypes < this.aTypes.length; lTypes++) {
					this.aTypes[lTypes].diagnose(masterStructure.currentSub);
				}
				//of course refresh the diagnostic window (admin portal)
				this.refreshDiagWindow();
			}
		},

		toggleDiagnosis: function() {
			if (!this.isVisible) {
				this.isVisible = true;
				$(".diagnosis-admin").find(".diagnosis-btn").html("Turn AutoScan Off");
				//start the diag window
				$(".diag-window").html("Initializing...");
				this.isAutoScan = true;
				this.autoScan();
			} else {
				this.isVisible = false;
				$(".diagnosis-admin").find(".diagnosis-btn").html("Turn AutoScan On");
				this.isAutoScan = false;
			}
		}
	});
});