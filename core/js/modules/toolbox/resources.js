define([
	'underscore',
	'jquery',
	'logger',
	'settings-core',
	'utils',
	'../BaseModule'
], function(_, $, Logger, CoreSettings, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		ui: {	
			resourcesBtn: ".top-menu .resources"
		},
		
		templateUrl: "content/tools/resources_" + Utils.lang,

		initialize: function(options) {
			Logger.log("INIT: Resources");
		},

		setListeners: function() {},

		serializeData: function() {
			return {};
		},

		render: function() {
			if (!this.isRendered) {
				this.template = this.template(this.serializeData());
				
				this.setMagnificPopupTemplate();
				this.setListeners();
				this.isRendered = true;
			}
		},

		onPageLoaded: function() {
			this.render();
			this.scan();
		},

		setMagnificPopupTemplate: function() {
			this.ui.resourcesBtn.magnificPopup({
			    items: { src: this.template },
			    type: 'inline'
			});
		},

		scan: function($selector) {
			var $el;
			// check if we are looking inside some selector
			($selector == undefined)?$el = $(CoreSettings.contentContainer):$el = $selector;
			//treat external links
			var ext = $el.find("a.external,a[data-ext]");//gather ext		
			var extID = "";
			if (ext.length > 0) { //if there are ext
				for (var lExt = 0; lExt < ext.length; lExt++) { //go through external links in page
					this.generateExt(ext.eq(lExt));
				}
			}
			//dealing with abbreviations
			var abbr = $el.find("abbr"); //gather abbr
			if (abbr.length > 0) {
				for (var lAbbr = 0; lAbbr < abbr.length; lAbbr++) {
					this.generateAbbr(abbr.eq(lAbbr));
				}
			}
			//dealing with csps-replace
			var replaced = $el.find('[data-csps-replace]:not([data-csps-replace=""])'); //gather abbr
			if (replaced.length > 0) {
				for (var i = 0; i < replaced.length; i++) {
					//console.log(replaced.eq(i).attr("data-csps-replace"))
					this.generateReplace(replaced.eq(i).attr("data-csps-replace"), replaced.eq(i));
				}
			}
		},
		
		generateAbbr: function(target) {
			var found = $(this.template).find("#abbr-list").find("dt:contains('" + target.text() + "')").filter(function() {
				return $(this).text() === target.text();
			});
			if ($(found).length > 0) {
				var definition = found.next().text();
				$(target).attr("title", definition);
			} else {
				$(target).addClass("flagError");
			}
		},

		generateReplace: function(value, target) {
			var found = $(this.template).find("#" + value);

			if ($(found).length > 0) {

				var content = found.html();

				$(target).html(content);
			} else {
				$(target).addClass("flagError");
			}
		},

		generateExt: function(target) {
			var $target = $(target);
			var extID = $target.attr("data-ext");
			var found = $(this.template).find("#" + extID);
			var linkHttp = found.attr("href");
			var linkTitle = found.closest("dt").next().text();
			$target.attr("title", linkTitle);
			if(!$target.hasClass("external")){$target.addClass("external")}
			//check external link method
			var extMethodFinal = $target.attr("data-extmethod");
			extMethodFinal = !_.isUndefined(extMethodFinal) ? extMethodFinal : CoreSettings.extMethod;
			switch (extMethodFinal) {
				case "lightbox":
					$target.on("click", function() {
						$(document).trigger('open.wb-lbx', [
							[{
								src: linkHttp,
								type: 'iframe'
							}], false, [linkTitle]
						]);
						return false;
					});
					$target.attr("aria-haspopup", true);
					$target.append("<span class='wb-inv'>" + labels.nav.externalink + "</span>");
					$target.removeAttr("target");
					break;
				case "popup":
					$target.on("click", function() {
						window.open(linkHttp, '_blank', 'toolbar=0,location=0,menubar=0');
						return false;
					});
					$target.attr("aria-haspopup", true);
					$target.attr("rel", "external");
					$target.append("<span class='wb-inv'>" + labels.nav.externalink + "</span>");
					$target.removeAttr("target");
					break;
				default:
					$(".external").attr("target", "_blank");
					$target.attr("aria-haspopup", true);
					$target.attr("rel", "external");
					$target.append("<span class='wb-inv'>" + labels.nav.externalink + "</span>");
					$target.attr("href", linkHttp);	
			}

			if ($(".ext-link").length > 0) { //if there's a toolbox with links
				$(".ext-link").append("<p> " + found.parent().html() + " </p>");
			}
		}
	});
});