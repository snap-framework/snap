define([
	'underscore',
	'jquery',
	'logger',
	'settings-core',
	'utils',
	'../BaseModule',
	'modules/toolbox/extObj',
	'modules/toolbox/glossaryObj',
	'modules/toolbox/abbrObj',
	'modules/toolbox/snippetObj'
], function(_, $, Logger, CoreSettings, Utils, BaseModule, External, Glossary, Abbr, Snippet) {
	'use strict';

	return BaseModule.extend({


		initialize: function(options) {
			//console.log("init resources_manager");
			this.master=options.master;
			var that=this;
			this.exts=[];
			this.glossaries=[];
			this.abbrs=[];
			this.snippets=[];
			
			$.ajax({
					url: "content/tools/resources_" + Utils.lang+".html",
					type: 'GET',
					async: false,
					cache: false,
					timeout: 30000,
					error: function(){
						
						return true;
					},
					success: function(data){ 
						that.data=data;
						that.$data=$(data).find(".modal-body");
					}
				});	
			$.ajax({
					url: "content/tools/glossary_" + Utils.lang+".html",
					type: 'GET',
					async: true,
					cache: false,
					timeout: 30000,
					error: function(){
						
						return true;
					},
					success: function(data){ 
						that.data=data;
						that.$glossary=$(data).find(".modal-body");
						that.initResources();
					}
				});	
			
		},
		onPageLoaded: function() {
			//console.log("pageload resources manager");
			//this.render();
			this.scan();
		},
		
		initResources:function(){

			this.initExternals();
			this.initAbbr();
			this.initSnippets();
			this.initGlossary();

			
			
		},
		scan:function($selector){
			// check if we are looking inside some selector
			var $el=(typeof $selector === "undefined")?$(CoreSettings.contentContainer):$selector;
			this.scanExternals($el);
			this.scanAbbr($el);
			this.scanSnippet($el);
			this.scanGlossary($el);
			
		},
		cleanUp:function($selector){
			// check if we are looking inside some selector
			var $el=(typeof $selector === "undefined")?$(CoreSettings.contentContainer):$selector;
			
			this.scanExternals($el, true);//scan, but add cleanup flag
			this.scanAbbr($el, true);//scan, but add cleanup flag
			this.scanSnippet($el, true);//scan, but add cleanup flag
			this.scanGlossary($el, true);//scan, but add cleanup flag
		},
/*---------------------------------------------------------------------------------------------
		-------------------------Externals
---------------------------------------------------------------------------------------------*/			
		initExternals:function(){
			
			var $ext=this.$data.find(".external-list").children("dt");
			var id;
			
			for (var ext=0;ext<$ext.length;ext++){
				id=$ext.eq(ext).children("a").attr("id");
				this.exts[id]=new External({
					master:this.master,
					parent:this,
					id:id,
					$dt:$ext.eq(ext),
					$dd:$ext.eq(ext).next("dd")
				});
			}			
		},
		scanExternals:function($selector, cleanup){
			var $el,
				id,
				found;
			var $ext = $selector.find("a[data-ext]");//gather ext
			if ($ext.length > 0) { //if there are ext
				for (var i = 0; i < $ext.length; i++) { //go through external links in page
					//page found something, match it
					$el=$ext.eq(i);
					id=$el.attr("data-ext");
					found=(typeof this.exts[id] !== "undefined")?this.exts[id]:false;
					if(found!==false){
						if(!cleanup){
							this.exts[id].generateInstance($el);
						}else{
							
							this.exts[id].cleanUpInstance($el);
						}
					}
				}
			}			
		},
		
/*---------------------------------------------------------------------------------------------
		-------------------------Glossary
---------------------------------------------------------------------------------------------*/			
		initGlossary:function(){
			//var $glossary=this.$data.find(".")
			var $el;
			var $glossary=this.$glossary.find("#glossaryIndex").children("li");
			var id;
			
			for (var gloss=0;gloss<$glossary.length;gloss++){
				$el=$glossary.eq(gloss).children("dl");
				id=$el.attr("id");
				
				this.glossaries[id]=new Glossary({
					master:this.master,
					parent:this,
					id:id,
					$el:$el
				});
			}
			
			

			
	
		},
		scanGlossary:function($selector, cleanup){
			var $el,
				id,
				found;
			var $glossary = $selector.find("a.csps-glossary");//gather ext
			if ($glossary.length > 0) { //if there are ext
				for (var i = 0; i < $glossary.length; i++) { //go through external links in page
					//page found something, match it
					$el=$glossary.eq(i);
					id=$el.attr("href").substring(1);
					found=(typeof this.glossaries[id] !== "undefined")?this.glossaries[id]:false;
					if(found!==false){
						if(!cleanup){
							this.glossaries[id].generateInstance($el);
						}else{
							
							this.glossaries[id].cleanUpInstance($el);
						}
					}
				}
			}			
		},
		getGlossary:function(id){

			//is it undefined
			if (typeof id ==="undefined"){

				//doesn'T exist, just send the whole damn thing already.
				return this.getGlossaryArray();
			}else{
				//then try to see if the thing exists
				if (typeof this.glossaries[id] !=="undefined"){
					//alright it exists, so just send it over.
					return this.glossaries[id];
				}else{
					//so it DOESN't exist. lets loop through it
					var list=this.getGlossaryArray();
					var term;
					var returnList= [];
					for(var i=0;i<list.length;i++){
						term=list[i].term;
						//console.log(term +" "+id);
						if(term.toLowerCase() === id.toLowerCase()){
							//perfect match
							return list[i];
						}else if (term.toLowerCase().includes(id.toLowerCase()) ){
							//contains
							returnList[returnList.length]=list[i];
						}
					}
					//if we got some partial matches
					if (returnList.length>0){
						return returnList;
					}else{
						//doesn'T exist, just send the whole damn thing already.
						return this.getGlossaryArray();
						
					}
				}
				
			}
			
		},
		getGlossaryArray:function(){
			var that=this;
			var returnList=[];
			if (typeof this.glossaries !=="undefined"){
				for(var item in this.glossaries){

					
					returnList[returnList.length]=that.getGlossary(item);

				}
				return returnList;
			}else{
				return false;
			}

		},
/*---------------------------------------------------------------------------------------------
		-------------------------Abbreviations
---------------------------------------------------------------------------------------------*/			
		initAbbr:function(){
			var $abbr=this.$data.find("#abbr-list").children("dt");
			var id;
			
			for (var abbr=0;abbr<$abbr.length;abbr++){
				id=$abbr.eq(abbr).text().toUpperCase();
				this.abbrs[id]=new Abbr({
					master:this.master,
					parent:this,
					id:id,
					$dt:$abbr.eq(abbr),
					$dd:$abbr.eq(abbr).next("dd")
				});
			}				
	
		},
		scanAbbr:function($selector, cleanup){
			var $el,
				id,
				found;
			var $abbr = $selector.find("abbr");//gather ext
			if ($abbr.length > 0) { //if there are ext
				for (var i = 0; i < $abbr.length; i++) { //go through external links in page
					//page found something, match it
					$el=$abbr.eq(i);
					id=$el.text().toUpperCase();
					
					found=(typeof this.abbrs[id] !== "undefined")?this.abbrs[id]:false;
					if(found!==false){
						if(!cleanup){
							this.abbrs[id].generateInstance($el);
						}else{
							
							this.abbrs[id].cleanUpInstance($el);
						}
					}
				}
			}			
		},
/*---------------------------------------------------------------------------------------------
		-------------------------SNIPPETS // CSPS-REPLACE
---------------------------------------------------------------------------------------------*/			
		initSnippets:function(){
			var $snippet=this.$data.find("[id]");
			var id;
			for (var snippet=0;snippet<$snippet.length;snippet++){
				id=$snippet.eq(snippet).attr("id");
				this.snippets[id]=new Snippet({
					master:this.master,
					parent:this,
					id:id,
					html:$snippet.eq(snippet).html()
				});
			}	
	
		},	
		scanSnippet:function($selector, cleanup){
			var $el,
				id,
				found;
			var $snippet = $selector.find("[data-csps-replace]");//gather ext
			if ($snippet.length > 0) { //if there are ext
				for (var i = 0; i < $snippet.length; i++) { //go through external links in page	
					//page found something, match it
					$el=$snippet.eq(i);
					id=$snippet.eq(i).attr("data-csps-replace");
					found=(typeof this.snippets[id] !== "undefined")?this.snippets[id]:false;
					
					if(found!==false){
						if(!cleanup){
							this.snippets[id].generateInstance($el);
						}else{
							this.snippets[id].cleanUpInstance($el);
						}
					}
				}
			}			
		},


	});
});