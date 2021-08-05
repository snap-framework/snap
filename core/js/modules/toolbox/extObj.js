define([
	'underscore',
	'jquery',
	'logger',
	'settings-core',
	'utils',
	'../BaseModule',
	"labels"
], function (_, $, Logger, CoreSettings, Utils, BaseModule, Labels) {
	'use strict';

	return BaseModule.extend({


		initialize: function (options) {
			this.master = options.master;
			this.parent = options.parent;

			this.id = options.id;

			this.$aTag = options.$dt.children("a").eq(0);
			this.url = this.$aTag.attr("href");
			this.description = this.$aTag.text();
			this.linkTo = options.$dd.text();


		},
		/*---------------------------------------------------------------------------------------------
				-------------------------houseKeeping
		---------------------------------------------------------------------------------------------*/

		/*---------------------------------------------------------------------------------------------
				-------------------------LAUNCH CKE
		---------------------------------------------------------------------------------------------*/
		generateInstance: function ($el) {
			var classVar = (typeof $el.attr("class") !== "undefined") ? $el.attr("class") + " external" : "external";
			var link = document.createElement("a");
			link.setAttribute("href", this.url);
			link.setAttribute("target", "_blank");
			link.setAttribute("rel", "external");
			//link.setAttribute("title", this.description);
			link.setAttribute("aria-haspopup", "true");
			link.setAttribute("data-ext", this.id);
			link.setAttribute("class", classVar);
			link.innerHTML = $el.html() + "<span class='wb-inv'>(" + Labels.nav.external + this.linkTo + ")</span>";
			this.replaceInstance($el, link);
			return false;
		},
		cleanUpInstance: function ($el) {
			var link = document.createElement("a");
			link.setAttribute("href", "#");
			link.setAttribute("data-ext", this.id);
			link.textContent = $el.text();
			this.replaceInstance($el, link);
			return false;
		},
		replaceInstance: function ($el, html) {
			$el.replaceWith(html);
		}



	});
});