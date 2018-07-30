define([
	'underscore',
	'jquery',
	'logger',
	'labels',
	'settings-core',
	'utils',
	'../BaseModule',
	'hbs!templates/glossary/glossary-term'
], function(_, $, Logger, labels, CoreSettings, Utils, BaseModule,templateTerm) {
	'use strict';

	return BaseModule.extend({				
		
		
		initialize: function(options) {
			Logger.log("INIT: Glossary");
			this.render();
		},

		render: function() {			
			this.template = templateTerm;	
			this.template = this.template(this.serializeData());
			
			this.generateTermPopup(this.options);			
		},
		
		/**
		 * generates a popup for the specified term in the page
		 * @param  {DOM element} term; the link to generate the popup
		 */
		generateTermPopup: function(options) {			
			// check if we are looking inside some selector
			var $target;	
			(options.$el == undefined)?$target = $(CoreSettings.contentContainer):$target = options.$el;

			//$(options.term).closest("div");			
			
			var targetID = $(options.term).attr("href");
			
			var newID = "pop_" + targetID.replace("#", "");
			
				
				var found = $(options.glossary).find(targetID);
			
				if (found.length === 0) {
					var thisSub = masterStructure.currentSub;
					var bugFlag = false;
					for (var loop = 0; loop < thisSub.aBugs.length; loop++) {
						if (thisSub.aBugs[loop].type == 5) {
							bugFlag = true;
						}
					}
					if (bugFlag === false) {
						masterStructure.diagnosis.addGlossary(targetID + " is not a valid glossary ID", thisSub);
					}
				}

				// semble y avoir un bug dans IE si la class wb-lbx n'est pas dans l'HTML
				$(options.term).addClass("wb-lbx").attr("href", "#" + newID);	

				var termObj = {
					newID:newID,
					modalBody:found.children("dd").html(),
					dt:$(found).children("dt").text(),
					label:labels.vocab.definition
				}

				this.template = templateTerm;
				this.template = this.template(termObj);

				$target.append(this.template);

				$(options.term).magnificPopup({
					items:{src:this.template},
					type:'inline'				
				});	
				$(options.term).trigger( "wb-init.wb-lbx" );
			
		}
	});
});