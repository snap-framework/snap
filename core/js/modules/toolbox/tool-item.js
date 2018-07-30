define([
    'jquery',
    'modules/BaseModule'
], function($, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			this.options = options;
			this.index = this.options.index;
			this.setsize = this.options.setsize;
			this.mbObj = this.options.mbObj;

			this.setAttributes();
		},
		setAttributes: function() {
			this.$el.attr({
				"aria-posinset": this.index + 1,
				"aria-setsize": this.setsize
				})
			this.$el.children("a").attr({
				"tabindex": "-1",
				"aria-haspopup": "true",
				"aria-controls": "popup"//,
				//"role": "menuitem"
			});
			$(this.mbObj).attr({
				"aria-posinset": this.index + 1,
				"aria-setsize": this.setsize
			});			
			$(this.mbObj).children("a").attr({
				"tabindex": "-1",
				"aria-haspopup": "true",
				"aria-controls": "popup"//,
				//"role": "menuitem"
			});
		},
		setFocus: function() {
			// find out if we are in mobile view and put focus on
			if ($(this.mbObj).closest('section').find('a.toolbox:focus').length > 0 || ($('*:focus').hasClass('tb-item') && $('*:focus').closest('ul').attr('id') == "mb-tb")) {
				$(this.mbObj).children('a').focus();
			} else if (this.$el.closest('section').find('a.toolbox').is(':focus') || ($('*:focus').hasClass('tb-item') && !($('*:focus').closest('ul').attr('id') == "mb-tb"))) {
				this.$el.children("a").focus();
			}
		}
	});
});
