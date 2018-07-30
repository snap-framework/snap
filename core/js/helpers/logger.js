define(['underscore', 'settings-core'], function(_, CoreSettings) {
	'use strict';
	
	var log = console.log;
	var warn = console.warn;
	var error = console.error;
	
	var loggerProxy = function(callback, args) {
		//checks if we are in debugmode or that we are facing an error
		if (CoreSettings.debugMode && _.isFunction(callback) || callback == error) {
			callback.apply(this, args);
		}
	};

	return {
		log: function() { 
			loggerProxy(log, arguments);
		},
		warn: function() { 
			loggerProxy(warn, arguments);
		},
		error: function() {
			//filter out errors about modules not loaded
			if (arguments[0]
				&& !arguments[0].match(/Script error for.*m\d/)
				&& !arguments[0].match(/No define call for.*m\d/)) {
				loggerProxy(error, arguments);
			}
		}
	};
});