define([
    'jquery',
    'settings-core',
    'labels',
    'utils'
], function($, CoreSettings, Utils, labels) {
	'use strict';
	
	/* v1.05 added this so that interactions that are regular are not in the nav.js anymore*/

	return {
		initCollapsible: function(obj) {
			obj.html("<div class='wrapper'>" + obj.html() + "</div>\n<p class='handle' aria-hidden='true'><span>More<a href='#'>&nbsp;</a></span></p>");
			var lang = $('html').attr('lang');
			var strings = {
				more: (Utils.lang == 'en' ? '<span class=\'wb-inv\'>Display more</span>&nbsp' : '<span class=\'wb-inv\'>Afficher plus</span>&nbsp;'),
				less: (Utils.lang == 'en' ? '<span class=\'wb-inv\'>Display less</span>&nbsp' : '<span class=\'wb-inv\'>Afficher moins</span>&nbsp;')
			};

			obj.children("p.handle").children("span").html(strings.more + "<a href='#'>&nbsp;<span class=\'wb-inv\'>Click to toggle</span></a>");
			var $handle = obj.children("p.handle").children("span").children("a");
			$handle.click(function(e) {
				var $this = $(this);
				var $box = $this.parent().parent().parent();
				var $span = $this.parent();
				e.preventDefault();
				$this.toggleClass('opened');
				$box.toggleClass('opened');
				
				$span[0].childNodes[0].nodeValue = ($this.hasClass('opened') ? strings.less : strings.more);
				return false;
			});
			obj.children("p.handle").attr({
				'aria-hidden': 'true'
			});
		},

		/* switch the css theme */
		toggleCss: function(file) {
			$("link.theme").attr("href", "./theme/" + file + ".css");
		},
		/* list All pages */
		listAllPages: function() {
			var sitemap = masterStructure.flatList;
			var returnHtml = "";
			for (i = 0; i < sitemap.length; i++) {
				returnHtml += "<p> #" + sitemap[i].flatID + " " + sitemap[i].sPosition;
				returnHtml += " - <a href='#' onClick=\"changePage('" + sitemap[i].sPosition + "')\">" + sitemap[i].title + "</a>";
				returnHtml += "</p>";
			}

			return returnHtml;
		},

		//----------------------disable enable-------------------------
		openDetails: function(target) {
			this.toggleDetails(target, true);
		},
		closeDetails: function(target) {
			this.toggleDetails(target, false);
		},
		toggleDetails: function(target, isOpen) {
			if (typeof target === "undefined") {
				target = CoreSettings.contentContainer;
			}
			var collection = $(target).find("details");

			isOpen = isOpen || !collection.attr("open");
			collection.attr("open", isOpen);
		},

		hideVideos: function(target) {
			this.toggleVideos(target, false);
		},
		showVideos: function(target) {
			this.toggleVideos(target, true);
		},
		toggleVideos: function(target, isShown) {
			if (typeof target === "undefined") {
				target = CoreSettings.contentContainer;
			}
			var collection = $(target).find("figure.video>.display,.wb-mm-ctrls");
			isShown = isShown || !collection.is(":visible");
			collection.toggle(isShown);
		},

		disableLink: function(target) {
			this.toggleLink(target, true);
		},
		activateLink: function(target) {
			this.toggleLink(target, false);
		},
		toggleLink: function(target, isActive) {
			if (typeof target === "undefined") {
				target = CoreSettings.contentContainer;
			}
			var collection = $(target).find("a");
			isActive = isActive || !collection.hasClass("disabled-link");
			collection.toggleClass("disabled-link", isActive);
		}
	};
});