({
    //from the current folder (build)
    appDir: "../../",
    //from the appDir
    baseUrl: "./core/js",
    //from the current folder (build)
    dir: "../../dist",

    modules: [{
        name: 'main',

        exclude: [
        	//Do not package 'interactions' as it contains a fallback path. 
			//url of main config file will be used.
			//For paths fallback issues, see: 
			//https://github.com/requirejs/requirejs/issues/791
        	'interactions',
        	//Do not package "wet-boew" as it is self executing, 
			//and weirdly checking for it's script tag to do stuff.
			//Since we are injecting the script when needed, 
			//keep it out of the main file to avoid errors.
        	'wet-boew',
        	//The following excludes are because of the launch_{lang}.html files
        	//which need them to be at the exact same folder,
        	//instead of compressing them in the main file
        	'require-configs',
        	'json',
        	'labels',
        	'settings-core'
        ]
    }],

    //find all the css under dir, and minify them
    optimizeCss: 'standard.keepLines',

    optimize: 'uglify2',

    removeCombined: true,

    findNestedDependencies: true,
	
	//do not include in the dist folder these folders-files
    fileExclusionRegExp: /^(r|build)\.js|.sass-cache|node_modules|package|watch-css|bin|scss|release_notes.txt|version_doc.txt|\$tf|BuildProcessTemplates$/,

    mainConfigFile: "../../core/js/require-configs.js",
	
	//r.js will not write a build.txt file in the
    //"dir" directory when doing a full project optimization.
	writeBuildTxt: false,

    paths: {
        //build will take the require-configs interactions instead
        'interactions': "empty:"
    }
})