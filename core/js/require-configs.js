define(function() {
	'use strict';
	
    //Configure loading modules from the js directory.
    require.config({
        waitSeconds: 20,
        //base url to lookup files
        baseUrl: 'core/js',

		//add timestamp to force no-cache
		urlArgs: "bust=" + (new Date()).getTime(),
        //To get timely, correct error triggers in IE, force a define/shim exports
        enforceDefine: true,

        //some files needs to be shimmed 
        //since they are not AMD (Asynchronous Module Definition) compliant
        //we need to export the global object so that they can be loaded as an AMD
        shim: {
            'wet-boew': {
                deps: ['jquery'],
                exports: 'wb'
            },
            handlebars: {
                exports: 'Handlebars'
            },
            history: {
                exports: 'History'
            },
            "../../../../js/plugins/ckeditor/ckeditor": { "exports": "CKEDITOR" },
			// "plugins/nestable/jquery.nestable": { "exports": "NESTABLE" }
        },
        //shorten path for easier usage
        paths: {
            //libraries
            jquery: 'lib/jquery/jquery',
            underscore: 'lib/underscore',
            handlebars: 'lib/hbs/handlebars',

            //jquery plugins
            fullpage: 'lib/jquery/plugins/fullpage/fullpage',
            scrollto: 'lib/jquery/plugins/scrollto/scrollto',

            //requirejs plugins
            hbs : 'lib/hbs/hbs',
            text: 'lib/require.text',
            json: 'lib/require.json',

            //WET main script
            'wet-boew': '../../WET/js/wet-boew',

            //these serve as shortcut paths
            labels: ['../../settings/labels','../settings/localization/labels'],
            'settings-core': '../settings/settings-core',
            'settings-general': '../../settings/settings-general',
            settingsOverride: 'helpers/settingsOveride',
            utils: 'helpers/utils',
            logger: 'helpers/logger',
            router: 'modules/router',
            history: 'plugins/native.history',
            //script used for creating custom code per course
			'ga-List': 'modules/google-analytics/ga-list.json',
            interactions: '../../content/scripts/interactions',

            //hbs templates path
            templates: "../templates",
            content: "../../content"
        },
		
		//https://github.com/SlexAxton/require-handlebars-plugin
		//DO NOT UPDATE LIBRARY (custom changes)
		hbs: {
			templateExtension: 'html',
        	handlebarsPath: 'lib/hbs/handlebars'
		}
    });
});
