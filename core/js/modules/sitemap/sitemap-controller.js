define([
   'underscore',
   'jquery',
   '../BaseModule',
   'logger',
   'utils',
   'labels',
   'settings-core'
], function(_, $, BaseModule, Logger, Utils, labels, CoreSettings) {
   'use strict';
   var sitemapID = "sitemap_pop";
   return BaseModule.extend({
      ui: { 
         sitemapBtn: ".top-menu .sitemap",
         sitemapContainer: "[data-id='"+sitemapID+"']"
      },
   
      templateUrl: "templates/sitemap/sitemap",

      initialize: function(options) {
         Logger.log("INIT: Sitemap Controller");

         this.options = options;
         this.subs = this.options.subs;

         this.router = this.options.router;

         this.setListeners();

         this.render();

         this.renderCompleted();
      },

      setListeners: function() {
         $(this).on("SitemapController:setModuleIndexHtml", _.bind(this.setModuleIndexHtml, this));
         $(this).on("SitemapController:updateViewed", _.bind(this.updateViewed, this));
      },

      serializeData: function() {
         return {
            sitemapID: sitemapID,
            subs: this.subs,
            CoreSettings: CoreSettings,
            //Start to header 3 (H3), because content will be outputed after a H2
            startingHeader: 3,
            labels: labels
         };
      },

      render: function() {
         this.tmpl = this.template(this.serializeData());
         //append the sitemap right in the body
         //this allows to keep track of viewed pages,
         //and also help populate the mod-index with the viewed pages
         //because magnificPopup removes the sitemap each time it closes...
         $('body').append(this.tmpl);
         this.resetUI();
         this.bindElements(this.ui.sitemapContainer);
         this.setMagnificPopupTemplate();

         this.setModuleIndexHtml();
      },

      bindElements: function(context) {
         var that = this;
         $("a.sitemap-page", context).off('click').on("click", function() {
            var $this = $(this);
            var position = $this.data("position");
            that.router.changePage(position);
            
            //do not follow links
            return false;
         });
         $('.wb-lbx').on("mfpAfterChange", function(e, mfp) {
            that.bindElements(mfp.contentContainer.find(that.ui.sitemapContainer.selector));
         });
      },

      setMagnificPopupTemplate: function() {
         this.ui.sitemapBtn.magnificPopup({
            items: { src: this.template(this.serializeData()) },
            type: 'inline'
         });
      },
      
      //called on page loaded
      setModuleIndexHtml: function() {
         var $modIndex = $(".mod-index");
         if ($modIndex.length && !$("#map_origin").length) {
            //currentNav[0]: get the root sub of the current nav so that we can target the whole section
            $modIndex.append(this.getModuleMapByIndex(masterStructure.currentNav[0]));
            this.bindElements($modIndex.selector);
         }
      },
      
      //returns html based on the index wanted
      getModuleMapByIndex: function(index) {
         var addHeading=($(".mod-index>h3").length>0)?"":"<h3 class='wb-inv'>"+$("[data-id='sitemodulemap_" + index+"']").prev().html()+"</h3>";
         return addHeading + "<ul id='map_origin' class='index-list'>" + $("[data-id='sitemodulemap_" + index+"']").html() + "</ul>";
      },

      //this will re-render the template based on the updated subs reference,
      //re-put the html in the body for the mod-index
      //and reset the magnificPopupTemplate
      updateViewed: function() {
         this.tmpl = this.template(this.serializeData());
         this.ui.sitemapContainer.html(this.tmpl);
         this.setMagnificPopupTemplate();
      },

      //Testing something
      renderCompleted: function (){
         if(CoreSettings.editMode){
            // console.log('->'+StructureObj)
            // console.log('-->'+masterStructure.editor.structure.doSomething())
         };
      }

   });
});