define([
	'underscore',
	'jquery',
	'../BaseModule',
	'utils',
	'logger',
	'settings-core'
], function (_, $, BaseModule, Utils, Logger, CoreSettings) {
	'use strict';

	return BaseModule.extend({

		initialize: function (options) {
			/*Logger.log("INIT: google analytics Controller");
			  this.options = options;
			this.gaTracker();
			this.bindElements();*/


		},

		onPageLoaded: function () {

			/*var path = Utils.lang + '/' + masterStructure.currentSub.sPosition;
			var title = masterStructure.currentSub.title;

			ga('set', { page: path, title: title });
			ga('send', 'pageview');	*/
		},




		/*gaTracker: function (){
			$.getScript('//www.google-analytics.com/analytics.js'); // jQuery shortcut
			window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
				ga('create', CoreSettings.googleAnalyticsID , 'auto');
			var path = Utils.lang + '/' + masterStructure.currentSub.sPosition;
			var title = masterStructure.currentSub.title;
			ga('set', { page: path, title: title });
			ga('send', 'pageview');			
			

		},*/
		/*
		  bindElements: function() {
			var that = this;
		 

			  //bind navigation, (catégorie, action libellé)
			_.each(_.keys(AnalyticsList.Navigation), function(action, index) {
				
				
				_.each(_.keys(AnalyticsList.Navigation[action]), function(libel, index) {
					//console.log("ga('send', 'event', 'Navigation', '"+action+"', '"+Utils.lang+"-"+libel+"');")
					//bind to AnalyticsList.Navigation[action][libel]
					//ga('send', 'event', 'Navigation', action, lang-libel);
					$(AnalyticsList.Navigation[action][libel]).attr("onclick", "ga('send', 'event', 'Navigation', '"+action+"', '"+Utils.lang+"-"+libel+"' );");
				});

			});
			//bind other things... erm.
			  //$("a.wb-sl").on("click", function() {ga('send', 'event', 'Navigation', 'TopNav', Utils.lang+'-SkipContent');});
	  }		*/


	});
});


//MATOMO CODE TO INSERT

/*
<!-- Matomo -->
<script type="text/javascript">
  var _paq = window._paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
	var u="https://analytics.nglxp.ca/";
	_paq.push(['setTrackerUrl', u+'matomo.php']);
	_paq.push(['setSiteId', '8']);
	var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
	g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Matomo Code -->
*/