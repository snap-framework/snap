/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
// Modified from: 
// https://stackoverflow.com/questions/15050816/is-john-resigs-javascript-inheritance-snippet-deprecated
define(function() {

   // The base Class implementation (does nothing)
   function BaseClass(){}

    // Create a new Class that inherits from this class
   BaseClass.extend = function(props) {
      var _super = this.prototype;

      // Set up the prototype to inherit from the base class
      // (but without running the init constructor)
      var proto = Object.create(_super);

      // Copy the properties over onto the new prototype
      for (var name in props) {
         // Check if we're overwriting an existing function
         proto[name] = typeof props[name] == "function" &&
         typeof _super[name] == "function"
         ? (function(name, fn) {
            return function() {
               var tmp = this._super;

               // Add a new ._super() method that is the same method
               // but on the super-class
               // 
               // CSPS-KR: Commented since this is a silly
               // implementation of _super, and only exists when we are
               // extending the same function.
               // this._super = _super[name];

               // The method only need to be bound temporarily, so we
               // remove it when we're done executing
               var ret = fn.apply(this, arguments);
               this._super = tmp;

               return ret;
            };
         })(name, props[name])
         : props[name];
      }

      // The new constructor
      var newClass = typeof proto.__initialize === "function"
      ? proto.hasOwnProperty("__initialize")
        ? proto.__initialize // All construction is actually done in the init method
        : function SubClass(){ _super.__initialize.apply(this, arguments); }
      : function EmptyClass(){};

      // Populate our constructed prototype object
      newClass.prototype = proto;
      newClass.prototype._super = _super;

      // Enforce the constructor to be what we expect
      proto.constructor = newClass;

      // And make this class extendable
      newClass.extend = BaseClass.extend;

      return newClass;
   };

   return BaseClass;
});