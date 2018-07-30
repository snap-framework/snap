define([
	'underscore',
	'jquery',
	'logger',
	'settings-core',
	'modules/BaseModule',
	'labels',
	'modules/navigation/navigation'
], function(_, $, Logger, CoreSettings, BaseModule, labels, Navigation) {
	'use strict';

	return BaseModule.extend({

		events: {
			"keyup a.timeline-item": "timelinekeypress",
			"click a.timeline-item": "onChangePage",
		},

		initialize: function(options) {
			Logger.log("INIT: Timeline");
			
			this.options = options;
			this.navigation = this.options.navigation;

			if (!CoreSettings.tlContent && CoreSettings.tlPlace !== "") {
				$(CoreSettings.tlPlace).append("<div id='timeline'></div>");
			}

			this.setListeners();
		},

		setListeners: function() {},

		onPageLoaded: function() {
			this.run();
		},

		run: function() {
			var that = this;
			var ms = masterStructure;
			var localListInfo = ms.currentSub.localListInfo;
			if (ms.currentNav.length > 1 || (ms.timelinePermissive)) {
				if (CoreSettings.tlContent) {
					if (CoreSettings.tlPlace !== "") {
						$(CoreSettings.contentContainer).children(CoreSettings.tlPlace).append("<div id=\"timeline\">" + this.createTimelineItem(localListInfo[0], localListInfo[1]) + "</div>");
					} else {
						$(CoreSettings.contentContainer).children("h1").after("<div id=\"timeline\">" + this.createTimelineItem(localListInfo[0], localListInfo[1]) + "</div>");
					}
				} else {
					$("#timeline").html(this.createTimelineItem(localListInfo[0], localListInfo[1]));
				}
				$(".peg.current").attr("tabindex", "0");
				if (ms.isTimelineBrowsing) {
					ms.isTimelineBrowsing = false;
					$(".peg.current").focus();
				}
			}	
		},

		onChangePage: function(e) {
			var $el = $(e.currentTarget);
			var position = $el.attr("data-position");
			$(this.navigation).trigger("Navigation:changePage", position);
			return false;
		},

		createTimelineItem: function(subArray, index) {
			var percent = 100 / (subArray.length + 1),
				width;
			var style = "";
			var subHtml = "",
				subClass = "",
				subGotoText = "",
				subLink = "";
			var preFlag = 0;
			for (var i = 0; i < subArray.length; i++) {
				if (i === index) {
					preFlag = 1;
				}
				width = (i == index) ? percent * 2 : percent;
				subClass = (i == index) ? "peg current" : "peg";
				subClass += (preFlag === 0) ? " pre" : "";
				subGotoText = labels.vocab.goTo + " " + subArray[i].title;
				subLink = subArray[i].sPosition;
				subHtml += "\n<a href='#' data-position='"+ subLink +"' class='timeline-item "+ subClass +"' style='width:"+ width +"%' ";
				subHtml += " tabindex='-1' title='" + subGotoText + "' >";
				subHtml += "<span>Page </span>"+ (i + 1) +"</a>";
			}
			return subHtml;
		},

		timelinekeypress: function(e) {
			var keyCode = e.keyCode ? e.keyCode : e.which;
			var rightarrow = 39,
				leftarrow = 37;
			var thisObj = $(".peg.current");
			if (keyCode == rightarrow) {
				$(this.navigation).trigger("Navigation:goToNextPage");
				masterStructure.isTimelineBrowsing = true;
			} else if (keyCode == leftarrow) {
				$(this.navigation).trigger("Navigation:goToPrevPage");
				masterStructure.isTimelineBrowsing = true;
			}
		}
	});
});