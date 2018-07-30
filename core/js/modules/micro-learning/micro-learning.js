define([
   'underscore',
   'jquery',
   'modules/BaseModule',
   'logger',
   'utils',
   'labels',
   'settings-core',
   'modules/tutorial/tutorial-controller',
   'fullpage',
   'scrollto'
], function(_, $, BaseModule, Logger, Utils, labels, CoreSettings, TutorialController) {
   'use strict';

   var MICRO_SETTINGS = CoreSettings.microLearning;
   //speed of section animation
   //1000ms so that all animations have time to finish fading in and out
   //see micro-section.scss $SECTION_ANIM_SPEED
   var SECTION_ANIM_SPEED = 1000;
   //500ms is explicable from the transition-duration in _animations.scss
   var FADE_OUT_SPEED = 500;
   var EFFECT_OFFSET = 0;
   //Interface toggle width (px)
   var interfaceToggleWidth = 1280;
   //Refresh needed warning delay (ms)
   var refreshWarningDelay = 2000;
   //Refresh needed timer object (winResize)
   var refreshTimer;

   return BaseModule.extend({
      events: {
         "keydown ul.toc": "onTOCKeyDown",
         "keydown .accordion": "onAccordionKeyDown"
      },

      initialize: function(options) {
         Logger.log("INIT: Micro-Learning");
         var that = this;
         this.options = options;

         this.router = this.options.router;

         this.isFirstModuleLoad = true;

         $('body').addClass('microModule');

         this.buildNav();
         
         this.$sections = $("section.micro-section");
         this.$header = $("header[role=banner]");
         this.$main = $("main[role=main]");
         this.$footer = $("footer");

         this.setupStage();

         if (!this.isMobile()) {
            this.initFullpage();
         } else {
            //animate instantly when we change slide on mobile
            //to remove confusion when moving fast
            SECTION_ANIM_SPEED = 0;
            //set the top margin to 90% of the height screen,
            //because of smaller screen size
            //sometimes with shorter sections, 
            //we want the next one to appear as soon as possible
            MICRO_SETTINGS.TOP_MARGIN = 0.9;
            Utils.hideLoadingBox(function() {
               that.onAfterLoad();
            });
         }

         this.setTheme();

         this.setEvents();

         this.onLoadScrollToHash();
      },

      setEvents: function() {
         var that = this;

         $(this).on("MicroLearning:destroy", _.bind(this.destroy, this));

         $(this.router).on('Router:loadPage', _.bind(this.destroy, this));

         //handle WET popups so that the scrolling and key arrows don't affect the usability of those
         $(".wb-lbx").on('mfpOpen', function(e) {
            that.disableScroll();
         }).on('mfpClose', function(e) {
            that.enableScroll();
         });

         if (this.isMobile()) {
            this.$main.on('scroll touchmove', _.bind(this.onMobileScroll, this));
            this.$toc.find('a').on('click', _.bind(this.onMenuItemsTouch, this));
            //grab the second menu. First one is the modules
            // a.k.a navigationMode: 1
            $('.mb-sm').eq(1).find('a').on('click', _.bind(this.onMenuItemsTouch, this));
         } /*else {
            $(window).on('resize', _.bind(this.onResize, this)); //CSPS-TD: Moved outside of mobile only scope, needed to determine if user resized good enough to warrant switch to desktop mode (refresh warning)
         }*/
         $(window).on('resize', _.bind(this.onResize, this)); //CSPS-TD: To be activated once things work on desktop mode
      },

      onFirstModuleLoad: function() {
         //not mobile, must have setting turned on, must be the first time a module is loaded
         if (!this.isMobile() && CoreSettings.enableTutorial && !masterStructure.isFirstTimeLoaded) {
            this.launchTutorial();
         }
      },

      launchTutorial: function() {
         this.disableScroll();
         var that = this;
         
         this.tutorialController = new TutorialController({
            tutorials: {
               showCanScroll: {
                  condition: this.$sections.length > 1
               }
            },
            afterTutorial: function() {
               that.enableScroll();
            }
         });
         //assign to masterStructure so that the flag can persist
         masterStructure.isFirstTimeLoaded = true;
      },

      buildNav: function() {
         var $sm = $(".supermenu-wrapper").find("ul.supermenu");
         //hide the supermenu since we won't use it
         $sm.addClass("wb-inv");

         //remove dupplicates just in case
         $('.micro-menu').remove();
         $('header[role=banner]').after("<section class='micro-menu col-md-3 col-sm-3 col-xs-3'><ul class='toc'></ul></section>");  //CSPS-TD- before>after
         
         this.$el = $('.micro-menu');
         var state = Utils.queryString('state');

         this.$toc = this.$el.find("ul.toc");
         
         var items = $sm.clone().find("a[data-target^="+ state +"]").parent();
         this.$toc.append(items);
         //CSPS-TD-Add proper role to menu container (ul.toc) + label
         this.$toc.attr("role",'menu').attr("aria-labelledby",'csps-modulenum');
         //CSPS-TD-Add proper role to navigation (section.micro-menu) + label
         this.$el.attr("role",'navigation').attr("aria-label",(window.lang == "en")?"Main Navigation":"Navigation primaire");
      },

      setupStage: function() {
         var $body = $('body');
         var headerHeight = this.$header.outerHeight();
         var footerHeight = this.$footer.outerHeight();
         var titleHeight = this.$header.find('#wb-sttl').outerHeight();

         this.$items = this.$toc.find('a');

         this.firstPageLoad = true;

         //accessibility. This is to be able to tab through the <ul>,
         //and then be able to navigate through the items
         this.$toc.attr('tabindex', '0');

         //position the navigation
         if (MICRO_SETTINGS.navPosition) {
            this.$toc.addClass(MICRO_SETTINGS.navPosition);
         }

         //put the navigation under the title
         if (!this.isMobile()) {
            this.$toc.css("margin-top", headerHeight + titleHeight); 
         }
         
         //CSPS-KR: commented since we are using the mocule-name instead
         // $('.breadcrumb').css('top', headerHeight);
         
         //make some space around for the header and the footer
         this.$el
            .css("padding-top", headerHeight)
            .css("padding-bottom", footerHeight);

         var topMargin = (this.isMobile() ? headerHeight + $('.breadcrumb').outerHeight() : headerHeight);
         //on mobile, the <main/> element scrolls instead of the body
         if (this.isMobile()) {
            this.$main.css({
               height: 'calc(100% - '+ topMargin +'px - '+ this.$footer.outerHeight() +'px)',
               width: 'calc(100% - '+ this.$el.outerWidth() +'px)',
               top: topMargin,
               'margin-left': this.$el.outerWidth() +'px'
            });
         }

         //set animation speed as a class.
         //the speed is actually controlled by CSS
         if (MICRO_SETTINGS.animationSpeed && _.isString(MICRO_SETTINGS.animationSpeed)) {
            $body.addClass(MICRO_SETTINGS.animationSpeed);
         }

         this.fixBacknext();
      },

      fixBacknext: function() {
         var $backnext = this.$footer.find('.backnext');
         //make sure that the backNext are on the right place
         //based on its surroundings
         if (!this.isMobile()) {
            this.$footer.find('.backnext').css({
               'top': this.$el.outerHeight(),
               'width': this.$el.width() + parseInt(this.$el.css('padding-left'), 10)
            });
         }
         //change the pagelbl to 'modules'
         //so that it makes more sense
         $backnext.find('> span').html(labels.vocab.modules);
      },

      initFullpage: function() {
         //check if the plugin is already instanciated
         if ($('html').hasClass('fp-enabled')) {
            $.fn.fullpage.destroy('all');
         }
         if ($('#fullpage').length === 0) {
            console.error("Option 'microLearning' is enabled but there is no element with an id '#fullpage' wrapping the content.");
            return;
         }

         var that = this;
         $('#fullpage').fullpage({
            menu: this.$el[0],
            //disable autoscroling on mobile as they use touch
            autoScrolling: !this.isMobile(),
            fitToSection: !this.isMobile(),
            //fixes weird behavior on mobile
            //when we have big section on scroll up,
            //the scroll will go to the bottom of the slide instead of top
            bigSectionsDestination: 'top',
            recordHistory: false,
            sectionSelector: this.$sections.selector,
            //we will center it manually
            verticalCentered: false,
            //refers to tabbing bug:   https://github.com/alvarotrigo/fullPage.js/issues/1237
            //NOTE: Incompatible with scrollOverflow option
            // scrollBar: true,
            //speed at which the sections transition
            scrollingSpeed: MICRO_SETTINGS.scrollingSpeed,
            //delay before the section is considered "transitioned" after scroll
            fitToSectionDelay: MICRO_SETTINGS.fitToSectionDelay,
            //in order to work with the WET 'slide' transition,
            //we must override this to something else,
            //else fullpage will think we want a slider...
            slideSelector: '.micro-section-slide',
            //triggered once the fullPage is loaded
            afterRender: function() {
               Utils.hideLoadingBox(function() {
                  that.onFirstModuleLoad();
               });
            },
            //triggered after each section load
            afterLoad: function(anchorLink, index, slideAnchor, slideIndex) {
               that.onAfterLoad(index);
            },
            onLeave: function(index, nextIndex, direction) {
               that.onLeave(nextIndex);
            }
         });
      },

      onAfterLoad: function(index) {
         //show the first section by default if none is provided
         index = _.isUndefined(index) ? 1 : index;
         var that = this;
         if (this.firstPageLoad) {
            this.currentNavPos = 0;
            this.targetNavPos = 0;
            this.animateSections();
            this.drawPathNav();
         }

         this.animateELements();
         
         this.firstPageLoad = false;
      },

      onLeave: function(nextIndex) {
         var that = this;
         //list is 0 based
         this.currentNavPos = nextIndex - 1;
         this.targetNavPos = nextIndex - 1;
         this.fadeOutElements();
         //give us time to fade out elements, then move section
         setTimeout(function() {
            that.animateSections();
            that.setTheme(nextIndex);
            that.onPageScroll();
         }, FADE_OUT_SPEED);
      },

      onLoadScrollToHash: function() {
         //add handler for mobile in case user has selected a link
         //that targets a section
         if (this.isMobile()) {
            if (window.location.hash) {
               var hash = window.location.hash.substr(1);
               this.$main.scrollTo('[data-anchor=' + hash + ']', {
                  onAfter: function(target, settings) {
                     //make sure that the component knows where it's at
                     that.onMobileScroll();
                  }
               });
            } else {
               //reset the scroll to the first section
               //to prevent cases where the user had scrolled before changing page.
               //This would have actually kept the user to the last scroll position,
               //which is not really intuitive.
               //This is mainly because the <main> element doesn't get populated like #dynamic_content.
               this.$main.scrollTo(0);
            }
         }
      },

      onMenuItemsTouch: function(e) {
         var that = this;
         var hash = e.target.hash.substr(1);
         this.$main.scrollTo('[data-anchor=' + hash + ']', "slow", {
            onAfter: function(target, settings) {
               //make sure that the component knows where it's at
               that.onMobileScroll();
            }
         });
      },

      setTheme: function(index) {
         //no need to set theme on mobile
         //since the header, footer and micro-menu will stay the same color,
         //we can simply style the odd-even sections.
         //also, mobile doesn't use fullpage
         //so there is no way of telling when the user has changed section
         //and even if there was, there would be a moment
         //where the next section wouldn't be styled until we actually change section
         if (!this.isMobile()) {
            //if no index was passed,
            //just take any value that would give us a remaining number on modulo
            //this will give us an odd number, and so themeOdd
            index = (_.isUndefined(index) ? 1 : index);
            var theme = (index % 2 !== 0 ? 'themeOdd' : 'themeEven');
            if (theme === $('body').attr('data-theme')) {
               return;
            }
            $('body').attr('data-theme', theme);
         }
      },

      enableScroll: function() {
         if (!this.isMobile()) {
            $.fn.fullpage.setAllowScrolling(true);
            $.fn.fullpage.setKeyboardScrolling(true);
         }
      },
      disableScroll: function() {
         if (!this.isMobile()) {
            $.fn.fullpage.setAllowScrolling(false);
            $.fn.fullpage.setKeyboardScrolling(false);
         }
      },

      /**
       * animate the sections with css3 by adding-removing classes
       */
      animateSections: function() {
         this.prevSlide = $(".micro-section.selected");
         this.currentSlide = $(this.$sections[this.currentNavPos]);

         this.prevSlide.removeClass("selected");
         this.currentSlide.removeClass("before after").addClass("selected active");
         this.currentSlide.prevAll(".micro-section").addClass("before").removeClass("after");
         this.currentSlide.nextAll(".micro-section").addClass("after").removeClass("before");
         /*CSPS-TD-Add proper aria-hidden values for assistive technologies*/
         $(".micro-section").attr("aria-hidden",'true');
         this.currentSlide.attr("aria-hidden",'false');
      },

      fadeOutElements: function() {
         //do not fade out elements on mobile
         //as the autoScrolling is off.
         //we want the elements to remain visible at all time
         if (!this.isMobile()) {
            this.prevSlide.removeClass("active");
         }
      },

      /**
       * Add .animate on the current section, which will trigger the css animations for each elements.
       * TODO: This could be a component on it's own... animate.js. 
       * It could be instantiated when needed on each module
       */
      animateELements: function() {
         var that = this;
         if (this.currentSlide) {
            if (this.currentSlide.prop('hasAnimated')) {
               //do not animate on mobile more than once
               return;
            }
            
            //do not fade out elements on mobile
            //as the autoScrolling is off
            if (!this.isMobile()) {
               setTimeout(function() {
                  //compare DOM elements as they don't change like jQuery objects
                  if (that.prevSlide && that.prevSlide[0] !== that.currentSlide[0]) {
                     that.$sections.not(that.currentSlide).removeClass("active animate");
                  }
               }, FADE_OUT_SPEED);
            }

            //make sure we are not waiting indefinately...
            if (EFFECT_OFFSET > SECTION_ANIM_SPEED) {
                EFFECT_OFFSET = SECTION_ANIM_SPEED;
            }

            setTimeout(function() {
               that.currentSlide.addClass("animate");
            }, SECTION_ANIM_SPEED - EFFECT_OFFSET);

            if (this.isMobile()) {
               this.currentSlide.prop('hasAnimated', true);
            }
         }
      },

      onResize: function(e) {
         if(!this.isMobile()){
            this.setupStage();
         }
         this.checkIfRefreshNeeded();
      },

      onPageScroll: function(e) {
         var $lis = this.$toc.find('li');
         var newPos = this.currentNavPos + 1 > $lis.length ? this.currentNavPos : this.currentNavPos + 1;
         var $item = this.$toc.find('li').eq(this.currentNavPos);
         this.syncPathNav($item);
      },

      //accessibility functions
      onAccordionKeyDown: function(e) {
         var tabKey = 9;
         var upKey = 38;
         var downKey = 40;

         if (e.which === downKey || e.which === upKey) {
            $.fn.fullpage.setKeyboardScrolling(false);
         } else if (e.which === tabKey) {
            $.fn.fullpage.setKeyboardScrolling(true);
         }
      },
      onTOCKeyDown: function(e) {
         var tabKey = 9;
         var upKey = 38;
         var downKey = 40;

         if (e.which === downKey || e.which === upKey) {
            //disable only key events since
            //since we do not want to block the normal user to scroll
            //when the button is active
            $.fn.fullpage.setKeyboardScrolling(false);
            var offset = (e.which === downKey) ? 1 : -1;
            this.updateCurrentNavPos(offset);
         } else if (e.which === tabKey) {
            //in case we go out of the menu, reset the focus position
            //reapply keyboard scrolling
            this.resetNavFocus();
            $.fn.fullpage.setKeyboardScrolling(true);
         }
      },
      resetNavFocus: function() {
         this.currentNavPos = null;
         this.targetNavPos = null;
      },
      setNavFocus: function() {
         this.currentNavPos = this.targetNavPos;
         $(this.$items[this.targetNavPos]).focus();
      },
      updateCurrentNavPos: function(offset) {
         if (_.isUndefined(this.currentNavPos) || _.isNull(this.currentNavPos)) {
            this.currentNavPos = 0;
            this.targetNavPos = 0;
         } else if (this.currentNavPos === 0 && offset < 0) {
            this.targetNavPos = this.$items.length - 1;
         } else if (this.currentNavPos === (this.$items.length - 1) && offset > 0) {
            this.targetNavPos = 0;
         } else {
            this.targetNavPos = this.currentNavPos + offset;
         }
         this.setNavFocus();
      },

      isMobile: function() {
         return Utils.system.isMobile;
      },

      //Progress Nav
      drawPathNav: function() {
         if (this.$toc.find('.toc-marker').length === 0) {
            this.$toc.prepend('<span class="toc-marker"></span>');
            this.$tocMarker = this.$toc.find('.toc-marker');

            //update the marker position based on the settings
            if (MICRO_SETTINGS.tocMarkerPosition) {
               this.$tocMarker.addClass(MICRO_SETTINGS.tocMarkerPosition);
            }
         }

         this.syncPathNav();
      },

      syncPathNav: function($target) {
         //if not provided, use the first one in list as DOM element
         $target = $target || this.$toc.find('li').eq(this.currentNavPos);
         
         var offsetTop = $target[0].offsetTop;
         var height = $target.outerHeight();

         var top = offsetTop + (height / 2);
         
         this.$toc.find('li').removeClass('active');
         $target.addClass('active');

         if (!this.isMobile()) {
            //toc-marker is hidden on mobile
            this.$tocMarker.css('top', top);
         }
      },

      onMobileScroll: function(e) {
         var windowHeight = $('main').outerHeight();
         var firstItemFound = null;

         this.$sections.each(function(index, item) {
            var targetBounds = item.getBoundingClientRect();
            if (firstItemFound === null && targetBounds.bottom > windowHeight * MICRO_SETTINGS.TOP_MARGIN && targetBounds.top < windowHeight * (1 - MICRO_SETTINGS.BOTTOM_MARGIN)) {
               firstItemFound = index + 1;
            }
         });

         this.onLeave(firstItemFound);
         this.onAfterLoad(firstItemFound);
      },

      checkIfRefreshNeeded: function(){
         //Check if 'mouse-tutorial' is currently displayed
         if($('body>div.tutorials').length){
            return false;
         }
         //Check if refresh warning should be displayed (according to isMobile(), window width and existence of refreshTimer)
         if((!this.isMobile() && $(window).width() <= interfaceToggleWidth && typeof refreshTimer === 'undefined') || (this.isMobile() && $(window).width()>interfaceToggleWidth && typeof refreshTimer === 'undefined')){
            //Start refresh timer if win width smaller/bigger than limit & timer doesn't already exist
            refreshTimer = setTimeout(this.refreshNeededWarning, refreshWarningDelay);
         }else if((!this.isMobile() && $(window).width()>interfaceToggleWidth && typeof refreshTimer !== 'undefined') || (this.isMobile() && $(window).width()<=interfaceToggleWidth && typeof refreshTimer !== 'undefined')){
            //Destroy refresh timer if it exists but win width big/small enough
            clearTimeout(refreshTimer);
            refreshTimer = undefined;
         }
      },

      refreshNeededWarning: function(){
         //Display warning that user should refresh for optimal experience (following window resize && || zoom)
         if (confirm(labels.nav.refreshNeeded) == true) {
            //Stop browser navigating away dialog from displaying
            window.amINavigating = true;
            location.reload();
         }
      },
      destroy: function() {
         //make sure the tutorials don't appear
         //after we changed to home page for instance
         clearTimeout(this.tutorialTimeout);
         this.$el.remove();
         $('body').removeClass('microModule')
                  .removeAttr('data-theme');
         if ($('html').hasClass('fp-enabled')) {
            $.fn.fullpage.destroy('all');
         }

         //reset main's css
         this.$main.removeAttr('style');
      }
   });
});