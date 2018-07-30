define(['jquery', 'settings-core'], function($, CoreSettings) {
   'use strict';
   
   //detect mobile
   var isMobile = (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))return true})(navigator.userAgent||navigator.vendor||window.opera);

   var $html = $('html');

   //CSPS-KR: quick fix to use globally since htmls have domready scripts
   window.lang = $html.attr("lang");

   var getIEVersion = function() {
      var rv = -1;
      var ua = navigator.userAgent;
      var re;
      if (navigator.appName == 'Microsoft Internet Explorer') {
         re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
         if (re.exec(ua) != null) {
            rv = parseFloat( RegExp.$1 );
         }
      } else if (navigator.appName == 'Netscape') {
         re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
         if (re.exec(ua) != null) {
            rv = parseFloat( RegExp.$1 );
         }
      }
      return rv;
   };
   
   //add IE class to html tag so that IE styling is possible
   var ieVersion = getIEVersion();
   if (ieVersion !== -1) {
      $html.addClass("ie" + ieVersion);
   }

   if (isMobile) {
      $html.addClass("mobile");
   } else {
      //interprete lower resolution as mobile on micro-learning mode
      //since we don't really have much space
      if (CoreSettings.enableMicroLearning && window.innerWidth <= 1280) {
         isMobile = true;
         $('html').removeClass('desktop').addClass('mobile');
      } else {
         $html.addClass("desktop");
      }
   }

   return {
      breakpoints: {
        xxsmall:  479,
        xsmall:   480,
        small:    768,
        medium:   992,
        large:    1200,
        xlarge:   1600
      },
      
      browser: {
         ieVersion: ieVersion
      },

      system: {
         isMobile: isMobile,
         events: {
            click: isMobile ? "tap" : "click",
            mousedown: isMobile ? "touchstart" : "mousedown",
            mousemove: isMobile ? "touchmove" : "mousemove",
            mouseup: isMobile ? "touchend" : "mouseup",
            mouseenter: isMobile ? "touchenter" : "mouseenter",
            mouseleave: isMobile ? "touchleave" : "mouseleave",
            taphold: "taphold",
            swipe: "swipe",
            swipeleft: "swipeleft",
            swiperight: "swiperight"
         }
      },

      lang: lang,

      //simple comparing a substring's aPosition (arrayThis) with a potential parent (arrayCompare)'s aPosition
      compareArrayDepth: function(arrayThis, arrayCompare) {
         var compareFlag = 1;
         for (var lvlsLoop = 0; lvlsLoop < arrayCompare.length; lvlsLoop++) {
            if (arrayThis[lvlsLoop] != arrayCompare[lvlsLoop]) {
               compareFlag = 0;
            }
         }
         return compareFlag;
      },
      arrays_equal: function(a, b) {
         return !(a < b || b < a);
      },
      //number added digits
      pad: function(n, width, z) {
         z = z || '0';
         n = n + '';
         return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      },
      //simple getting the array from the string. separated in in case it get more complicated.
      getArrayFromString: function(idString) {
         if(typeof idString !== "string"){
            return false;
         }
         //remove the first char "m" from the string
         var splitString = (idString.substring(1)).split('-');
         for (var aIndex = 0; aIndex < splitString.length; aIndex++) {
            splitString[aIndex] = parseInt(splitString[aIndex], 10);
         }
         return splitString;
      },
      getStringFromArray: function(array) {
         return "m" + array.toString().replace(/,/g , "-");
      },
      //send the object (h3 for example) and a new tagname (h2 for example) and it'll switch over, only class and id)
      tagSwitch: function(obj, newTag) {
         var classHTML = (typeof $(obj).attr("class") === "undefined") ? "" : "class='" + $(obj).attr("class") + "'";
         var idHTML = (typeof $(obj).attr("id") === "undefined") ? "" : "id='" + $(obj).attr("id") + "'";
         var oldTag = $(obj).prop("tagName");
         $(obj).after("<" + newTag + " " + idHTML + " " + classHTML + " class='old-" + oldTag + "'>" + $(obj).html() + "</" + newTag + ">");

         $(obj).remove();
      },

      //send an object collection and tag all the aria-posinset and aria-setsize
      setAriaSetsize: function(obj) {
         var setSize=obj.length;
         var setsizeIndex=0
         for (var set=0;set<setSize;set++){
            $(obj[set]).attr("aria-setsize", setSize);
            $(obj[set]).attr("aria-posinset", set+1);
            
         }

         return "banane";
      },

      /*---------------------------------------------------------------------------------------
                                         Error Handling functions
      ---------------------------------------------------------------------------------------*/

      testPageExists: function(pageUrl) {
         $.ajax(pageUrl, {
            statusCode: {
               404: function() {
                  $("#result1").html("not working");
                  return false;
               },
               200: function() {
                  $("#result1").html("working");
                  return true;
               }
            }
         });
      },

      queryString: function (name) {
         var url = location.href;
         name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
         var regexS = "[\\?&]"+name+"=([^&#]*)";
         var regex = new RegExp( regexS );
         var results = regex.exec( url );
         return results == null ? null : results[1];
      },

      showLoadingBox: function(callback, context) {
         //if undefined, grab the spinner direct child of body
         context = context || 'body >';
         var fastDuration = 200;
         $(CoreSettings.contentContainer).attr("aria-busy", "true");
         $(".spinner", context).fadeIn(fastDuration, function() {
            //quick transition just to mask all the positioning
            $('.loaded', context).addClass('loading').removeClass('loaded');
            if (_.isFunction(callback)) {
               callback();
            }
         });
      },
      //instead of passing a context param here
      //we just hide all the spinners
      hideLoadingBox: function(callback) {
         var slowDuration = 600;
         //CSPS-KR: TODO: make loading more layout specific...
         //each part of the layout should have its own loading process
         //e.g.: when top bar is ready, addClass('ready')
         //then when the app is loaded,
         //gather all .ready and addClass('animate') or addClass('reveal')
         //CSS should animate. .ready.animate { transition: all 1s ease; }
         $(".spinner:visible").fadeOut(slowDuration, function() {
            //give time to css to finish transition, then start the setTimeout
            $(".loading").addClass("loaded");
            setTimeout(function() {
               $(".loading").removeClass("loading");
               $(CoreSettings.contentContainer).attr("aria-busy", "false");
               if (_.isFunction(callback)) {
                  callback();
               }
            }, CoreSettings.loadingBoxTransitionSpeed - slowDuration);
         });
      }
   };
});