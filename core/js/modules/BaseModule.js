define([
   'underscore',
   'jquery',
   'settings-core',
   'helpers/BaseClass'
], function(_, $, CoreSettings, BaseClass) {
   'use strict';

   // Usage: var Module = BaseModule.extend({});
   // ...
   // var myModule = new Module({options});

   //Cached regex to split keys for 'delegate'
   var delegateEventSplitter = /^(\S+)\s*(.*)$/;

   var defaultOptions = {
      //providing a templateUrl here will return a template function on the class,
      //which can then be used to compile the template with the desired options.
      //the loading will be done by the BaseModule,
      //and will be done before the initialization of the module.
      //ASYNC.
      templateUrl: null,
      //template here must be applied through 'hbs!' plugin,
      //and will need to be loaded manually,
      //a.k.a. by defining it in the module dependencies
      //define('hbs!myTemplateUrl', function(Template) {});
      //NOT ASYNC.
      template: null,

      //object of selectors found in the el option
      ui: {},

      //base element for the view. This serves as a context for traversing the DOM.
      el: $(document),

      //can be either a function that returns an object, or just a plain object
      events: {}, // || events: function() {}
   };

   return BaseClass.extend({
      templateUrl: defaultOptions.templateUrl,
      template: defaultOptions.template,
      ui: defaultOptions.ui,
      el: defaultOptions.el,
      events: defaultOptions.events,

      //Base init.
      //This will be called *before* the init of the module extending this class
      //
      //Note: options here are attached from the Module instantiation. e.g.: new Module(options)
      __initialize: function(options) {
         var that = this;
         var args = arguments;
         //module id
         //creates a unique id for the module in case multiple
         //views are attached to the same DOM element.
         this.mid = _.uniqueId();

         options = options || {};
         this.options = options;

         this.__setElement();
         this.__wrapUI();
         this.__delegateEvents();

         this.__setupOnPageLoaded();

         this.__loadTemplate().done(function() {
            //template is done loading, we can now safely init the module
            if (_.isFunction(that.initialize)) {
                that.initialize.apply(that, args);
            }
            //check of the page to be loaded
            that.__onPageLoaded();
         });
      },

      //This listen to 'pageLoaded' event.
      //When intercepted, it checks if templateUrl is defined,
      //    if it is, call onPageLoaded when the templateIsLoaded
      //    if it's not, just call onPageLoaded     
      __setupOnPageLoaded: function() {
         var that = this;
         this._pageIsLoaded = false;

         if (_.isFunction(this.onPageLoaded)) {
            $(masterStructure).on("Framework:pageLoaded", function() {
               that._pageIsLoaded = true;
               //page is loaded but we need to wait until everything is done like template loading
               if (that.templateUrl) {
                  if (that._templateIsLoaded) {
					  that.__onPageLoaded();
                     
                  }
               } else {
                  that.__onPageLoaded();
               }
            });
         }
      },

      __loadTemplate: function() {
         var that = this;
         var $deferred = $.Deferred();

         if (this.templateUrl && _.isString(this.templateUrl)) {
             $.when(require(["hbs!" + this.templateUrl], function(Template) {
               that.template = Template;
               that._templateIsLoaded = true;
               $deferred.resolve();
            }));
         } else {
            $deferred.resolve();
         }

         return $deferred.promise();
      },

      //This checks if the pageIsLoaded, that there is a function param onPageLoaded
      //and that it has never been called before
      __onPageLoaded: function() {
         //if (!this.onPageLoadedCalled && _.isFunction(this.onPageLoaded) && this._pageIsLoaded) {
		 if (_.isFunction(this.onPageLoaded) && this._pageIsLoaded) {
           //this.onPageLoadedCalled = true;
            this.onPageLoaded();
         }
      },

      /**
       * renderTemplate is mainly used as a shortcut for public scripts,
       * in order to allow rendering through the contentContainer 
       * without allowing the user to access the core settings.
       * Handles functions and strings.
       * @param context: Object; Data to be sent to the template
       * @param execOptions: Object
       */
      renderTemplate: function(context, execOptions) {
         if (_.isFunction(this.template)) {
            if (!_.isNull(this.template) && !_.isUndefined(this.template)) {
               $(CoreSettings.contentContainer).html(this.template(context, execOptions));
            }
         } else if (_.isString(this.template)) {
            $(CoreSettings.contentContainer).html(this.template);
         }
      },

      render: function() {
         //allow chaining
         return this;
      },

      /*
       * Public method used in order to include data to the template
       */
      serializeData: function() {
         return {};
      },

      /*
       * Public method used in order to reset the jquery wrapping on the el
       */
      resetElement: function() {
         this.__setElement();
      },

      
      // Creates the `this.el` and `this.$el` references for this view using the
      // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
      // context or an element. Subclasses can override this to utilize an
      // alternative DOM manipulation API and are only required to set the
      // `this.el` property.
      __setElement: function() {
         this.$el = $(this.options.el).length ? $(this.options.el) : $(this.el);
         //element might not be on the DOM yet.
         this.el = this.$el[0] || this.$el.selector;
      },

      __wrapUI: function() {
         if (!_.isEmpty(this.ui)) {
            //always check from the cache as selectors have not been wrapped yet
            //make a copy without reference by strignify the object
            this.__cacheUI = this.__cacheUI || JSON.parse(JSON.stringify(this.ui));
            var that = this;
            _.each(this.__cacheUI, function(value, key) {
               value = value instanceof $ ? value.selector : value;
               that.ui[key] = that.$el.find(value);
            });
         }
      },

      /*
       * Public method used in order to re-wrap all selectors with jquery
       */
      resetUI: function() {
         this.__wrapUI();
      },

      // Set callbacks, where `this.events` is a hash of
      //
      // *{"event selector": "callback"}*
      //
      //     {
      //       'mousedown .title':  'edit',
      //       'click .button':     'save',
      //       'click .open':       function(e) { ... }
      //     }
      //
      // pairs. Callbacks will be bound to the view, with `this` set properly.
      // Uses event delegation for efficiency.
      // Omitting the selector binds the event to `this.el`.
      __delegateEvents: function(events) {
         events || (events = _.result(this, 'events'));
         if (!events) return this;
         this.__undelegateEvents();
         for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) method = this[method];
            if (!method) continue;
            var match = key.match(delegateEventSplitter);
            this.__delegate(match[1], match[2], _.bind(method, this));
         }
         return this;
      },

      // Add a single event listener to the view's element (or a child element
      // using `selector`). This only works for delegate-able events: not `focus`,
      // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
      __delegate: function(eventName, selector, listener) {
         this.$el.on(eventName + '.delegateEvents_' + this.mid, selector, listener);
         return this;
      },

      // Clears all callbacks previously bound to the view by `delegateEvents`.
      // You usually don't need to use this, but may wish to if you have multiple
      // views attached to the same DOM element.
      __undelegateEvents: function() {
         if (this.$el) this.$el.off('.delegateEvents_' + this.mid);
         return this;
      }
   });
});
