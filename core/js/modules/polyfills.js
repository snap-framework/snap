define([
	'./BaseModule'
], function(BaseModule) {
	'use strict';
	
	return BaseModule.extend({
		initialize: function(options) {
			this.options = options;
		}
	});	
});