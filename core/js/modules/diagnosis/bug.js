define([
	'./diagnosis-constants',
	'modules/BaseModule'
], function(CONSTANTS, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			this.options = options;

			this.page = this.options.page;
			this.type = this.options.type;
			this.severity = this.options.severity;
			this.info = this.options.info;

			//add bug to the page
			this.page.aBugs[this.page.aBugs.length] = this;
		},

		getInfoByType: function() {
			var returnWrapper = "<li class='bug-item bug-severity-" + this.severity + " bug-type-" + this.type + "'>";
			var pagePosition = this.page.sPosition;
			var returnPage = "<a href='#' data-position='"+pagePosition+"'>" + pagePosition + " " + this.page.title + "</a>";
			var returnText = "";
			switch (this.type) {
				case CONSTANTS.TYPES.COMMENTS:
					returnText += "<p class='bug-comments'>" + this.info + "</p>";
					break;
				case CONSTANTS.TYPES.MISSING_PAGE:
					break;
				case CONSTANTS.TYPES.BROKEN_IMAGE:
				case CONSTANTS.TYPES.UNINDEXED_EXTERNAL_LINK:
				// case CONSTANTS.TYPES.BROKEN_EXTERNAL_LINK:
				// 	// requires server side

				// 	break;
				case CONSTANTS.TYPES.BROKEN_GLOSSARY_REFERENCE:
					returnText += "<p class='bug-comments'>" + this.info + "</p>";
					break;
			}
			return returnWrapper + "<p>" + returnPage + "</p>" + returnText + "</li>";
		}
	});
});